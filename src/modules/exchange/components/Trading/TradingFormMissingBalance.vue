<template>
  <div class="__row-spaced">
    <span></span>
    <div class="c-trading-panel__value-wrap -balance">
      <img
        src="@/assets/icons/failure.svg"
        svg-inline
        svg-sprite>
      Not enough Balance.
      <a
        v-if="hasEnoughEthMissingBalance"
        class="__link"
        @click="handleClickLink">
        Wrap {{ missingBalance | toFixed(8) | trimZeros }} Ether
      </a>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import { STANDALONE_WETH_GET } from '@/modules/exchange/components/ModalArea/constants'

export default {
  name: 'TradingFormMissingBalance',
  props: {
    hasEnoughEthMissingBalance: Boolean,
    missingBalance: String,
  },
  methods: {
    ...mapActions('exchange/modalArea', [
      'addOpenedModal',
    ]),
    ...mapMutations('exchange/wrap', [
      'setAmount',
    ]),
    handleClickLink () {
      this.addOpenedModal({
        id: STANDALONE_WETH_GET,
        component: 'ModalStandaloneWethGet',
        data: {
          onmounted: () => {
            this.setAmount(this.missingBalance)
          },
        },
      })
    },
  },
}
</script>
