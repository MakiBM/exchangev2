import { BigNumber } from '0x.js'

export const FIAT_SIGNS_BY_SYMBOL = {
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CHF: '',
  EUR: '€',
  CAD: '$',
  AUD: '$',
  KRW: '₩',
  RUB: '₽',
  CNY: '¥',
  ARS: '$',
  HKD: '$',
  INR: '₹',
  SGD: '$',
  AED: '', // Symbol for AED is د.إ but there appears to be no shorter symbol.
}

export const GWEI_IN_WEI = BigNumber(1000000000)
export const ONE_MINUTE_MS = 1000 * 60
export const DEFAULT_GAS_PRICE = GWEI_IN_WEI.multipliedBy(6)
export const DEFAULT_ESTIMATED_TRANSACTION_TIME_MS = ONE_MINUTE_MS * 2

export const PUBLIC_NODE_URL = 'https://api.etherblockchain.io/enode/'
export const INFURA_NODE_URL = 'https://mainnet.infura.io/v3/562a7a134f2f4e6ca650db495153cb97'

export const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
