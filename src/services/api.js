import axios from 'axios'
import get from 'lodash/get'
import uuid from 'uuid/v1'
import parse from 'parse-link-header'
import { API_URL } from '@/config'
import { getKnownTokens } from '@/services/tokens'
import { buildApiUrl } from './_utils'
import store from '@/store'

const pendingRequestsByUrl = {}

const request = async (urlParts, params, method) => {
  const url = buildApiUrl(API_URL, urlParts, params)
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  if (pendingRequestsByUrl[url]) pendingRequestsByUrl[url].cancel()
  pendingRequestsByUrl[url] = source
  const { data, headers } = await axios.get(url, {
    requestId: uuid(),
    method,
    cancelToken: source.token,
  })
  delete pendingRequestsByUrl[url]
  const links = headers && headers.link ? parse(headers.link) : {}
  const total = headers['x-page-total'] ? headers['x-page-total'] : null
  return {
    total,
    links,
    data,
  }
}

const fetch = (urlParts, params) => request(urlParts, params, 'get')
// const post = (urlParts, params) => request(urlParts, params, 'post')

export default {
  async getAssets () {
    const { data } = await fetch('tokens')
    return data
  },

  async getQuoteAssetsByMasterSymbol () {
    const { data } = await fetch('asset_pairs')
    const quoteAssetsByMaster = {}
    for (const { assetDataA, assetDataB } of data.records) {
      quoteAssetsByMaster[assetDataA.symbol] = get(quoteAssetsByMaster, [assetDataA.symbol], [])
      quoteAssetsByMaster[assetDataA.symbol].push(assetDataB.symbol)
    }
    return quoteAssetsByMaster
  },

  getOrdersHistory (params) {
    return fetch('orders/history', {
      perPage: 40,
      ...params,
    })
  },

  async getOrderbook (pair, params) {
    const [baseAssetSymbol, quoteAssetSymbol] = pair.split('/')
    const knownTokens = await getKnownTokens()
    return fetch('orderbook', {
      perPage: 40,
      page: 1,
      feeRecipientAddress: 'all',
      baseAssetData: knownTokens.bySymbol[baseAssetSymbol].asset_data_address,
      quoteAssetData: knownTokens.bySymbol[quoteAssetSymbol].asset_data_address,
      ...params,
    })
  },

  getTransaction (txHash) {
    return fetch(`transaction/id/${txHash}`, {
      locale_currency: store.state.preferredCurrencySymbol,
    })
  },

  getTransactionTransfers (txHash) {
    return fetch(`transaction/id/${txHash}/transfers`, {
      locale_currency: store.state.preferredCurrencySymbol,
    })
  },
}
