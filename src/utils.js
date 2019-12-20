import clone from 'lodash/clone'
import isNumber from 'lodash/isNumber'
import isEmpty from 'lodash/isEmpty'
import { BigNumber } from '0x.js'

// FLOW CONTROL
export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// EVENTS

export const eventDelegationTarget = (match, event) => {
  try {
    let el = event.target
    while (el && !el.matches(match)) {
      el = el.parentNode
    }
    return el
  } catch (err) {
    return undefined
  }
}

// COLLECTIONS

export const renameKey = (key, newKey, obj) => {
  if (Object.keys(obj).includes(key)) {
    obj[newKey] = clone(obj[key], true)
    delete obj[key]
  }
  return obj
}

// NUMBERS

export const easeOut = t => {
  return (--t) * t * t + 1
}

export const isNumeric = (value) => {
  return isNumber(value) || (!isEmpty(value) && !isNaN(value))
}

export const sum = arr => {
  return BigNumber.sum.apply(null, arr)
}
