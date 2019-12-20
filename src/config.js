
const isProd = window.location.host === 'etherblockchain.io' || window.location.host === 'www.etherblockchain.io'
const apiSubdomain = isProd ? 'api' : 'dev-api'

export const API_URL = `https://${apiSubdomain}.etherblockchain.io/api/v2/eth`
export const WEBSOCKET_URL = `wss://${apiSubdomain}.etherblockchain.io/api/v2/eth/live`

export const CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data'
export const CRYPTOCOMPARE_API_KEY = '62c7c2415fa43f612f97f5e3dd5b823cd58f884746f11669217f14905a52b199'

export const NETWORK_ID = 1
export const MAINNET_ID = 1
export const ERC20_ID = '0xf47261b0'
export const ERC721_ID = '0x02571792'
