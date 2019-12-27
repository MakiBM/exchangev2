import { BigNumber } from '0x.js'
import get from 'lodash/get'
import omit from 'lodash/omit'
import without from 'lodash/without'
import { getContractWrappers } from '@/services/contractWrappers'
import { getTxOpts } from '@/services/transaction'
import api from '@/services/api'
import storage from '@/services/storage'
import { getWeb3Wrapper } from '@/services/web3Wrapper'

const state = () => ({
  activeSymbol: undefined,
  allowancesTransactionsBySymbol: storage.get('exchange/allowances/allowancesTransactionsBySymbol') || {},
  allowancesTransactionsSorted: storage.get('exchange/allowances/allowancesTransactionsSorted') || [],
})

const getters = {
  transaction: state => {
    const { allowancesTransactionsBySymbol, activeSymbol } = state
    return get(allowancesTransactionsBySymbol, [activeSymbol], {})
  }
}

const mutations = {
  setActiveSymbol: (state, payload) => { state.activeSymbol = payload },
  setAllowancesTransactionsBySymbol: (state, payload) => {
    state.allowancesTransactionsBySymbol = payload
    storage.set('exchange/allowances/allowancesTransactionsBySymbol', payload)
  },
  setAllowancesTransactionsSorted: (state, payload) => {
    state.allowancesTransactionsSorted = payload
    storage.set('exchange/allowances/allowancesTransactionsSorted', payload)
  },
}

const actions = {
  async toggleAllowances ({ state, commit, dispatch, rootState }, symbol) {
    const { allowancesTransactionsBySymbol } = state
    const { assetsBySymbol } = rootState.exchange
    const { balancesAndAllowancesBySymbol, ethAccount } = rootState.exchange.wallet

    if (get(allowancesTransactionsBySymbol, [symbol, 'status']) === 'pending') return

    dispatch('setAllowancesTransaction', { status: 'beforeSign', symbol })
    commit('setActiveSymbol', symbol)
    await this.dispatch('exchange/wallet/updateBalances')
    try {
      const txOpts = await getTxOpts()
      const contractWrappers = await getContractWrappers()
      const tokenAddress = assetsBySymbol[symbol].contract_address
      const txHash = balancesAndAllowancesBySymbol[symbol].isUnlocked
        ? await contractWrappers.erc20Token.setProxyAllowanceAsync(tokenAddress, ethAccount, BigNumber(0), txOpts)
        : await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(tokenAddress, ethAccount, txOpts)
      const timestamp = Date.now()
      dispatch('setAllowancesTransaction', {
        status: 'pending',
        gasPrice: txOpts.gasPrice.toString(),
        txHash,
        timestamp,
        symbol,
      })
      dispatch('awaitTransaction', symbol)
    } catch (e) {
      dispatch('removeAllowancesTransaction', symbol)
    }
  },
  setAllowancesTransaction ({ commit, state }, payload) {
    const { allowancesTransactionsBySymbol, allowancesTransactionsSorted } = state
    const { symbol } = payload
    const transactionsBySymbol = { ...allowancesTransactionsBySymbol }
    transactionsBySymbol[symbol] = {
      ...get(transactionsBySymbol, [symbol], {}),
      ...payload,
    }
    commit('setAllowancesTransactionsBySymbol', transactionsBySymbol)
    const transactionsSorted = [ ...allowancesTransactionsSorted ]
    if (!transactionsSorted.includes(symbol)) transactionsSorted.unshift(symbol)
    commit('setAllowancesTransactionsSorted', transactionsSorted)
  },
  removeAllowancesTransaction ({ commit, state }, symbol) {
    const { allowancesTransactionsBySymbol, allowancesTransactionsSorted } = state
    commit('setAllowancesTransactionsBySymbol', omit(allowancesTransactionsBySymbol, symbol))
    commit('setAllowancesTransactionsSorted', without(allowancesTransactionsSorted, symbol))
  },

  async purgeAllowancesTransaction ({ dispatch, state }, symbols) {
    const { allowancesTransactionsBySymbol } = state
    for (const symbol of symbols) {
      const transaction = get(allowancesTransactionsBySymbol, [symbol], {})
      if (transaction.txHash) {
        const { data } = await api.getTransaction(transaction.txHash)
        const { block_id } = data
        if (block_id) dispatch('removeAllowancesTransaction', symbol)
        else {
          dispatch('awaitTransaction', symbol)
        }
      } else {
        dispatch('removeAllowancesTransaction', symbol)
      }
    }
  },

  async awaitTransaction ({ dispatch, state }, symbol) {
    const { allowancesTransactionsBySymbol } = state
    const transaction = allowancesTransactionsBySymbol[symbol]

    if (!transaction) return

    try {
      const web3Wrapper = await getWeb3Wrapper()
      const { status, gasUsed, blockNumber } = await web3Wrapper.awaitTransactionSuccessAsync(transaction.txHash)
      await this.dispatch('exchange/wallet/updateBalances')
      dispatch('setAllowancesTransaction', {
        status: status === 1 ? 'success' : 'failure',
        gasUsed,
        blockNumber,
        symbol,
      })
    } catch (e) {
      await this.dispatch('exchange/wallet/updateBalances')
      dispatch('setAllowancesTransaction', {
        status: 'failure',
        symbol,
      })
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
