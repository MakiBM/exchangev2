import Web3 from 'web3'
import { getWeb3Wrapper } from './web3Wrapper'

let web3

export const getWeb3 = async () => {
  if (!web3) {
    const web3Wrapper = await getWeb3Wrapper()
    web3 = new Web3(web3Wrapper.getProvider())
  }
  return web3
}
