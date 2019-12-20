import axios from 'axios'
import uuid from 'uuid/v1'
import merge from 'lodash/fp/merge'
import chunk from 'lodash/fp/chunk'
import { CRYPTOCOMPARE_API_URL, CRYPTOCOMPARE_API_KEY } from '@/config'
import { buildApiUrl } from './_utils'

const fetch = async (urlParts, params, requestId) => {
  const url = buildApiUrl(CRYPTOCOMPARE_API_URL, urlParts, {
    api_key: CRYPTOCOMPARE_API_KEY,
    ...params,
  })
  const { data } = await axios.get(url, {
    requestId: requestId || uuid(),
  })
  return data
}

export default {
  async getPricemultifull (tsyms = [], fsyms = []) {
    // CryptoCompare allows for 300 char long query string. Tokens can be 4 string long + 1 for delimiter
    // We take safe number to split long queries into chunks and download them in parallel
    const fsymsChunkPrimises = chunk(60, fsyms)
      .map(fsymsChunk => fetch('pricemultifull', {
        tsyms: tsyms.join(','),
        fsyms: fsymsChunk.join(','),
      }))
    const { RAW } = (await Promise.all(fsymsChunkPrimises))
      .reduce((accumulator, current) => merge(accumulator, current), {})
    return RAW
  },
}
