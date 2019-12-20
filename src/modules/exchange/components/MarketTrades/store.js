import keyBy from 'lodash/fp/keyBy'
import sortBy from 'lodash/fp/sortBy'
import uniq from 'lodash/fp/uniq'
import take from 'lodash/fp/take'
import flow from 'lodash/flow'
import { w3cwebsocket as WebSocketClient } from 'websocket'
import get from 'lodash/get'
import difference from 'lodash/difference'
import uuid from 'uuid/v1'
import api from '@/services/api'
import eventBus from '@/services/eventBus'
import { WEBSOCKET_URL, MAINNET_ID, ERC20_ID } from '@/config'

const normalizeOrder = order => {
  order.time = order.time / 1000 // format to time in seconds
  return order
}

const perPage = 40

// We'll initialise socket in an action later
let socket
let gloablSocketNonce

const state = () => ({
  ordersByHash: {},
  ordersSorted: [],
  isLoading: false,
  currentPage: 1,
  nextPage: undefined,
})

const reinitState = state

const mutations = {
  reset: state => { Object.assign(state, reinitState()) },
  setOrdersByHash: (state, payload) => { state.ordersByHash = payload },
  setordersSorted: (state, payload) => { state.ordersSorted = payload },
  setIsLoading: (state, payload) => { state.isLoading = payload },
  setCurrentPage: (state, payload) => { state.currentPage = payload },
  setNextPage: (state, payload) => { state.nextPage = payload },
}

const actions = {
  init ({ dispatch }) {
    dispatch('getFirstPage')
    dispatch('connectSocket')

    eventBus.on('pairedSymbolsChanged', () => {
      dispatch('reset')
      dispatch('getFirstPage')
    })
  },

  reset ({ commit }) {
    commit('reset')
  },

  getFirstPage ({ dispatch }) {
    dispatch('getPage', 1)
  },

  getNextPage ({ dispatch, state }) {
    dispatch('getPage', state.nextPage)
  },

  async getPage ({ dispatch, rootState }, page) {
    dispatch('setIsLoading', true)
    const response = await api.getOrdersHistory({
      baseAssetAddress: rootState.exchange.assetsBySymbol[rootState.exchange.masterPairedSymbol].contract_address,
      quoteAssetAddress: rootState.exchange.assetsBySymbol[rootState.exchange.quotePairedSymbol].contract_address,
      page,
    })
    const { data, links } = response
    dispatch('setCurrentPage', page)
    dispatch('addOrders', data)
    dispatch('setNextPage', get(links, ['next', 'page']))
    dispatch('setIsLoading', false)
  },

  connectSocket ({ rootState, dispatch }) {
    gloablSocketNonce = new Object()
    const localSocketNonce = gloablSocketNonce

    // Close existing socket without throwing and reconnecting
    if (socket && socket.close) {
      socket.onclose = () => {}
      socket.close()
    }

    socket = new WebSocketClient(WEBSOCKET_URL)
    const socketConfig = {
      type: 'subscribe',
      channel: 'orderhistory',
      requestId: uuid(),
      payload: {
        baseAssetData: rootState.exchange.assetsBySymbol[rootState.exchange.masterPairedSymbol].asset_data_address,
        quoteAssetData: rootState.exchange.assetsBySymbol[rootState.exchange.quotePairedSymbol].asset_data_address,
        makerAssetProxyId: ERC20_ID,
        networkId: MAINNET_ID,
        feeRecipientAddress: 'all',
      },
    }

    socket.onerror = error => {
      dispatch('connectSocket')
      throw error
    }
    socket.onclose = error => {
      dispatch('connectSocket')
      throw error
    }
    socket.onopen = () => {
      socket.send(JSON.stringify(socketConfig))
    }
    socket.onmessage = message => {
      if ((localSocketNonce === gloablSocketNonce) && (message.data !== undefined)) {
        const data = JSON.parse(message.data)
        const { assetsByAddress, masterPairedSymbol, quotePairedSymbol } = rootState.exchange
        const orders = data.payload
        // TODO Socket config receives information on base and quote assets however it returns different pairs as well
        // We're checking against that here
        const currentPairOrders = orders.filter(order => {
          const makerAsset = assetsByAddress[order.maker_asset_address]
          const takerAsset = assetsByAddress[order.taker_asset_address]
          // Some assets are undefined in our asset dictionary. We need to avaid calling symbol property of undefined
          const incomingPairSymbols = [get(makerAsset, 'symbol'), get(takerAsset, 'symbol')]
          const currentPairSymbols = [masterPairedSymbol, quotePairedSymbol]
          return difference(incomingPairSymbols, currentPairSymbols).length === 0
        })
        if (currentPairOrders.length) dispatch('addOrders', currentPairOrders)
      }
    }
  },

  addOrders ({ commit, state }, payload) {
    const ordersByHash = {
      ...state.ordersByHash,
      ...keyBy('tx_hash', payload.map(normalizeOrder))
    }
    commit('setOrdersByHash', ordersByHash)

    const sortScenario = (hash) => ordersByHash[hash].time * -1 // invert number for desc order
    const transformRecords = flow([
      uniq, // drop duplicates
      sortBy(sortScenario), // sort
      take(state.currentPage * perPage) // take as many as pagination allows, we need to do that to stay in sync with websocket
    ])
    const ordersSorted = transformRecords([
      ...state.ordersSorted,
      ...payload.map(item => item.tx_hash)
    ])
    commit('setordersSorted', ordersSorted)
  },

  setIsLoading ({ commit }, payload) {
    commit('setIsLoading', payload)
  },

  setCurrentPage ({ commit }, payload) {
    commit('setCurrentPage', payload)
  },

  setNextPage ({ commit }, payload) {
    commit('setNextPage', payload)
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
