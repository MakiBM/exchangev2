<template>
  <ModalInner
    v-bind="$attrs"
    :leftNav="{text: 'Choose Connection', onclick: () => $emit('chooseConnectionClick')}"
    :disableBorder="true">
    <template v-slot:left>
      <ModalInnerAction
        class="-tight"
        title="MetaMask"
        :titleUrl="METAMASK_URL"
        :desc="action.desc"
        :isSuccess="web3State === WEB3STATE_UNLOCKED"
        :isFocused="web3State === WEB3STATE_UNLOCKED"
        :buttonText="action.buttonText"
        @buttonClick="action.buttonClick">
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

    <template v-slot:right>
      <WalletStatus
        :title="status.title"
        :desc="status.desc"
        :img="require(`@/assets/images/${status.img}`)"
        :isArrowWhite="web3State === WEB3STATE_UNLOCKED" />
    </template>
  </ModalInner>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ModalInner from './ModalInner'
import ModalInnerAction from './ModalInnerAction'
import WalletStatus from '@/modules/exchange/ui/WalletStatus'
import { METAMASK_URL, STANDALONE_CONNECT } from './constants'
import { WEB3STATE_LOCKED, WEB3STATE_UNLOCKED, WEB3STATE_NOT_INSTALLED, WEB3STATE_ERROR } from '@/modules/exchange/constants'

export default {
  name: 'ModalOnboardingConnect',
  components: {
    ModalInner,
    ModalInnerAction,
    WalletStatus,
  },
  data () {
    return {
      METAMASK_URL,
      WEB3STATE_UNLOCKED,
    }
  },
  computed: {
    ...mapState('exchange/wallet', ['web3State']),
    action () {
      switch (this.web3State) {
        case WEB3STATE_UNLOCKED:
          return {
            desc: 'Successful',
            buttonText: this.$attrs.rightNav
              ? 'Next Step'
              : 'Start Trading',
            buttonClick: () => this.$attrs.rightNav
              ? this.$attrs.rightNav.onclick()
              : this.removeOpenedModal(STANDALONE_CONNECT),
          }
        default:
          return {
            desc: 'Unlock your MetaMask',
            buttonText: 'Try Again',
            buttonClick: () => this.connectMetamask(),
          }
      }
    },
    status () {
      switch (this.web3State) {
        case WEB3STATE_NOT_INSTALLED:
          return {
            img: 'metamask-locked.png',
            title: 'MetaMask is not installed',
            desc: 'Please install MetaMask to connect your account to the Exchange.',
          }
        case WEB3STATE_LOCKED:
          return {
            img: 'metamask-locked.png',
            title: 'Your MetaMask is locked',
            desc: 'Please unlock your MetaMask to connect your account to the Exchange.',
          }
        case WEB3STATE_UNLOCKED:
          return {
            img: 'metamask-unlocked.png',
            title: 'Your MetaMask is unlocked.',
            desc: '',
          }
        case WEB3STATE_ERROR:
          return {
            img: 'metamask-locked.png',
            title: 'Error connecting to MetaMask',
            desc: 'Please make sure your MetaMask is connected to Mainnet.',
          }
        default:
          return {
            img: 'metamask-locked.png',
            title: 'Unknown Issue',
            desc: 'Try to reload your browser.',
          }
      }
    },
  },
  methods: {
    ...mapActions('exchange/wallet', [
      'connectMetamask',
    ]),
    ...mapActions('exchange/modalArea', [
      'removeOpenedModal'
    ]),
  },
}
</script>
