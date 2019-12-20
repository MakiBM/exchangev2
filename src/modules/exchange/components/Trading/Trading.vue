<template>
  <div class="c-trading">
    <div class="__row-spaced">
      <div>
        <SectionTitle
          class="c-trading__title"
          :active="orderMode === ORDER_MODE_MARKET"
          :muted="orderMode !== ORDER_MODE_MARKET"
          @click.native="handleClickTitle(ORDER_MODE_MARKET)">
          Market Order
        </SectionTitle>
        <SectionTitle
          class="c-trading__title"
          :active="orderMode === ORDER_MODE_ADVANCED"
          :muted="orderMode !== ORDER_MODE_ADVANCED"
          @click.native="handleClickTitle(ORDER_MODE_ADVANCED)">
          Advanced Trading
        </SectionTitle>
      </div>
      <Toggle
        :leftLabel="masterPairedSymbol"
        :rightLabel="preferredCurrencySymbol"
        :checked="isFiat"
        class="c-trading__toggle-fiat -small"
        @click.native="handleClickToggle" />
    </div>

    <div class="c-trading__grid">
      <div
        class="c-trading__col"
        :class="{'-disabled': !ethAccount}">
        <TradingPermission
          v-if="balancesAndAllowancesBySymbol && !isUnlocked(masterPairedSymbol) && hasBalance(masterPairedSymbol)"
          orderNamespace="buy"
          orderSideClass="-positive"
          :balanceAsset="masterPairedSymbol" />
        <TradingFormMarket
          v-else-if="orderMode === ORDER_MODE_MARKET"
          orderNamespace="buy"
          orderSideClass="-positive"
          :balanceAsset="masterPairedSymbol" />
        <TradingFormAdvanced
          v-else-if="orderMode === ORDER_MODE_ADVANCED"
          orderNamespace="buy"
          orderSideClass="-positive"
          :pair="`${masterPairedSymbol}/${quotePairedSymbol}`"
          :lowestAsk="sellOrdersBestPrice"
          :balanceAsset="masterPairedSymbol" />
      </div>

      <div class="c-trading__col">
        <TradingWallet v-if="ethAccount" />
        <TradingConnect v-else />
      </div>

      <div
        class="c-trading__col"
        :class="{'-disabled': !ethAccount}">
        <TradingPermission
          v-if="balancesAndAllowancesBySymbol && !isUnlocked(quotePairedSymbol) && hasBalance(quotePairedSymbol)"
          orderNamespace="sell"
          orderSideClass="-negative"
          :balanceAsset="quotePairedSymbol" />
        <TradingFormMarket
          v-else-if="orderMode === ORDER_MODE_MARKET"
          orderNamespace="sell"
          orderSideClass="-negative"
          :balanceAsset="quotePairedSymbol" />
        <TradingFormAdvanced
          v-else-if="orderMode === ORDER_MODE_ADVANCED"
          orderNamespace="sell"
          orderSideClass="-negative"
          :pair="`${masterPairedSymbol}/${quotePairedSymbol}`"
          :lowestAsk="buyOrdersBestPrice"
          :balanceAsset="quotePairedSymbol" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import get from 'lodash/get'
import SectionTitle from '@/ui/SectionTitle'
import Toggle from '@/ui/Toggle'
import TradingWallet from './TradingWallet'
import TradingConnect from './TradingConnect'
import TradingFormMarket from './TradingFormMarket'
import TradingFormAdvanced from './TradingFormAdvanced'
import TradingPermission from './TradingPermission'
import { ORDER_MODE_MARKET, ORDER_MODE_ADVANCED } from './constants'

export default {
  name: 'Trade',
  components: {
    SectionTitle,
    Toggle,
    TradingWallet,
    TradingConnect,
    TradingFormMarket,
    TradingFormAdvanced,
    TradingPermission,
  },
  data () {
    return {
      ORDER_MODE_MARKET,
      ORDER_MODE_ADVANCED,
    }
  },
  computed: {
    ...mapState(['preferredCurrencySymbol']),
    ...mapState('exchange', [
      'masterPairedSymbol',
      'quotePairedSymbol',
    ]),
    ...mapState('exchange/wallet', [
      'ethAccount',
      'balancesAndAllowancesBySymbol',
    ]),
    ...mapState('exchange/trading', [
      'orderMode',
      'isFiat',
    ]),
    ...mapGetters('exchange/orderBook', [
      'buyOrdersBestPrice',
      'sellOrdersBestPrice',
    ]),
  },
  methods: {
    ...mapActions({
      setOrderMode: 'exchange/trading/setOrderMode',
      setIsFiat: 'exchange/trading/setIsFiat',
    }),
    handleClickTitle (mode) {
      this.setOrderMode(mode)
    },
    handleClickToggle () {
      this.setIsFiat(!this.isFiat)
    },
    isUnlocked (symbol) {
      return get(this.balancesAndAllowancesBySymbol, [symbol, 'isUnlocked'])
    },
    hasBalance (symbol) {
      const balance = get(this.balancesAndAllowancesBySymbol, [symbol, 'balance'])
      return balance && balance.isGreaterThan(0)
    },
  },
}
</script>

<style lang="scss">
.c-trading__title {
  cursor: pointer;
}

.c-trading__grid {
  display: flex;
  justify-content: space-between;
}

.c-trading__col {
  width: calc((100% / 3) - (40px / 3));
  min-height: 430px;

  &.-disabled {
    pointer-events: none;
    opacity: 0.2;
  }
}

.c-trading__toggle-fiat {
  margin-top: 10px;
  margin-right: 20px;
}
</style>
