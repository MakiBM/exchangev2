import isUndefined from 'lodash/fp/isUndefined'
import { providerUtils } from '@0x/utils'
import { RPCSubprovider, Web3ProviderEngine, MetamaskSubprovider, RedundantSubprovider, SignerSubprovider } from '@0x/subproviders'
import * as FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import { PUBLIC_NODE_URL, INFURA_NODE_URL } from '@/constants'

let injectedProvider
let providerEngine

export const getInjectedProviderIfExists = () => {
  if (!injectedProvider) {
    const injectedProviderIfExists = window.ethereum
    if (injectedProviderIfExists !== undefined) {
      const provider = providerUtils.standardizeOrThrow(injectedProviderIfExists)
      injectedProvider = provider
    }
    const injectedWeb3IfExists = window.web3
    if (injectedWeb3IfExists !== undefined && injectedWeb3IfExists.currentProvider !== undefined) {
      const { currentProvider } = injectedWeb3IfExists
      // Todo: add comments
      const provider = providerUtils.standardizeOrThrow(currentProvider)
      if (injectedWeb3IfExists.currentProvider.isTrust) provider.isTrust = true
      if (injectedWeb3IfExists.currentProvider.isEBO) provider.isEBO = true
      injectedProvider = provider
    }
  }
  return injectedProvider
}

export const getProvider = () => {
  if (!providerEngine) {
    const injectedProvider = getInjectedProviderIfExists()
    const doesInjectedProviderExist = !isUndefined(injectedProvider)
    const provider = new Web3ProviderEngine()

    if (doesInjectedProviderExist) {
      // AM Metamask Subprovider (and Trust requires this too) uses personal_sign when eth_sign is called
      // Instead of implementing our own subprovider (for EBO), using MetaMasks works seemingly fine.
      const signerSubprovider = (injectedProvider.isMetaMask || injectedProvider.isTrust)
        ? new MetamaskSubprovider(injectedProvider)
        : new SignerSubprovider(injectedProvider)
      provider.addProvider(signerSubprovider)
      provider.addProvider(new FilterSubprovider())
      const rpcSubproviders = [
        new RPCSubprovider(INFURA_NODE_URL),
        new RPCSubprovider(PUBLIC_NODE_URL),
      ]
      provider.addProvider(new RedundantSubprovider(rpcSubproviders))
      provider.start()
      return provider
    }

    // AM Else - default (TODO: probably can't sign messages.. so, maybe show an error instead?)
    provider.addProvider(new FilterSubprovider())
    provider.addProvider(new RPCSubprovider(PUBLIC_NODE_URL))
    provider.start()
    providerEngine = provider
  }
  return providerEngine
}
