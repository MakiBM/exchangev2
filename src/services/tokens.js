import { assetDataUtils } from '0x.js'
import keyBy from 'lodash/fp/keyBy'
import map from 'lodash/fp/map'
import omit from 'lodash/fp/omit'
import flattenDeep from 'lodash/flattenDeep'
import flow from 'lodash/flow'
import get from 'lodash/get'
import assign from 'lodash/fp/assign'
import toArray from 'lodash/toArray'
import { getContractWrappers } from './contractWrappers'
import { getAssetPairs } from './api'

let knownTokens
export const getKnownTokens = async () => {
  if (!knownTokens) {
    const assetPairs = await getAssetPairs()
    const assetPairsToTokens = flow([
      map(toArray),
      flattenDeep,
      map(flow([
        token => assign(token, {
          contract_address: assetDataUtils.decodeERC20AssetData(token.assetData).tokenAddress,
          asset_data_address: token.assetData,
          decimals: token.precision,
        }),
        omit(['assetData', 'precision'])
      ])),
    ])
    const tokens = assetPairsToTokens(assetPairs.records)
    knownTokens = {
      bySymbol: keyBy('symbol', tokens),
      byAddress: keyBy('contract_address', tokens),
    }
  }
  return knownTokens
}

export const getQuoteAssetsByMasterSymbol = async () => {
  const data = await getAssetPairs()
  const quoteAssetsByMaster = {}
  for (const { assetDataA, assetDataB } of data.records) {
    quoteAssetsByMaster[assetDataA.symbol] = get(quoteAssetsByMaster, [assetDataA.symbol], [])
    quoteAssetsByMaster[assetDataA.symbol].push(assetDataB.symbol)
  }
  return quoteAssetsByMaster
}

export const tokensToTokenBalances = async (tokens, ethAccount) => {
  const contractWrappers = await getContractWrappers()
  const assetDatas = tokens.map(t => assetDataUtils.encodeERC20AssetData(t.contract_address))
  const balancesAndAllowances = await contractWrappers.orderValidator.getBalancesAndAllowancesAsync(
    ethAccount,
    assetDatas,
  )
  const tokenBalances = balancesAndAllowances.map((b, i) => ({
    token: tokens[i],
    balance: b.balance,
    isUnlocked: b.allowance.isGreaterThan(0),
  }))
  return keyBy('token.symbol', tokenBalances)
}
