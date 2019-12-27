import axios from 'axios'
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

// This should be loaded just once
let assets
export const getAssets = async () => {
  if (!assets) {
    assets = fetch('tokens')
  }
  const { data } = await assets
  return data
}

// This should be loaded just once
let assetPairs
export const getAssetPairs = async () => {
  if (!assetPairs) {
    assetPairs = fetch('asset_pairs')
  }
  const { data } = await assetPairs
  return data
}

export const getOrdersHistory = (params) => {
  return fetch('orders/history', {
    perPage: 40,
    ...params,
  })
}

export const getOrderbook = async (pair, params) => {
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
}

export const getTransaction = (txHash) => {
  return fetch(`transaction/id/${txHash}`, {
    locale_currency: store.state.preferredCurrencySymbol,
  })
}

export const getTransactionTransfers = (txHash) => {
  return fetch(`transaction/id/${txHash}/transfers`, {
    locale_currency: store.state.preferredCurrencySymbol,
  })
}
