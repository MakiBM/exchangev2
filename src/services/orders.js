import { orderHashUtils, assetDataUtils, signatureUtils, BigNumber, MetamaskSubprovider } from '0x.js'
import isUndefined from 'lodash/isUndefined'
import { getHttpClient } from './httpClient'
import { getContractWrappers } from './contractWrappers'
import { getKnownTokens } from './tokens'

export const getOrderHashHex = (order) => {
  const tempOrder = {
    ...order,
  }
  if (!isUndefined(tempOrder.makerAsset)) delete tempOrder.makerAsset
  if (!isUndefined(tempOrder.takerAsset)) delete tempOrder.takerAsset
  if (!isUndefined(tempOrder.signature)) delete tempOrder.signature
  return orderHashUtils.getOrderHashHex(tempOrder)
}

export const getOrderConfigAsync = async ({ makerSymbol, takerSymbol, amounts, timestamp, ethAccount }) => {
  const httpClient = await getHttpClient()
  const contractWrappers = await getContractWrappers()
  const tokens = await getKnownTokens()
  const makerToken = tokens.bySymbol[makerSymbol]
  const takerToken = tokens.bySymbol[takerSymbol]
  const makerAmount = amounts[makerSymbol]
  const takerAmount = amounts[takerSymbol]
  const expirationTimeSeconds = parseInt(timestamp / 1000)
  const order = {
    makerAddress: ethAccount,
    takerAddress: '0x0000000000000000000000000000000000000000',
    makerAssetAmount: BigNumber(makerAmount).multipliedBy(`1e${makerToken.decimals}`).integerValue(BigNumber.ROUND_UP),
    takerAssetAmount: BigNumber(takerAmount).multipliedBy(`1e${takerToken.decimals}`).integerValue(BigNumber.ROUND_UP),
    makerAssetData: assetDataUtils.encodeERC20AssetData(makerToken.contract_address),
    takerAssetData: assetDataUtils.encodeERC20AssetData(takerToken.contract_address),
    exchangeAddress: contractWrappers.exchange.address,
    expirationTimeSeconds: BigNumber(expirationTimeSeconds),
  }
  const fees = await httpClient.getOrderConfigAsync(order)
  const salt = BigNumber((new Date()).getTime())
  const orderConfig = { ...order, ...fees, salt }
  return orderConfig
}

export const submitOrder = async (orderConfig) => {
  try {
    const httpClient = await getHttpClient()
    const contractWrappers = await getContractWrappers()
    const provider = new MetamaskSubprovider(contractWrappers.getProvider())
    const orderHashHex = orderHashUtils.getOrderHashHex(orderConfig)
    const signature = await signatureUtils.ecSignHashAsync(provider, orderHashHex, orderConfig.makerAddress)
    await signatureUtils.isValidSignatureAsync(provider, orderHashHex, signature, orderConfig.makerAddress)
    const signedOrder = {
      ...orderConfig,
      signature,
    }
    await httpClient.submitOrderAsync(signedOrder)
  } catch (e) {
    throw e
  }
}
