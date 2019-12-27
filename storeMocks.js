// Allowances
window.store.dispatch('exchange/allowances/setAllowancesTransaction', {
  symbol: 'USDC',
  status: 'beforeSign',
})
window.store.dispatch('exchange/allowances/setAllowancesTransaction', {
  symbol: 'USDC',
  status: 'pending',
  txHash: '0xf5d8858fa800f8368b7f58ff4b70381c89710ebc57572855b1b42457296b7b93',
  timestamp: Date.now(),
  blockNumber: 666,
  gasUsed: 110195,
  gasPrice: '1000000000',
})

// 1. BUY ORDER
// 1.1 Market Order fill form for
window.store.dispatch('exchange/market/setOrderAmount', { pair: 'ZRX/WETH', makerAmount: '0.1' })
window.store.dispatch('exchange/market/setMarketProps', {
  pair: 'ZRX/WETH',
  marketPrice: '0.0025',
  fillableRecords: [{
    metaData: {
      makerAsset: { symbol: 'ZRX', decimals: 18 },
      takerAsset: { symbol: 'WETH', decimals: 18 },
    },
    fillData: {
      price: { WETH: '0.003', ZRX: '200' },
      fillAmount: { WETH: '0.002', ZRX: '0.1' },
    }
  }]
})

// 1.2 Market Order Make transaction
window.store.dispatch('exchange/market/setTransaction', {
  id: 'test',
  pair: 'ZRX/WETH',
  status: 'pending',
  hidden: false,
  txHash: '0xf5d8858fa800f8368b7f58ff4b70381c89710ebc57572855b1b42457296b7b93',
  timestamp: Date.now(),
})

// 1.3 Partial fill
window.store.dispatch('exchange/market/setTransaction', {
  id: 'test',
  pair: 'ZRX/WETH',
  status: 'success',
  filledAmounts: { ZRX: '50000000000000000' },
  blockNumber: 666,
  gasUsed: 110195,
  gasPrice: '1000000000',
})

// 2. SELL ORDER
// 2.1 Market Order fill form for
window.store.dispatch('exchange/market/setOrderAmount', { pair: 'WETH/ZRX', takerAmount: '0.1' })
window.store.dispatch('exchange/market/setMarketProps', {
  pair: 'WETH/ZRX',
  marketPrice: '0.0025',
  fillableRecords: [{
    metaData: {
      makerAsset: { symbol: 'ZRX', decimals: 18 },
      takerAsset: { symbol: 'WETH', decimals: 18 },
    },
    fillData: {
      price: { WETH: '0.003', ZRX: '200' },
      fillAmount: { WETH: '0.002', ZRX: '0.1' },
    }
  }]
})

// 2.2 Market Order Make transaction
window.store.dispatch('exchange/market/setTransaction', {
  id: 'test',
  pair: 'WETH/ZRX',
  status: 'pending',
  hidden: false,
  txHash: '0xf5d8858fa800f8368b7f58ff4b70381c89710ebc57572855b1b42457296b7b93',
  timestamp: Date.now(),
})

// 2.3 Partial fill
window.store.dispatch('exchange/market/setTransaction', {
  id: 'test',
  pair: 'WETH/ZRX',
  status: 'success',
  filledAmounts: { ZRX: '50000000000000000' },
  blockNumber: 666,
  gasUsed: 110195,
  gasPrice: '1000000000',
})

// 3. GET ZRX
// 3.1 Market Order fill form for
window.store.dispatch('exchange/market/setOrderAmount', { pair: 'ZRX/WETH/GET_ZRX', makerAmount: '0.1' })
window.store.dispatch('exchange/market/setMarketProps', {
  pair: 'ZRX/WETH/GET_ZRX',
  marketPrice: '0.0025',
  fillableRecords: [{
    metaData: {
      makerAsset: { symbol: 'ZRX', decimals: 18 },
      takerAsset: { symbol: 'WETH', decimals: 18 },
    },
    fillData: {
      price: { WETH: '0.003', ZRX: '200' },
      fillAmount: { WETH: '0.002', ZRX: '0.1' },
    }
  }]
})

// 3.2 Market Order Make transaction
window.store.dispatch('exchange/market/setTransaction', {
  id: 'test',
  pair: 'ZRX/WETH/GET_ZRX',
  status: 'pending',
  hidden: false,
  txHash: '0xf5d8858fa800f8368b7f58ff4b70381c89710ebc57572855b1b42457296b7b93',
  timestamp: Date.now(),
})

// 3.3 Success
window.store.dispatch('exchange/market/setTransaction', {
  id: 'test',
  pair: 'ZRX/WETH/GET_ZRX',
  status: 'success',
  filledAmounts: { ZRX: '100000000000000000' },
  blockNumber: 666,
  gasUsed: 110195,
  gasPrice: '1000000000',
})

// 4. Wrap Unwrap Modal
// 4.1 Market Order fill form for
window.store.commit('exchange/wrap/setAmount', '0.01')

// 4.2 Market Order Make transaction
window.store.dispatch('exchange/wrap/setTransaction', {
  status: 'pending',
  txHash: '0xf5d8858fa800f8368b7f58ff4b70381c89710ebc57572855b1b42457296b7b93',
  timestamp: Date.now(),
})

// 4.3 Success
window.store.dispatch('exchange/wrap/setTransaction', {
  status: 'success',
  filledAmounts: { ZRX: '100000000000000000' },
  blockNumber: 666,
  gasUsed: 110195,
  gasPrice: '1000000000',
})

window.store.commit('exchange/market/setMarketsByPair', {})

window.store.dispatch('exchange/modalArea/addOpenedModal', {
  id: 'TIMEPICKER',
  component: 'ModalTimePicker',
  data: {
    time: Date.now(),
  },
})
