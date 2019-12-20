<template>
  <ModalInner v-bind="$attrs">
    <template v-slot:left>
      <ModalInnerAction
        title="I'm a Rookie User"
        :desc="'Simply enter an amount you\'d like to \n &quot;Buy&quot; or &quot;Sell&quot;'"
        buttonText="Market Order"
        @buttonClick="handleMarketOrderClick">
        <img
          class="c-modal-onboarding__market-icon"
          src="@/assets/icons/fish.svg"
          svg-inline
          svg-sprite>
      </ModalInnerAction>
    </template>
    <template v-slot:right>
      <ModalInnerAction
        title="I’m an Advanced Trader"
        :desc="'Select &quot;Limit&quot;, &quot;Batch&quot; or &quot;Good Til&quot; \n from &quot;Buy&quot; or &quot;Sell&quot; orders.'"
        buttonText="Advanced Trading"
        @buttonClick="handleAdvancedOrderClick">
        <img
          class="c-modal-onboarding__advanced-icon"
          src="@/assets/icons/whale.svg"
          svg-inline
          svg-sprite>
      </ModalInnerAction>
    </template>
  </ModalInner>
</template>

<script>
import { mapActions } from 'vuex'
import ModalInner from './ModalInner'
import ModalInnerAction from './ModalInnerAction'
import { ORDER_MODE_MARKET, ORDER_MODE_ADVANCED } from '@/modules/exchange/components/Trading/constants'

export default {
  name: 'ModalOnboardingOrder',
  components: {
    ModalInner,
    ModalInnerAction,
  },
  methods: {
    ...mapActions('exchange/trading', [
      'setOrderMode'
    ]),
    ...mapActions('exchange/modalArea', [
      'setIsOnboardingActive',
    ]),
    handleMarketOrderClick () {
      this.setIsOnboardingActive(false)
      this.setOrderMode(ORDER_MODE_MARKET)
    },
    handleAdvancedOrderClick () {
      this.setIsOnboardingActive(false)
      this.setOrderMode(ORDER_MODE_ADVANCED)
    },
  },
}
</script>

<style lang="scss">
.c-modal-onboarding__market-icon {
  margin-bottom: 45px;
}

.c-modal-onboarding__advanced-icon {
  margin-bottom: 35px;
}
</style>
