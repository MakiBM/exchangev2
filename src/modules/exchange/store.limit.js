import get from 'lodash/get'
import eventBus from '@/services/eventBus'
import { submitOrder, getOrderConfigAsync } from '@/services/orders'
import { isNumeric } from '@/utils'

const state = () => ({
  marketsByPair: {},
})

const mutations = {
  setMarketsByPair: (state, payload) => { state.marketsByPair = payload },
}

const actions = {
  init ({ rootState, dispatch }) {
    eventBus.on('pairedSymbolsChanged', () => {
      const { quotePairedSymbol, masterPairedSymbol } = rootState.exchange
      const buyPair = `${quotePairedSymbol}/${masterPairedSymbol}`
      const sellPair = `${masterPairedSymbol}/${quotePairedSymbol}`
      dispatch('resetMarket', buyPair)
      dispatch('resetMarket', sellPair)
    })
  },

  resetMarket ({ commit, dispatch, state }, pair) {
    const { marketsByPair } = state
    const markets = { ...marketsByPair }
    markets[pair] = {}
    commit('setMarketsByPair', markets)
  },

  setMarketProps ({ commit, state }, payload) {
    const { marketsByPair } = state
    const { pair } = payload
    const markets = { ...marketsByPair }
    markets[pair] = {
      ...get(markets, [pair], {}),
      ...payload,
    }
    commit('setMarketsByPair', markets)
  },

  async setOrderConfig ({ dispatch, state, rootState }, pair) {
    try {
      const { amounts, timestamp } = state.marketsByPair[pair]
      const [takerSymbol, makerSymbol] = pair.split('/')
      const { ethAccount } = rootState.exchange.wallet

      if (!amounts || !isNumeric(amounts[makerSymbol]) || !isNumeric(amounts[takerSymbol])) {
        dispatch('setMarketProps', { pair, orderConfig: {} })
        return
      }

      const orderConfig = await getOrderConfigAsync({ takerSymbol, makerSymbol, timestamp, ethAccount, amounts })
      dispatch('setMarketProps', { pair, orderConfig })
    } catch (e) {
      dispatch('setMarketProps', { pair, orderConfig: {} })
      throw e
    }
  },

  async submitOrder ({ state, dispatch }, pair) {
    try {
      const { orderConfig } = state.marketsByPair[pair]
      await submitOrder(orderConfig)
      dispatch('resetMarket', pair)
    } catch (e) {
      dispatch('resetMarket', pair)
      throw e
    }
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
