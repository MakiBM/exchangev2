import { BigNumber } from '0x.js'
import { OrderStatus } from '@0x/contract-wrappers'
import get from 'lodash/fp/get'
import flow from 'lodash/flow'
import groupBy from 'lodash/fp/groupBy'
import map from 'lodash/fp/map'
import mapValues from 'lodash/fp/mapValues'
import api from './api'
import { getContractWrappers } from './contractWrappers'
import { getGasEstimationInfoAsync } from './gasEstimator'
import { sum } from '@/utils'

export const calculateRatioAmount = (dividend, divisor, amount) => {
  const ratio = BigNumber(dividend).dividedBy(divisor)
  return ratio.multipliedBy(amount).integerValue(BigNumber.ROUND_CEIL)
}

export const validateRecords = async (records = []) => {
  const contractWrappers = await getContractWrappers()
  const signedOrders = records.map(rec => rec.order)
  const ordersInfo = await contractWrappers.exchange.getOrdersInfoAsync(signedOrders)
  return records.filter((rec, i) => ordersInfo[i].orderStatus === OrderStatus.Fillable)
}

export const getFillableRecordsByAmountAndRole = async ({ makerAssetSymbol, takerAssetSymbol, fillAmount, fillSide }) => {
  const isMaker = fillSide === 'maker'
  const fillableRecords = []
  let totalFillAmount = BigNumber(0)
  let page = 1

  while (page) {
    const { links, data } = await api.getOrderbook(`${makerAssetSymbol}/${takerAssetSymbol}`, { page, perPage: 10, })
    const records = await validateRecords(data.asks.records)
    page = get('next.page', links)

    for (const record of records) {
      const remainingFillableAmount = isMaker
        ? record.metaData.makerAsset.remainingFillableAmount
        : record.metaData.takerAsset.remainingFillableAmount
      if (totalFillAmount.isLessThan(fillAmount)) {
        totalFillAmount = totalFillAmount.plus(remainingFillableAmount)
        fillableRecords.push(record)
      } else {
        page = false
        break
      }
    }
  }

  return fillableRecords
}

export const getFillAndFeeAmounts = async ({ records, fillAmount, fillSide }) => {
  const isMaker = fillSide === 'maker'
  const fillAndFeeAmounts = []
  let totalFillAmount = BigNumber(0)

  for (const record of records) {
    const { metaData, order } = record
    const { takerFee, makerAssetAmount, takerAssetAmount } = order
    const { makerAsset, takerAsset } = metaData
    const fillSideOrderAssetAmount = isMaker ? makerAssetAmount : takerAssetAmount
    const fillAsset = isMaker ? makerAsset : takerAsset
    const oppositeAsset = isMaker ? takerAsset : makerAsset
    const price = await getPrice(record)
    const calculateOppositeAmount = fillAmount => {
      return BigNumber(fillAmount)
        .dividedBy(`1e${fillAsset.decimals}`)
        .multipliedBy(price[oppositeAsset.symbol])
        .multipliedBy(`1e${oppositeAsset.decimals}`)
        .integerValue(BigNumber.ROUND_UP)
        .toString()
    }
    // Full fill
    if (totalFillAmount.plus(fillAsset.remainingFillableAmount).isLessThanOrEqualTo(fillAmount)) {
      const oppositeFillAmount = calculateOppositeAmount(fillAsset.remainingFillableAmount)
      totalFillAmount = totalFillAmount.plus(fillAsset.remainingFillableAmount)
      fillAndFeeAmounts.push({
        ...record,
        fillData: {
          price,
          feeAmount: calculateRatioAmount(fillAsset.remainingFillableAmount, fillSideOrderAssetAmount, takerFee).toString(),
          fillAmount: {
            [fillAsset.symbol]: fillAsset.remainingFillableAmount,
            [oppositeAsset.symbol]: oppositeFillAmount,
          },
        }
      })
    // Partial fill
    } else if (totalFillAmount.isLessThan(fillAmount)) {
      const partialFillAmount = BigNumber(fillAmount).minus(totalFillAmount).toString()
      const oppositePartialFillAmount = calculateOppositeAmount(partialFillAmount)
      totalFillAmount = totalFillAmount.plus(partialFillAmount)
      fillAndFeeAmounts.push({
        ...record,
        fillData: {
          price,
          feeAmount: calculateRatioAmount(partialFillAmount, fillSideOrderAssetAmount, takerFee).toString(),
          fillAmount: {
            [fillAsset.symbol]: partialFillAmount,
            [oppositeAsset.symbol]: oppositePartialFillAmount,
          },
        }
      })
    // Other orders can't be filled
    } else break
  }

  return fillAndFeeAmounts
}

export const getPrice = async (record) => {
  const { metaData, order } = record
  const { makerAssetAmount, takerAssetAmount } = order
  const { makerAsset, takerAsset } = metaData
  const normalizedMakerAmount = BigNumber(makerAssetAmount).dividedBy(`1e${makerAsset.decimals}`)
  const normalizedTakerAmount = BigNumber(takerAssetAmount).dividedBy(`1e${takerAsset.decimals}`)
  const makerPrice = BigNumber(normalizedMakerAmount).dividedBy(normalizedTakerAmount).toString()
  const takerPrice = BigNumber(normalizedTakerAmount).dividedBy(normalizedMakerAmount).toString()
  return {
    [makerAsset.symbol]: makerPrice,
    [takerAsset.symbol]: takerPrice,
  }
}

export const getFillableRecords = async ({ makerAssetSymbol, takerAssetSymbol, makerAssetFillAmount, takerAssetFillAmount }) => {
  const fillAmount = makerAssetFillAmount || takerAssetFillAmount
  const fillSide = makerAssetFillAmount ? 'maker' : 'taker'
  const records = await getFillableRecordsByAmountAndRole({ makerAssetSymbol, takerAssetSymbol, fillAmount, fillSide })
  return getFillAndFeeAmounts({ records, fillAmount, fillSide })
}

export const getWeightedAveragePrice = (records) => {
  if (!records.length) return
  const getPrice = (symbol, decimals) => {
    const totalOrderVal = sum(records.map(
      ({ fillData }) => BigNumber(fillData.price[symbol]).multipliedBy(fillData.fillAmount[symbol])
    ))
    const totalOrderAmount = sum(records.map(
      ({ fillData }) => fillData.fillAmount[symbol]
    ))
    return BigNumber(totalOrderVal).isGreaterThan(0) && BigNumber(totalOrderAmount).isGreaterThan(0)
      ? BigNumber(totalOrderVal).dividedBy(totalOrderAmount).toFixed(parseInt(decimals), BigNumber.ROUND_UP).toString()
      : false
  }
  const { metaData } = records[0]
  const makerAssetSymbol = metaData.makerAsset.symbol
  const takerAssetSymbol = metaData.takerAsset.symbol
  return {
    [makerAssetSymbol]: getPrice(makerAssetSymbol, metaData.makerAsset.decimals),
    [takerAssetSymbol]: getPrice(takerAssetSymbol, metaData.takerAsset.decimals),
  }
}

export const getTxOpts = async () => {
  const { gasPrice } = await getGasEstimationInfoAsync()
  return {
    shouldValidate: true,
    gasPrice,
  }
}

export const getTransactionFilledAmounts = async (txHash) => {
  try {
    const { data } = await api.getTransactionTransfers(txHash)
    return flow([
      groupBy('symbol'),
      mapValues(map(get('value'))),
      mapValues(sum),
    ])(data)
  } catch (e) {
    setTimeout(() => getTransactionFilledAmounts(txHash), 1000)
  }
}
