import storage from '@/services/storage'

const state = () => ({
  mastersSorted: ['WETH', 'DAI', 'USDC'], // Predefined masters
  masterSelected: '',
  showAssetFavs: storage.get('exchange/assetList/showAssetFavs') || false,
  showAssetList: storage.get('exchange/assetList/showAssetList') || true,
  favsByMaster: storage.get('exchange/assetList/favsByMaster') || {},
  assetListSort: storage.get('exchange/assetList/assetListSort') || { col: 'Symbol', type: 'asc' },
})

const mutations = {
  setMasterSelected: (state, payload) => { state.masterSelected = payload },
  setShowAssetFavs: (state, payload) => {
    state.showAssetFavs = payload
    storage.set('exchange/assetList/showAssetFavs', payload)
  },
  setShowAssetList: (state, payload) => {
    state.showAssetList = payload
    storage.set('exchange/assetList/showAssetList', payload)
  },
  setFavsByMaster: (state, payload) => {
    state.favsByMaster = payload
    storage.set('exchange/assetList/favsByMaster', payload)
  },
  setAssetListSort: (state, payload) => {
    state.assetListSort = payload
    storage.set('exchange/assetList/assetListSort', payload)
  },
}

const actions = {
  init ({ dispatch, rootState }) {
    dispatch('setMasterSelected', rootState.exchange.masterPairedSymbol)
  },
  setMasterSelected ({ commit }, payload) {
    commit('setMasterSelected', payload)
  },
  toggleShowAssetFavs ({ commit, state }) {
    commit('setShowAssetFavs', !state.showAssetFavs)
  },
  toggleShowAssetList ({ commit, state }) {
    commit('setShowAssetList', !state.showAssetList)
  },
  setFavsByMaster ({ commit, state }, { masterSymbol, favSymbol }) {
    const newFavsByMaster = {
      ...state.favsByMaster,
      [masterSymbol]: [...(state.favsByMaster[masterSymbol] || [])]
    }
    newFavsByMaster[masterSymbol] = (newFavsByMaster[masterSymbol].includes(favSymbol))
      ? newFavsByMaster[masterSymbol].filter(symbol => symbol !== favSymbol)
      : [...newFavsByMaster[masterSymbol], favSymbol]
    commit('setFavsByMaster', newFavsByMaster)
  },
  setAssetListSort ({ commit, state }, label) {
    const { assetListSort } = state
    const newSort = {
      col: label,
      type: assetListSort.col === label && assetListSort.type === 'asc'
        ? 'desc'
        : 'asc'
    }
    commit('setAssetListSort', newSort)
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
