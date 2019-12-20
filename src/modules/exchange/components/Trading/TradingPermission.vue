<template>
  <TradingPanel
    class="c-trading-permission"
    :class="orderSideClass">
    <strong class="c-trading-panel__title">
      {{ orderNamespace  }} <i>{{ quotePairedSymbol }}</i>
    </strong>

    <div class="c-trading-permission__body">
      <strong class="c-trading-permission__title">
        {{ balanceAsset }} TRADING PERMISSION IS TURNED OFF.
      </strong>
      <p class="c-trading-permission__desc">
        Enabling trading permission is a requirement of the ERC20 standard to use the Exchange.
      </p>
      <img
        class="c-trading-permission__arrow"
        src="@/assets/icons/arrow.svg"
        svg-inline
        svg-sprite>
      <Button
        class="-blue -medium"
        @click.native="handleClick">
        Turn on Trading Permission
      </Button>
    </div>

    <div class="c-trading-panel__button-wrap">
      <Button class="-transparent -disabled">
        Place {{ orderNamespace }} Order
      </Button>
    </div>
  </TradingPanel>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import Button from '@/ui/Button'
import TradingPanel from './TradingPanel'
import { STANDALONE_PERMISSION } from '@/modules/exchange/components/ModalArea/constants'

export default {
  name: 'TradingPermission',

  components: {
    Button,
    TradingPanel,
  },

  props: {
    orderNamespace: { type: String, required: true },
    orderSideClass: { type: String, required: true },
    balanceAsset: { type: String, required: true },
  },

  computed: {
    ...mapState('exchange', ['masterPairedSymbol', 'quotePairedSymbol']),
  },

  methods: {
    ...mapActions('exchange/modalArea', ['addOpenedModal']),
    ...mapActions('exchange/allowances', ['toggleAllowances']),
    ...mapMutations('exchange/allowances', ['setActiveSymbol']),
    handleClick () {
      this.addOpenedModal({
        id: STANDALONE_PERMISSION,
        component: 'ModalStandalonePermission',
        data: {
          symbols: [this.masterPairedSymbol, this.quotePairedSymbol],
          onmounted: () => {
            this.setActiveSymbol(this.balanceAsset)
            this.toggleAllowances(this.balanceAsset)
          },
        },
      })
    },
  },
}
</script>

<style lang="scss">
.c-trading-permission__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  line-height: 1.2;
  color: rgba($white, 0.5);
  text-align: center;
  border-top: 1px solid $black;
}

.c-trading-permission__title {
  margin-bottom: 20px;
  color: $white;
}

.c-trading-permission__desc {
  max-width: 250px;
}

.c-trading-permission__arrow {
  color: $blue;
  transform: rotate(90deg);
  margin-top: 20px;
  margin-bottom: 20px;
  height: 15px;
  width: auto;

  &.-white { color: $white; }
}
</style>
