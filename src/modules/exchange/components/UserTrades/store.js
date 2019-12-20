import storage from '@/services/storage'

const state = () => ({
  activeTable: storage.get('exchange/userTrades/activeTable') || 'open',
})

const getters = {
  activeTable: state => state.activeTable,
}

const mutations = {
  setActiveTable: (state, payload) => {
    state.activeTable = payload
    storage.set('exchange/userTrades/activeTable', payload)
  },
}

const actions = {
  setActiveTable ({ commit }, payload) {
    commit('setActiveTable', payload)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
