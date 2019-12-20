import isUndefined from 'lodash/isUndefined'
import storage from '@/services/storage'
import { ORDER_MODE_MARKET } from './constants'

const state = () => ({
  isFiat: !isUndefined(storage.get('exchange/trading/isFiat'))
    ? storage.get('exchange/trading/isFiat')
    : false,
  orderMode: storage.get('exchange/trading/orderMode') || ORDER_MODE_MARKET,
  isBalance: false,
})

const mutations = {
  setOrderMode: (state, payload) => {
    state.orderMode = payload
    storage.set('exchange/trading/orderMode', payload)
  },
  setIsFiat: (state, payload) => {
    state.isFiat = payload
    storage.set('exchange/trading/isFiat', payload)
  },
  setIsBalance: (state, payload) => { state.isBalance = payload },
}

const actions = {
  setOrderMode ({ commit }, payload) {
    commit('setOrderMode', payload)
  },
  setIsFiat ({ commit }, payload) {
    commit('setIsFiat', payload)
  },
  toggleIsBalance ({ commit, state }, payload) {
    commit('setIsBalance', !state.isBalance)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
