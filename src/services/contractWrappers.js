import { ContractWrappers } from '0x.js'
import { NETWORK_ID } from '@/config'
import { getWeb3Wrapper } from './web3Wrapper'

let contractWrappers

export const getContractWrappers = async () => {
  if (!contractWrappers) {
    const web3Wrapper = await getWeb3Wrapper()
    contractWrappers = new ContractWrappers(web3Wrapper.getProvider(), { networkId: NETWORK_ID })
  }
  return contractWrappers
}
