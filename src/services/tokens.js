import { assetDataUtils } from '0x.js'
import keyBy from 'lodash/fp/keyBy'
import { getContractWrappers } from './contractWrappers'
import api from './api'

let knownTokens
export const getKnownTokens = async () => {
  if (!knownTokens) {
    const tokens = await api.getAssets()
    knownTokens = {
      bySymbol: keyBy('symbol', tokens),
      byAddress: keyBy('contract_address', tokens),
    }
  }
  return knownTokens
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
