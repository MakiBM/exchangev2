import { BigNumber } from '0x.js'
import api from '@/services/api'
import storage from '@/services/storage'
import { getKnownTokens } from '@/services/tokens'
import { getContractWrappers } from '@/services/contractWrappers'
import { getWeb3Wrapper } from '@/services/web3Wrapper'
import { getTxOpts } from '@/services/transaction'

const state = () => ({
  isWrapping: true,
  amount: undefined,
  transaction: storage.get('exchange/wrap/transaction') || {},
})

const mutations = {
  setIsWrapping: (state, payload) => { state.isWrapping = payload },
  setAmount: (state, payload) => { state.amount = payload },
  setTransaction: (state, payload) => {
    state.transaction = payload
    storage.set('exchange/wrap/transaction', payload)
  },
}

const actions = {
  async purgeTransaction ({ dispatch, state }) {
    const { transaction } = state
    if (transaction.txHash) {
      const { data } = await api.getTransaction(transaction.txHash)
      const { block_id } = data
      if (block_id) dispatch('resetTransaction')
      else dispatch('awaitTransaction')
    } else {
      dispatch('resetTransaction')
    }
  },

  setTransaction ({ commit, state }, payload) {
    const { transaction } = state
    commit('setTransaction', {
      ...transaction,
      ...payload
    })
  },

  resetTransaction ({ commit }) {
    commit('setTransaction', {})
  },

  reset ({ dispatch, commit }) {
    dispatch('resetTransaction')
    commit('setAmount', undefined)
    commit('setIsWrapping', true)
  },

  async sendTransaction ({ state, dispatch, rootState }) {
    dispatch('setTransaction', { status: 'beforeSign' })
    try {
      const { amount, isWrapping } = state
      const { ethAccount } = rootState.exchange.wallet
      const amountToWrap = BigNumber(amount).multipliedBy('1e18').integerValue(BigNumber.ROUND_UP)
      const contractWrappers = await getContractWrappers()
      const tokens = await getKnownTokens()
      const method = isWrapping
        ? 'depositAsync'
        : 'withdrawAsync'
      const txOpts = await getTxOpts()
      const txHash = await contractWrappers.etherToken[method](tokens.bySymbol['WETH'].contract_address, amountToWrap, ethAccount, txOpts)
      const timestamp = Date.now()
      const gasPrice = txOpts.gasPrice.toString()
      dispatch('setTransaction', {
        status: 'pending',
        input: { amount, isWrapping },
        txHash,
        timestamp,
        gasPrice,
      })
      dispatch('awaitTransaction')
    } catch (e) {
      dispatch('reset')
      throw e
    }
  },

  async awaitTransaction ({ dispatch, state }) {
    try {
      const { transaction } = state
      if (!transaction) return
      const web3Wrapper = await getWeb3Wrapper()
      const { status, gasUsed, blockNumber } = await web3Wrapper.awaitTransactionSuccessAsync(transaction.txHash)
      await this.dispatch('exchange/wallet/updateBalances')
      // Transaction summary
      dispatch('setTransaction', {
        status: status === 1 ? 'success' : 'failure',
        gasUsed,
        blockNumber,
      })
    } catch (e) {
      dispatch('setTransaction', {
        status: 'failure',
      })
    }
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
