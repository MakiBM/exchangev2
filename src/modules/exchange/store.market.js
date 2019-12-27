import { BigNumber } from '0x.js'
import uuid from 'uuid/v1'
import get from 'lodash/get'
import isUndefined from 'lodash/isUndefined'
import omit from 'lodash/omit'
import without from 'lodash/without'
import { toBaseUnit } from '@/filters'
import { getContractWrappers } from '@/services/contractWrappers'
import { getFillableRecords, getTxOpts, getTransactionFilledAmounts } from '@/services/transaction'
import { getOrderbook, getTransaction } from '@/services/api'
import storage from '@/services/storage'
import eventBus from '@/services/eventBus'
import { getWeb3Wrapper } from '@/services/web3Wrapper'
import { getKnownTokens } from '@/services/tokens'
import { PARTIAL_FILL } from '@/modules/exchange/components/ModalArea/constants'

let gloabalNonce

const state = () => ({
  marketsByPair: storage.get('exchange/market/marketsByPair') || {},
})

const mutations = {
  setMarketsByPair: (state, payload) => {
    state.marketsByPair = payload
    storage.set('exchange/market/marketsByPair', payload)
  },
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
    markets[pair] = {
      transactionsById: get(markets[pair], ['transactionsById'], {}),
      transactionsSorted: get(markets[pair], ['transactionsSorted'], []),
    }
    commit('setMarketsByPair', markets)
    dispatch('getMarketPrice', pair)
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

  setOrderAmount ({ dispatch }, payload) {
    const { pair, makerAmount, takerAmount } = payload
    const mode = makerAmount ? 'buy' : 'sell'
    if (isUndefined(takerAmount)) dispatch('setMarketProps', { pair, mode, makerAmount, takerAmount: undefined })
    if (isUndefined(makerAmount)) dispatch('setMarketProps', { pair, mode, takerAmount, makerAmount: undefined })
  },

  setTxStatus ({ dispatch }, payload) {
    const { pair, status } = payload
    dispatch('setMarketProps', { pair, status })
  },

  async getMarketPrice ({ dispatch }, pair) {
    const assetsBySymbol = (await getKnownTokens()).bySymbol
    const [makerAssetSymbol, takerAssetSymbol] = pair.split('/')
    const { data } = await getOrderbook(pair, { perPage: 1 })
    const record = data.asks.records[0]
    if (record) {
      const { makerAssetAmount, takerAssetAmount } = record.order
      const normalizedMakerAmount = BigNumber(makerAssetAmount).dividedBy(`1e${assetsBySymbol[makerAssetSymbol].decimals}`)
      const normalizedTakerAmount = BigNumber(takerAssetAmount).dividedBy(`1e${assetsBySymbol[takerAssetSymbol].decimals}`)
      const marketPrice = {
        [makerAssetSymbol]: normalizedMakerAmount.dividedBy(normalizedTakerAmount).toString(),
        [takerAssetSymbol]: normalizedTakerAmount.dividedBy(normalizedMakerAmount).toString(),
      }
      dispatch('setMarketProps', { pair, marketPrice })
    }
  },

  async setFillableRecords ({ dispatch, state }, pair) {
    const { marketsByPair } = state
    const assetsBySymbol = (await getKnownTokens()).bySymbol
    const [makerAssetSymbol, takerAssetSymbol] = pair.split('/')
    const makerAmount = get(marketsByPair, [pair, 'makerAmount'])
    const takerAmount = get(marketsByPair, [pair, 'takerAmount'])

    if (makerAmount === undefined && takerAmount === undefined) return

    dispatch('setMarketProps', { pair, fillableRecordsLoading: true })
    gloabalNonce = new Object()
    const localNonce = gloabalNonce
    const makerAssetFillAmount = makerAmount && toBaseUnit(makerAmount, assetsBySymbol[makerAssetSymbol].decimals)
    const takerAssetFillAmount = takerAmount && toBaseUnit(takerAmount, assetsBySymbol[takerAssetSymbol].decimals)
    const records = await getFillableRecords({
      makerAssetFillAmount,
      takerAssetFillAmount,
      makerAssetSymbol,
      takerAssetSymbol,
    })
    if (localNonce === gloabalNonce) {
      if (records) dispatch('setMarketProps', { pair, fillableRecords: records })
      else dispatch('setMarketProps', { pair, fillableRecords: [] })
      dispatch('setMarketProps', { pair, fillableRecordsLoading: false })
    }
  },

  setTransaction ({ dispatch, state, rootState }, payload) {
    const { pair, id } = payload
    const { marketsByPair } = state
    const market = marketsByPair[pair]
    const transactionsById = get(market, ['transactionsById'], {})
    const transactionsSorted = get(market, ['transactionsSorted'], [])
    transactionsById[id] = {
      ...get(market, ['transactionsById', id], {}),
      ...payload,
    }
    if (!transactionsSorted.includes(id)) transactionsSorted.unshift(id)
    dispatch('setMarketProps', { pair, transactionsById, transactionsSorted })

    // Filled amounts are set only when transaction is finished and summary is available.
    // We can now check if the filled amount satisfy user request. Show Patiall Fill modal otherwise.
    // TODO check if we're in order panels, we don't need it on get zrx modal
    const { filledAmounts } = payload
    const { quotePairedSymbol, assetsBySymbol } = rootState.exchange
    const { makerAmount, takerAmount } = marketsByPair[pair]
    const quoteToken = assetsBySymbol[quotePairedSymbol]
    const quoteAmount = BigNumber(makerAmount || takerAmount).multipliedBy(`1e${quoteToken.decimals}`)
    if (filledAmounts && BigNumber(filledAmounts[quotePairedSymbol]).isLessThan(quoteAmount)) {
      this.dispatch('exchange/modalArea/addOpenedModal', {
        id: PARTIAL_FILL,
        component: 'ModalPartialFill',
        data: {
          transaction: JSON.parse(JSON.stringify(transactionsById[id])),
          market: JSON.parse(JSON.stringify(market)),
        },
      })
    }
  },

  removeTransaction ({ dispatch, state }, payload) {
    const { pair, id } = payload
    const { marketsByPair } = state
    const market = marketsByPair[pair]
    const transactionsById = omit(get(market, 'transactionsById', {}), id)
    const transactionsSorted = without(get(market, 'transactionsSorted', []), id)
    dispatch('setMarketProps', { pair, transactionsById, transactionsSorted })
  },

  purgeTransactions ({ dispatch, state }, pair) {
    const { marketsByPair } = state
    const market = marketsByPair[pair]
    const transactionsById = get(market, ['transactionsById'], {})
    const transactionsSorted = get(market, ['transactionsSorted'], [])
    transactionsSorted.forEach(async id => {
      const transaction = transactionsById[id]
      if (transaction.txHash) {
        const { data } = await getTransaction(transaction.txHash)
        const { block_id } = data
        if (block_id) dispatch('removeTransaction', { pair, id })
        else dispatch('awaitTransaction', { pair, id })
      } else {
        dispatch('removeTransaction', { pair, id })
      }
    })
  },

  async sendTransaction ({ state, dispatch, rootState }, pair) {
    await dispatch('setFillableRecords', pair) // grab fresh list right before submission
    const id = uuid()
    dispatch('setTransaction', { pair, id, status: 'beforeSign' })
    const takerAssetSymbol = pair.split('/')[1]
    const { marketsByPair } = state
    const markets = { ...marketsByPair }
    const { fillableRecords } = markets[pair]
    const makerAmount = get(markets, [pair, 'makerAmount'])
    const takerAmount = get(markets, [pair, 'makerAmount'])
    const takerAssetFillAmounts = fillableRecords.map(rec => BigNumber(rec.fillData.fillAmount[takerAssetSymbol]))
    const contractWrappers = await getContractWrappers()
    const signedOrders = fillableRecords.map(record => record.order)
    const takerAddress = rootState.exchange.wallet.ethAccount
    try {
      const txOpts = await getTxOpts()
      const txHash = await contractWrappers.exchange.batchFillOrdersAsync(signedOrders, takerAssetFillAmounts, takerAddress, txOpts)
      const timestamp = Date.now()
      const gasPrice = txOpts.gasPrice.toString()
      dispatch('setTransaction', {
        status: 'pending',
        input: { fillableRecords, makerAmount, takerAmount },
        pair,
        id,
        txHash,
        timestamp,
        gasPrice,
      })
      dispatch('awaitTransaction', { pair, id })
    } catch (e) {
      dispatch('resetMarket', pair)
      dispatch('removeTransaction', { pair, id })
      throw e
    }
  },

  async awaitTransaction ({ dispatch, state, rootState }, payload) {
    const { pair, id } = payload
    const { marketsByPair } = state
    const { transactionsById } = marketsByPair[pair]
    const transaction = transactionsById[id]

    if (!transaction) return

    try {
      const web3Wrapper = await getWeb3Wrapper()
      const { status, gasUsed, blockNumber } = await web3Wrapper.awaitTransactionSuccessAsync(transaction.txHash)
      if (status) {
        const filledAmounts = await getTransactionFilledAmounts(transaction.txHash)
        dispatch('setTransaction', { pair, id, filledAmounts })
      }
      await this.dispatch('exchange/wallet/updateBalances')
      // Transaction summary
      dispatch('setTransaction', {
        status: status === 1 ? 'success' : 'failure',
        pair,
        id,
        gasUsed,
        blockNumber,
      })
    } catch (e) {
      dispatch('setTransaction', {
        status: 'failure',
        pair,
        id,
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
