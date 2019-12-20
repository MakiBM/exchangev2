import Vue from 'vue'
import Vuex from 'vuex'
import storage from '@/services/storage'
import eventBus from '@/services/eventBus'
import exchange from '@/modules/exchange/store'
import { FIAT_SIGNS_BY_SYMBOL } from './constants'

Vue.use(Vuex)

const state = () => ({
  preferredCurrencySymbol: storage.get('preferredCurrencySymbol') || 'USD',
})

const getters = {
  preferredCurrencySign: state => FIAT_SIGNS_BY_SYMBOL[state.preferredCurrencySymbol],
}
const mutations = {
  setpreferredCurrencySymbol: (state, payload) => {
    state.preferredCurrencySymbol = payload
    storage.set('preferredCurrencySymbol', payload)
    eventBus.emit('preferredCurrencySymbolChanged')
  },
}

const actions = {
  setpreferredCurrencySymbol ({ commit }, payload) {
    commit('setpreferredCurrencySymbol', payload)
  },
}

export default new Vuex.Store({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    exchange,
  },
})
