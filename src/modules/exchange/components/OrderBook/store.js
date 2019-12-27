import { orderHashUtils, BigNumber } from '0x.js'
import keyBy from 'lodash/fp/keyBy'
import sortBy from 'lodash/fp/sortBy'
import take from 'lodash/fp/take'
import uniq from 'lodash/uniq'
import flow from 'lodash/flow'
import get from 'lodash/get'
import api from '@/services/api'
import eventBus from '@/services/eventBus'
import { toHumanUnit } from '@/filters'

const perPage = 40

const state = () => ({
  buyOrdersByHash: {},
  buyOrdersSorted: [],
  buyOrdersSelected: [],
  buyOrdersTotal: undefined,
  buyOrdersVolume: undefined,
  buyOrdersSums: [],
  sellOrdersByHash: {},
  sellOrdersSorted: [],
  sellOrdersSelected: [],
  sellOrdersTotal: undefined,
  sellOrdersVolume: undefined,
  sellOrdersSums: [],
  isLoading: false,
  currentPage: 1,
  nextPage: undefined,
})

const getters = {
  buyOrdersPaged: state => take(state.currentPage * perPage, state.buyOrdersSorted),
  buyOrdersBestPrice: state => get(state.buyOrdersByHash, [state.buyOrdersSorted[0], 'metaData', 'masterPrice']),
  sellOrdersPaged: state => take(state.currentPage * perPage, state.sellOrdersSorted),
  sellOrdersBestPrice: state => get(state.sellOrdersByHash, [state.sellOrdersSorted[0], 'metaData', 'masterPrice']),
}

const reinitState = state
const mutations = {
  reset: state => { Object.assign(state, reinitState()) },
  setBuyOrdersByHash: (state, payload) => { state.buyOrdersByHash = payload },
  setBuyOrdersSorted: (state, payload) => { state.buyOrdersSorted = payload },
  setBuyOrdersSelected: (state, payload) => { state.buyOrdersSelected = payload },
  setBuyOrdersTotal: (state, payload) => { state.buyOrdersTotal = payload },
  setBuyOrdersVolume: (state, payload) => { state.buyOrdersVolume = payload },
  setBuyOrdersSums: (state, payload) => { state.buyOrdersSums = payload },
  setSellOrdersByHash: (state, payload) => { state.sellOrdersByHash = payload },
  setSellOrdersSorted: (state, payload) => { state.sellOrdersSorted = payload },
  setSellOrdersSelected: (state, payload) => { state.sellOrdersSelected = payload },
  setSellOrdersTotal: (state, payload) => { state.sellOrdersTotal = payload },
  setSellOrdersVolume: (state, payload) => { state.sellOrdersVolume = payload },
  setSellOrdersSums: (state, payload) => { state.sellOrdersSums = payload },
  setIsLoading: (state, payload) => { state.isLoading = payload },
  setCurrentPage: (state, payload) => { state.currentPage = payload },
  setNextPage: (state, payload) => { state.nextPage = payload },
}

const actions = {
  init ({ dispatch }) {
    dispatch('getFirstPage')

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
    const { masterPairedSymbol, quotePairedSymbol } = rootState.exchange
    dispatch('setCurrentPage', page)
    dispatch('setIsLoading', true)
    // Fetch buy and fetch orders separately so we get trade side orders through `asks` which guarantees
    // correct sort. We need to have things sorted from response especially for paginated results
    const sellBook = await api.getOrderbook(`${quotePairedSymbol}/${masterPairedSymbol}`, { perPage, page })
    dispatch('addSellOrders', sellBook.data.asks.records)
    dispatch('setSellOrdersTotal', sellBook.data.asks.total)
    dispatch('setSellOrdersVolume', sellBook.data.asks_volume)
    const buyBook = await api.getOrderbook(`${masterPairedSymbol}/${quotePairedSymbol}`, { perPage, page })
    dispatch('addBuyOrders', buyBook.data.asks.records)
    dispatch('setBuyOrdersTotal', buyBook.data.asks.total)
    dispatch('setBuyOrdersVolume', buyBook.data.asks_volume)
    dispatch('setNextPage', get(buyBook.links, ['next', 'page']))
    dispatch('setIsLoading', false)
  },

  setCurrentPage ({ commit }, payload) {
    commit('setCurrentPage', payload)
  },

  setNextPage ({ commit }, payload) {
    commit('setNextPage', payload)
  },

  setIsLoading ({ commit }, payload) {
    commit('setIsLoading', payload)
  },

  addBuyOrders ({ dispatch, state }, records) {
    dispatch('addRecords', {
      recordsByHash: state.buyOrdersByHash,
      recordsSorted: state.buyOrdersSorted,
      setRecordsByHash: 'setBuyOrdersByHash',
      setRecordsSorted: 'setBuyOrdersSorted',
      records,
    })
    dispatch('setBuyOrdersSums')
  },

  addSellOrders ({ dispatch, state }, records) {
    dispatch('addRecords', {
      recordsByHash: state.sellOrdersByHash,
      recordsSorted: state.sellOrdersSorted,
      setRecordsByHash: 'setSellOrdersByHash',
      setRecordsSorted: 'setSellOrdersSorted',
      records,
    })
    dispatch('setSellOrdersSums')
  },

  addRecords ({ commit, rootState }, payload) {
    const { masterPairedSymbol, quotePairedSymbol } = rootState.exchange
    const { records, recordsByHash, recordsSorted, setRecordsByHash, setRecordsSorted } = payload

    const extendedRecords = records.map(rec => {
      const { makerAsset, takerAsset } = rec.metaData
      const masterAsset = (makerAsset.symbol === masterPairedSymbol) ? makerAsset : takerAsset
      const quoteAsset = (makerAsset.symbol === quotePairedSymbol) ? makerAsset : takerAsset
      rec.metaData = {
        ...rec.metaData,
        hash: orderHashUtils.getOrderHashHex(rec.order),
        masterPrice: new BigNumber(toHumanUnit(masterAsset.remainingFillableAmount, masterAsset.decimals))
          .div(toHumanUnit(quoteAsset.remainingFillableAmount, quoteAsset.decimals))
          .toFixed(parseInt(masterAsset.decimals), BigNumber.ROUND_UP),
        masterAsset,
        quoteAsset,
      }
      return rec
    })

    const newRecordsByHash = {
      ...recordsByHash,
      ...keyBy('metaData.hash', extendedRecords)
    }
    commit(setRecordsByHash, newRecordsByHash)

    const sortScenario = hash => newRecordsByHash[hash].metaData.tradePrice
    const transformRecords = flow([
      uniq, // drop duplicates
      sortBy(sortScenario), // sort
    ])
    const newRecordsSorted = transformRecords([
      ...recordsSorted,
      ...extendedRecords.map(rec => rec.metaData.hash)
    ])
    commit(setRecordsSorted, newRecordsSorted)
  },

  setBuyOrdersSums ({ commit, state }) {
    const { buyOrdersSorted, buyOrdersByHash } = state
    const buyOrdersSums = buyOrdersSorted.reduce((acc, hash, i) => {
      const curr = new BigNumber(buyOrdersByHash[hash].metaData.masterAsset.remainingFillableAmount)
      if (i === 0) acc.push(curr)
      else acc.push(new BigNumber(acc[i - 1]).plus(curr))
      return acc
    }, [])
    commit('setBuyOrdersSums', buyOrdersSums)
  },

  setSellOrdersSums ({ commit, state }) {
    const { sellOrdersSorted, sellOrdersByHash } = state
    const sellOrdersSums = sellOrdersSorted.reduce((acc, hash, i) => {
      const curr = new BigNumber(sellOrdersByHash[hash].metaData.masterAsset.remainingFillableAmount)
      if (i === 0) acc.push(curr)
      else acc.push(new BigNumber(acc[i - 1]).plus(curr))
      return acc
    }, [])
    commit('setSellOrdersSums', sellOrdersSums)
  },

  setBuyOrdersTotal ({ commit }, payload) {
    commit('setBuyOrdersTotal', payload)
  },

  setBuyOrdersVolume ({ commit }, payload) {
    commit('setBuyOrdersVolume', payload)
  },

  setSellOrdersTotal ({ commit }, payload) {
    commit('setSellOrdersTotal', payload)
  },

  setSellOrdersVolume ({ commit }, payload) {
    commit('setSellOrdersVolume', payload)
  },

  setBuyOrdersSelected ({ commit }, payload) {
    commit('setBuyOrdersSelected', payload)
  },

  setSellOrdersSelected ({ commit }, payload) {
    commit('setSellOrdersSelected', payload)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
