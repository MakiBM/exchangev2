import { NETWORK_ID } from '@/config'
import storage from '@/services/storage'
import eventBus from '@/services/eventBus'
import { tokensToTokenBalances } from '@/services/tokens'
import { isMetamaskInstalled, initializeWeb3Wrapper, destroyWeb3Wrapper, getWeb3Wrapper } from '@/services/web3Wrapper'
import { WEB3STATE_ERROR, WEB3STATE_LOCKED, WEB3STATE_UNLOCKED, WEB3STATE_NOT_INSTALLED, WALLET_METAMASK } from './constants'

const state = () => ({
  wallet: storage.get('exchange/wallet/wallet') || undefined,
  web3State: undefined,
  ethAccount: undefined,
  ethBalance: undefined,
  balancesAndAllowancesBySymbol: {},
})

const getters = {}

const mutations = {
  reset: currentState => { Object.assign(currentState, state()) },
  setWallet: (state, payload) => {
    state.wallet = payload
    storage.set('exchange/wallet/wallet', payload)
  },
  setWeb3State: (state, payload) => { state.web3State = payload },
  setEthAccount: (state, payload) => { state.ethAccount = payload },
  setEthBalance: (state, payload) => { state.ethBalance = payload },
  setBalancesAndAllowancesBySymbol: (state, payload) => { state.balancesAndAllowancesBySymbol = payload },
}

const actions = {
  async init ({ dispatch, state }) {
    const { wallet } = state
    if (wallet === WALLET_METAMASK) dispatch('connectMetamask')

    eventBus.on('pairedSymbolsChanged', () => {
      dispatch('updateBalances')
    })
  },

  reset ({ commit }) {
    destroyWeb3Wrapper()
    commit('reset')
    // reset persisted data
    commit('setWallet', undefined)
  },

  async connectMetamask ({ commit, dispatch }) {
    commit('setWeb3State', WEB3STATE_LOCKED)
    try {
      const web3Wrapper = await initializeWeb3Wrapper()
      if (web3Wrapper) {
        const [ethAccount] = await web3Wrapper.getAvailableAddressesAsync()
        if (ethAccount) {
          commit('setEthAccount', ethAccount)
          dispatch('updateBalances')
          commit('setWeb3State', WEB3STATE_UNLOCKED)
          commit('setWallet', WALLET_METAMASK)
        }
        const networkId = await web3Wrapper.getNetworkIdAsync()
        if (networkId !== NETWORK_ID) commit('setWeb3State', WEB3STATE_ERROR)
      } else {
        if (isMetamaskInstalled()) commit('setWeb3State', WEB3STATE_LOCKED)
        else commit('setWeb3State', WEB3STATE_NOT_INSTALLED)
      }
    } catch (error) {
      // Web3Error
      console.error('There was an error when initializing the wallet', error)
      commit('setWeb3State', WEB3STATE_ERROR)
    }
  },

  async updateBalances ({ commit, state, rootState }) {
    const { ethAccount } = state
    const web3Wrapper = await getWeb3Wrapper()
    const ethBalance = await web3Wrapper.getBalanceInWeiAsync(ethAccount)
    commit('setEthBalance', ethBalance)
    const { assetsBySymbol, masterPairedSymbol, quotePairedSymbol } = rootState.exchange
    const { WETH, ZRX } = assetsBySymbol
    const master = assetsBySymbol[masterPairedSymbol]
    const quote = assetsBySymbol[quotePairedSymbol]
    const tokens = await tokensToTokenBalances([WETH, master, quote, ZRX], ethAccount)
    commit('setBalancesAndAllowancesBySymbol', tokens)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
