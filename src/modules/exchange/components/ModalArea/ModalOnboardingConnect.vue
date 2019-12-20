<template>
  <ModalOnboardingConnectMetamask
    v-if="connectingWallet === WALLET_METAMASK"
    v-bind="$attrs"
    @chooseConnectionClick="setConnectingWallet(undefined)" />
  <ModalInner
    v-else
    v-bind="$attrs">
    <template v-slot:left>
      <ModalInnerAction
        class="-tight"
        title="MetaMask"
        :titleUrl="METAMASK_URL"
        :desc="metamask.desc"
        :buttonText="metamask.buttonText"
        @buttonClick="metamask.buttonClick">
        <a
          :href="METAMASK_URL"
          target="_blank"
          rel="nofollow noopener">
          <img
            class="c-modal-connect__metamask-icon"
            src="@/assets/icons/metamask.svg">
        </a>
      </ModalInnerAction>
    </template>

    <template v-slot:center>
      <ModalInnerAction
        class="-tight"
        title="Account"
        :desc="'Connect Ethereum account with \n EtherBlockchain.io Exchange'">
        <div class="c-modal-connect__vault-row">
          <img
            class="c-modal-connect__vault-arrow -left"
            src="@/assets/icons/arrow.svg"
            svg-inline
            svg-sprite>
          <img
            class="c-modal-connect__vault-icon"
            src="@/assets/icons/vault.svg"
            svg-inline
            svg-sprite>
          <img
            class="c-modal-connect__vault-arrow -right"
            src="@/assets/icons/arrow.svg"
            svg-inline
            svg-sprite>
        </div>
      </ModalInnerAction>
    </template>

    <template v-slot:right>
      <ModalInnerAction
        class="-tight"
        title="Ledger"
        :titleUrl="LEDGER_URL"
        :desc="'Unlock your Ledger Wallet'"
        buttonText="Connect Ledger">
        <a
          :href="LEDGER_URL"
          target="_blank"
          rel="nofollow noopener">
          <img
            class="c-modal-connect__ledger-icon"
            src="@/assets/icons/ledger.png">
        </a>
      </ModalInnerAction>
    </template>
  </ModalInner>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ModalInner from './ModalInner'
import ModalInnerAction from './ModalInnerAction'
import ModalOnboardingConnectMetamask from './ModalOnboardingConnectMetamask'
import { WALLET_METAMASK } from '@/modules/exchange/constants'
import { METAMASK_URL, LEDGER_URL } from './constants'

export default {
  name: 'ModalOnboardingConnect',
  components: {
    ModalInner,
    ModalInnerAction,
    ModalOnboardingConnectMetamask,
  },
  data () {
    return {
      METAMASK_URL,
      LEDGER_URL,
      WALLET_METAMASK,
      connectingWallet: undefined,
    }
  },
  computed: {
    ...mapState('exchange/wallet', ['wallet']),
    metamask () {
      if (this.wallet === WALLET_METAMASK) {
        return {
          desc: 'You are connected',
          buttonText: 'Disconnet MetaMask',
          buttonClick: () => {
            this.reset()
            this.setConnectingWallet(undefined)
          },
        }
      } else {
        return {
          desc: 'Unlock your MetaMask',
          buttonText: 'Connect MetaMask',
          buttonClick: () => {
            this.connectMetamask()
            this.setConnectingWallet(WALLET_METAMASK)
          },
        }
      }
    },
  },
  methods: {
    ...mapActions('exchange/wallet', [
      'connectMetamask',
      'reset',
    ]),
    setConnectingWallet (wallet) {
      this.connectingWallet = wallet
    }
  },
}
</script>

<style lang="scss">
.c-modal-connect__metamask-icon {
  height: 95px;
  margin-bottom: 5px;
}

.c-modal-connect__ledger-icon {
  margin-bottom: 15px;
}

.c-modal-connect__vault-row {
  display: flex;
  align-items: center;
}

.c-modal-connect__vault-icon {
  margin: 15px 50px;
}

.c-modal-connect__vault-arrow {
  height: 17px;
  width: auto;
  margin-top: 10px;
  opacity: 0.5;

  &.-right {
    transform: scaleX(-1);
  }
}
</style>
