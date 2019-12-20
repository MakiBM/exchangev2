import { BigNumber } from '0x.js'
import flow from 'lodash/flow'
import partialRight from 'lodash/partialRight'
import isUndefined from 'lodash/isUndefined'
import { isNumeric } from '@/utils'

// ALWAYS RETURN STRINGS

export const toFixed = (amount, decimals = 2) => {
  if (!isNumeric(amount)) return amount
  return new BigNumber(amount).toFixed(parseInt(decimals), BigNumber.ROUND_UP).toString()
}

export const trimZeros = (amount) => {
  if (!isNumeric(amount)) return amount
  return new BigNumber(amount).toString()
}

export const toHumanUnit = (amount, decimals) => {
  if (!isNumeric(amount) || isUndefined(decimals)) return amount
  return new BigNumber(amount).dividedBy(`1e${decimals}`).toString()
}

export const toBaseUnit = (amount, decimals) => {
  if (!isNumeric(amount) || isUndefined(decimals)) return amount
  return new BigNumber(amount).multipliedBy(`1e${decimals}`).toString()
}

export const applyCommas = (amount) => {
  if (!isNumeric(amount)) return amount
  const [int, float] = amount.split('.')
  const intWithCommas = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (float) ? `${intWithCommas}.${float}` : intWithCommas
}

export const formatFiat = (amount) => {
  if (!isNumeric(amount)) return amount
  const toFiatFixed = partialRight(toFixed, new BigNumber(amount).isLessThan(1) ? 4 : 2)
  return flow([toFiatFixed, applyCommas])(amount)
}

export default {
  toFixed,
  trimZeros,
  toHumanUnit,
  toBaseUnit,
  applyCommas,
  formatFiat,
}
