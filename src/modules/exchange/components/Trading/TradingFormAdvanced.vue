<template>
  <TradingPanel :class="orderSideClass">
    <strong class="c-trading-panel__title">
      {{ orderNamespace  }} <i>{{ quotePairedSymbol }}</i>
    </strong>

    <TransactionConfirm
      v-if="isStatus(['beforeSign'])"
      class="c-trading-form__confirmation" />

    <template v-else>
      <div class="c-trading-panel__section -light -light-2-rows">
        <div class="c-trading-panel__balance __row-spaced">
          <div class="__muted"> You Have </div>
          <div>
            <template v-if="isFiat">
              {{ preferredCurrencySign }}
            </template>
            <strong>
              <template v-if="!balanceInHumanUnit">-</template>
              <template v-else-if="isFiat">
                {{ BigNumber(balanceInHumanUnit).multipliedBy(balanceAssetPrice) | toFixed(8) }}
              </template>
              <template v-else>
                {{ balanceInHumanUnit | toFixed(8) }}
              </template>
            </strong>
            {{ balanceAsset }}
          </div>
        </div>
        <div class="__row-spaced">
          <div class="__muted"> Lowest Ask </div>
          <div>
            <template v-if="isFiat">
              {{ preferredCurrencySign }}
            </template>
            <strong v-if="lowestAsk">
              <template v-if="isFiat">
                {{ BigNumber(lowestAsk).multipliedBy(masterFiatPrice) | toFixed(8) }}
              </template>
              <template v-else>
                {{ lowestAsk | toFixed(8) }}
              </template>
            </strong>
            <TextPlaceholder v-else />
            {{ masterPairedSymbol }}
          </div>
        </div>
      </div>

      <div class="c-trading-panel__section -border">
        <div class="__row-spaced">
          Price
          <div class="c-trading-panel__value-wrap">
            <BaseInput
              :prepend="isFiat && preferredCurrencySign"
              :token="masterPairedSymbol"
              :value="(userPrice) ? price : trimZeros(toFixed(price, 8))"
              @input="setUserPrice" />
          </div>
        </div>
        <div class="__row-spaced">
          Amount
          <div class="c-trading-panel__value-wrap">
            <BaseInput
              class="-active"
              placeholder="Enter Amount"
              :value="quoteAmount"
              :token="quotePairedSymbol"
              @input="setQuoteAmount" />
          </div>
        </div>
        <div class="c-trading-panel__slider"></div>
      </div>

      <div class="c-trading-panel__section -border -grow">
        <div class="__row-spaced">
          Total
          <div class="c-trading-panel__value-wrap">
            <BaseInput
              :token="masterPairedSymbol"
              :prepend="isFiat && total && preferredCurrencySign"
              :value="trimZeros(toFixed(total, 8))"
              disabled>
              <Button
                v-if="false"
                class="-blue -small">
                <img
                  class="c-button__icon -before"
                  src="@/assets/icons/arrow-double.svg"
                  height="11"
                  width="18"
                  svg-inline
                  svg-sprite>
                {{ masterPairedSymbol }}
              </Button>
            </BaseInput>
          </div>
        </div>
        <div
          v-if="false"
          class="__row-spaced">
          <span></span>
          <div class="c-trading-panel__value-wrap -balance">
            <img
              src="@/assets/icons/failure.svg"
              svg-inline
              svg-sprite>
            Not enough Balance.
            Wrap 0.0049101930 Ether
          </div>
        </div>
      </div>

      <FeeAndExpiration
        :timestamp="timestamp && new Date(timestamp)"
        :fee="orderConfig.makerFee"
        @setTimestamp="setTimestamp" />

    </template>

    <div class="c-trading-panel__button-wrap">
      <Button
        :class="{
          '-transparent -disabled': !canTrade || isStatus(['beforeSign']),
          '-blue': canTrade && !isStatus(['beforeSign']),
        }"
        @click.native="handleButtonClick">
        <template v-if="isStatus(['beforeSign'])">Waiting Tx Confirmation</template>
        <template v-else-if="isStatus(['pending', 'success', 'failure'])">Continue Trading</template>
        <template v-else>Place {{ orderNamespace  }} Order</template>
      </Button>
    </div>
  </TradingPanel>
</template>

<script>
import { BigNumber } from '0x.js'
import { mapState, mapGetters, mapActions } from 'vuex'
import get from 'lodash/get'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/fp/includes'
import { addDays } from 'date-fns'
import { isNumeric } from '@/utils'
import { toFixed, trimZeros } from '@/filters'
import BaseInput from '@/ui/Input'
import Button from '@/ui/Button'
import TextPlaceholder from '@/ui/TextPlaceholder'
import FeeAndExpiration from '@/modules/exchange/ui/FeeAndExpiration'
import TransactionConfirm from '@/modules/exchange/ui/TransactionConfirm'
import TradingPanel from './TradingPanel'

export default {
  name: 'TradingForm',

  components: {
    BaseInput,
    Button,
    TradingPanel,
    TextPlaceholder,
    TransactionConfirm,
    FeeAndExpiration,
  },

  props: {
    orderNamespace: { type: String, required: true },
    orderSideClass: { type: String, required: true },
    balanceAsset: { type: String, required: true },
    lowestAsk: { type: String },
  },

  data () {
    return {
      console,
      toFixed,
      trimZeros,
      BigNumber,
      quoteAmount: undefined,
    }
  },

  computed: {
    ...mapState(['preferredCurrencySymbol']),
    ...mapGetters(['preferredCurrencySign']),
    ...mapState('exchange', [
      'masterPairedSymbol',
      'quotePairedSymbol',
      'assetsBySymbol',
    ]),
    ...mapGetters('exchange', [
      'assetsCryptoCompareInfoSelector',
      'masterFiatPrice',
    ]),
    ...mapState('exchange/wallet', [
      'balancesAndAllowancesBySymbol',
      'ethAccount',
    ]),
    ...mapState('exchange/trading', [
      'orderMode',
      'isFiat',
    ]),
    ...mapState('exchange/limit', ['marketsByPair']),
    isBuy () {
      return this.orderNamespace === 'buy'
    },
    pair () {
      return this.isBuy
        ? `${this.quotePairedSymbol}/${this.masterPairedSymbol}`
        : `${this.masterPairedSymbol}/${this.quotePairedSymbol}`
    },
    market () {
      return get(this.marketsByPair, [this.pair], {})
    },
    price () {
      // User typed price
      if (!isUndefined(this.userPrice)) {
        const currentCurrency = this.isFiat ? this.preferredCurrencySymbol : this.masterPairedSymbol
        const { value, currency } = this.userPrice
        // We're tracking what currency was selected during price input so we could track original user input
        // and display it while still on the same currency and dynamically translate it to other currencies
        if (currency === currentCurrency) {
          return value
        // Recalculate user input to new selected currency
        } else {
          let recalculatedVal
          if (this.isFiat && currency === this.masterPairedSymbol) {
            recalculatedVal = BigNumber(value).multipliedBy(this.masterFiatPrice).toString()
          } else if (!this.isFiat && currency === this.preferredCurrencySymbol) {
            recalculatedVal = BigNumber(value).dividedBy(this.masterFiatPrice).toString()
          } else if (this.isFiat && currency !== this.preferredCurrencySymbol) {
            // This is most tricky - we need to calculate back to masterPrice from old fiat
            // and then multiply by the new masterFiatPrice
            const prevMasterFiatPrice = get(this.assetsCryptoCompareInfoSelector(this.masterPairedSymbol, currency), 'PRICE')
            const masterPrice = BigNumber(value).dividedBy(prevMasterFiatPrice)
            recalculatedVal = masterPrice.multipliedBy(this.masterFiatPrice).toString()
          }
          return trimZeros(toFixed(recalculatedVal, 8))
        }
      }
      // Best orderbook price
      return this.isFiat
        ? BigNumber(this.lowestAsk).multipliedBy(this.masterFiatPrice).toString()
        : this.lowestAsk
    },
    userPrice () {
      return get(this.market, 'userPrice')
    },
    amounts () {
      return get(this.market, 'amounts', {})
    },
    status () {
      return get(this.market, 'status')
    },
    timestamp () {
      return get(this.market, 'timestamp')
    },
    orderConfig () {
      return get(this.market, 'orderConfig', {})
    },
    balance () {
      return get(this.balancesAndAllowancesBySymbol, [this.balanceAsset, 'balance'])
    },
    balanceInHumanUnit () {
      const decimals = get(this.assetsBySymbol, [this.balanceAsset, 'decimals'])
      return decimals && this.balance > 0
        ? BigNumber(this.balance).dividedBy(`1e${decimals}`).toString()
        : false
    },
    balanceAssetPrice () {
      return get(this.assetsCryptoCompareInfoSelector(this.balanceAsset, this.preferredCurrencySymbol), 'PRICE')
    },
    total () {
      if (parseFloat(this.price) && isNumeric(this.price) && isNumeric(this.quoteAmount)) {
        return BigNumber(this.price)
          .multipliedBy(this.quoteAmount)
          .toString()
      }
      return ''
    },
    canTrade () {
      const amount = this.isBuy
        ? this.isFiat
          ? BigNumber(this.total).dividedBy(this.masterFiatPrice).toString()
          : this.total
        : this.quoteAmount
      return isNumeric(amount)
        && amount > 0
        && this.balanceInHumanUnit
        && BigNumber(this.balanceInHumanUnit).isGreaterThanOrEqualTo(amount)
    },
  },

  mounted () {
    this.resetMarket(this.pair)
  },

  beforeDestroy () {
    this.resetMarket(this.pair)
  },

  watch: {
    total (value) {
      this.setMarketProps({
        pair: this.pair,
        amounts: {
          [this.quotePairedSymbol]: this.quoteAmount,
          [this.masterPairedSymbol]: this.isFiat
            ? BigNumber(value)
              .dividedBy(this.masterFiatPrice)
            : value
        },
      })
      if (!this.timestamp) this.setTimestamp(addDays(Date.now(), 1).getTime())
      if (!value) this.setTimestamp(undefined)
      this.setOrderConfig(this.pair)
    },
    timestamp () {
      this.setOrderConfig(this.pair)
    },
  },

  methods: {
    ...mapActions('exchange/limit', [
      'setMarketProps',
      'resetMarket',
      'setOrderConfig',
      'submitOrder',
    ]),
    setUserPrice (value) {
      this.setMarketProps({
        pair: this.pair,
        userPrice: {
          currency: this.isFiat ? this.preferredCurrencySymbol : this.masterPairedSymbol,
          value,
        },
      })
    },
    setQuoteAmount (value) {
      this.quoteAmount = value
    },
    setStatus (status) {
      this.setMarketProps({
        pair: this.pair,
        status,
      })
    },
    setTimestamp (timestamp) {
      this.setMarketProps({
        pair: this.pair,
        timestamp,
      })
    },
    isStatus (statuses) {
      return includes(this.status, statuses)
    },
    async handleButtonClick () {
      this.setStatus('beforeSign')
      await this.submitOrder(this.pair)
      this.setQuoteAmount(undefined)
    },
  },
}
</script>
