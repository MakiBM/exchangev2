import deepmerge from 'deepmerge'
import get from 'lodash/get'
// Services
import api from '@/services/api'
import cryptocompare from '@/services/cryptocompare'
import storage from '@/services/storage'
import eventBus from '@/services/eventBus'
import { getKnownTokens } from '@/services/tokens'
// Modules
import wallet from './store.wallet'
import market from './store.market'
import limit from './store.limit'
import wrap from './store.wrap'
import allowances from './store.allowances'
import assetList from './components/AssetList/store'
import trading from './components/Trading/store'
import orderBook from './components/OrderBook/store'
import marketTrades from './components/MarketTrades/store'
import userTrades from './components/UserTrades/store'
import modalArea from './components/ModalArea/store'

const state = () => ({
  assetsBySymbol: {},
  assetsByAddress: {},
  assetsCryptoCompareInfo: {},
  masterPairedSymbol: storage.get('exchange/masterPairedSymbol') || 'USDC',
  quotePairedSymbol: storage.get('exchange/quotePairedSymbol') || 'WETH',
  quoteAssetsByMasterSymbol: {},
  isLoading: false,
})

const getters = {
  // Use this selector when you have asset `symbol` at hand
  assetsCryptoCompareInfoSelector: state => (asset, currency) => {
    const { assetsBySymbol } = state
    const assetCcsymbol = get(assetsBySymbol, [asset, 'ccsymbol'])
    const currencyCcsymbol = get(assetsBySymbol, [currency, 'ccsymbol'], currency)
    return get(state.assetsCryptoCompareInfo, [assetCcsymbol, currencyCcsymbol], {})
  },
  masterFiatPrice: (state, getters, rootState) => {
    return get(getters.assetsCryptoCompareInfoSelector(state.masterPairedSymbol, rootState.preferredCurrencySymbol), 'PRICE')
  },
  masterAsset: ({ assetsBySymbol, masterPairedSymbol }) => assetsBySymbol[masterPairedSymbol],
  quoteAsset: ({ assetsBySymbol, quotePairedSymbol }) => assetsBySymbol[quotePairedSymbol],
}

const mutations = {
  setAssetsBySymbol: (state, payload) => { state.assetsBySymbol = payload },
  setAssetsByAddress: (state, payload) => { state.assetsByAddress = payload },
  setAssetsCryptoCompareInfo: (state, payload) => { state.assetsCryptoCompareInfo = payload },
  setMasterPairedSymbol: (state, payload) => {
    state.masterPairedSymbol = payload
    storage.set('exchange/masterPairedSymbol', payload)
  },
  setQuotePairedSymbol: (state, payload) => {
    state.quotePairedSymbol = payload
    storage.set('exchange/quotePairedSymbol', payload)
    eventBus.emit('pairedSymbolsChanged')
  },
  setQuoteAssetsByMasterSymbol: (state, payload) => { state.quoteAssetsByMasterSymbol = payload },
  setIsLoading: (state, payload) => { state.isLoading = payload },
}

const actions = {
  async init ({ dispatch, state }) {
    try {
      dispatch('setIsLoading', true)
      await dispatch('getAssets')
      await dispatch('getQuoteAssetsByMasterSymbol')
      await dispatch('getAssetsCryptoCompareInfo', state.masterPairedSymbol)
      dispatch('setIsLoading', false)

      eventBus.on('preferredCurrencySymbolChanged', () => {
        dispatch('getAssetsCryptoCompareInfo', state.masterPairedSymbol)
      })
    } catch (error) {
      dispatch('setIsLoading', false)
      throw new Error('Exchange store module initialisation failed', error)
    }
  },

  setIsLoading ({ commit }, payload) {
    commit('setIsLoading', payload)
  },

  async getAssets ({ commit }) {
    const assets = await getKnownTokens()
    commit('setAssetsBySymbol', assets.bySymbol)
    commit('setAssetsByAddress', assets.byAddress)
  },

  async getQuoteAssetsByMasterSymbol ({ commit }) {
    const assets = await api.getQuoteAssetsByMasterSymbol()
    assets.USDC = ['WETH']
    commit('setQuoteAssetsByMasterSymbol', assets)
  },

  async getAssetsCryptoCompareInfo ({ commit, state, rootState }, masterSelected) {
    const { assetsCryptoCompareInfo, assetsBySymbol, quoteAssetsByMasterSymbol, masterPairedSymbol } = state
    const getCcsymbol = symbol => assetsBySymbol[symbol].ccsymbol
    const tsyms = [rootState.preferredCurrencySymbol, getCcsymbol(masterSelected)]
    const fsyms = ['ETH', 'ZRX', getCcsymbol(masterPairedSymbol), ...quoteAssetsByMasterSymbol[masterSelected].map(getCcsymbol)]
    const newAssetsCryptoCompareInfo = await cryptocompare.getPricemultifull(tsyms, fsyms)
    commit('setAssetsCryptoCompareInfo', deepmerge(assetsCryptoCompareInfo, newAssetsCryptoCompareInfo))
  },

  setMasterPairedSymbol ({ commit }, payload) {
    commit('setMasterPairedSymbol', payload)
  },

  setQuotePairedSymbol ({ commit }, payload) {
    commit('setQuotePairedSymbol', payload)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  modules: {
    assetList,
    trading,
    orderBook,
    marketTrades,
    userTrades,
    modalArea,
    wallet,
    market,
    limit,
    wrap,
    allowances,
  }
}
