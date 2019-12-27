import { Web3Wrapper } from '@0x/web3-wrapper'
import { sleep } from './_utils'
import { getProvider } from '@/services/provider'

let web3Wrapper = null

export const isMetamaskInstalled = () => {
  const { ethereum, web3 } = window
  return ethereum || web3
}

export const destroyWeb3Wrapper = () => { web3Wrapper = null }

export const initializeWeb3Wrapper = async () => {
  const { ethereum, web3, location } = window

  if (web3Wrapper) {
    return web3Wrapper
  }

  const provider = await getProvider()

  if (ethereum) {
    try {
      web3Wrapper = new Web3Wrapper(provider)
      // Request account access if needed
      await ethereum.enable()

      // Subscriptions register
      ethereum.on('accountsChanged', async (accounts) => {
        // Reload to avoid MetaMask bug: 'MetaMask - RPC Error: Internal JSON-RPC'
        location.reload()
      })
      ethereum.on('networkChanged', async (network) => {
        location.reload()
      })
    } catch (error) {
      // The user denied account access
      destroyWeb3Wrapper()
    }
  } else if (web3) {
    web3Wrapper = new Web3Wrapper(provider)
  } else {
    //  The user does not have metamask installed
    destroyWeb3Wrapper()
  }

  return web3Wrapper
}

export const getWeb3Wrapper = async () => {
  while (!web3Wrapper) {
    // if web3Wrapper is not set yet, wait and retry
    await sleep(100)
  }

  return web3Wrapper
}
