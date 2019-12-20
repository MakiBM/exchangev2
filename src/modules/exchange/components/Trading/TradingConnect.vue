<template>
  <TradingPanel class="c-trading-connect">
    <strong class="c-trading-panel__title __row-spaced">
      Account
    </strong>

    <div class="c-trading-connect__header c-trading-panel__section -light -center -padding">
      <a
        class="__link"
        @click="addOpenedModal({id: STANDALONE_CONNECT, component: 'ModalStandaloneConnect' })">
        <img
          class="c-trading-wallet__button-icon"
          src="@/assets/icons/arrow.svg"
          svg-inline
          svg-sprite>
        CONNECT YOUR ETHEREUM ACCOUNT
      </a>
      <p class="__muted">Please connect your MetaMask or Ledger Wallet to interact with the Exchange.</p>
    </div>

    <div class="c-trading-panel__section -grow -center __muted">
      Forgot how to reconnect your Account?
    </div>

    <div class="c-trading-panel__button-wrap">
      <Button
        class="-blue"
        @click.native="setIsOnboardingActive(true)">
        Trading Steps
        <img
          class="c-trading-wallet__button-icon"
          src="@/assets/icons/arrow.svg"
          svg-inline
          svg-sprite>
      </Button>
    </div>
  </TradingPanel>
</template>

<script>
import { mapActions } from 'vuex'
import Button from '@/ui/Button'
import { STANDALONE_CONNECT } from '../ModalArea/constants'
import TradingPanel from './TradingPanel'

export default {
  name: 'TradingConnect',
  components: {
    Button,
    TradingPanel,
  },
  data () {
    return {
      STANDALONE_CONNECT,
    }
  },
  methods: {
    ...mapActions('exchange/modalArea', [
      'setIsOnboardingActive',
      'addOpenedModal',
    ]),
  },
}
</script>

<style lang="scss">
.c-trading-connect__header {
  .__link {
    font-size: 13px;
  }
  p {
    margin: 0 auto;
    padding-top: 5px;
    line-height: 1.4;
    max-width: 240px;
  }
}
</style>
