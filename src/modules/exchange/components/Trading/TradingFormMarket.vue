<template>
  <TradingPanel :class="orderSideClass">
    <strong class="c-trading-panel__title">
      {{ orderNamespace  }} <i>{{ quotePairedSymbol }}</i>
    </strong>

    <TransactionConfirm
      v-if="isStatus(['beforeSign'])"
      class="c-trading-form__confirmation" />

    <template v-else-if="isStatus(['pending', 'success', 'failure']) && !lastActiveTransaction.hidden">
      <div class="c-trading-panel__section -light -light-2-rows">
        <div class="c-trading-form__details-heading">
          <div>
            <strong v-if="lastActiveTransaction.filledAmounts && quoteAsset">
              {{ lastActiveTransaction.filledAmounts[quoteAsset.symbol] | toHumanUnit(quoteAsset.decimals) | toFixed(8) | trimZeros }}
            </strong>
            <strong v-else> {{ quoteAmount | toFixed(8) | trimZeros }} </strong>
            <span class="__muted"> {{ quotePairedSymbol }} </span><br/>
            <span class="__muted">Amount</span>
          </div>
          <img
            src="@/assets/icons/arrow.svg"
            svg-inline
            svg-sprite>
          <div>
            <strong v-if="isFiat">
              {{ preferredCurrencySign }} {{ BigNumber(price).multipliedBy(masterFiatPrice) | toFixed(8) | trimZeros }}
            </strong>
            <strong v-else> {{ price | toFixed(8) | trimZeros }} </strong>
            <span class="__muted"> {{ masterPairedSymbol }} </span><br/>
            <span class="__muted">Price</span>
          </div>
        </div>
      </div>
      <TransactionDetails
        class="c-trading-form__details c-trading-panel__section -border -blue"
        :txHash="lastActiveTransaction.txHash"
        :status="lastActiveTransaction.status"
        :gas="lastActiveTransaction.gasUsed"
        :gasPrice="lastActiveTransaction.gasPrice"
        :blockHeight="lastActiveTransaction.blockNumber"
        :timestamp="lastActiveTransaction.timestamp"
        :symbol="quotePairedSymbol" />
    </template>

    <template v-else>
      <div class="c-trading-panel__section -light -light-2-rows">
        <div class="c-trading-panel__balance __row-spaced">
          <div class="__muted"> You Have </div>
          <img
            src="@/assets/icons/arrow.svg"
            svg-inline
            svg-sprite>
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
      </div>

      <div class="c-trading-panel__section -border">
        <div class="__row-spaced">
          Price
          <div class="c-trading-panel__value-wrap">
            <template v-if="price">{{ price | toFixed(8) }}</template>
            <template v-else>-</template>
            {{ masterPairedSymbol }}
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
              @input="handleInput" />
          </div>
        </div>
        <div class="c-trading-panel__slider"></div>
      </div>

      <div class="c-trading-panel__section -border -grow -total">
        <div class="__row-spaced">
          Total
          <div class="c-trading-panel__value-wrap">
            <div class="__row-spaced __full-width">
              <template v-if="isFiat"> {{ preferredCurrencySign }} </template>
              <template v-if="total">
                <template v-if="isFiat"> {{ BigNumber(total).multipliedBy(masterFiatPrice) | toFixed(8) }} </template>
                <template v-else> {{ total | toFixed(8) }} </template>
              </template>
              <template v-else> - </template>
              {{ masterPairedSymbol }}
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
            </div>
          </div>
        </div>

        <TradingFormMissingBalance
          v-if="quoteAmount && !hasEnoughBalance"
          :hasEnoughEthMissingBalance="hasEnoughEthMissingBalance"
          :missingBalance="missingBalance" />

      </div>

      <div class="c-trading-panel__section -light -light-2-rows">
        <div class="__row-spaced">
          <div class="__muted"> Fee </div>
          <div class="c-trading-panel__fee">
            <template v-if="isNumeric(fee) && fee == 0">{{ 0 | toFixed(2) }}</template>
            <template v-else-if="isNumeric(fee) && fee">{{ fee | toHumanUnit(18) | toFixed(8) | trimZeros }}</template>
            <template v-else>-</template>
            ZRX
            <template v-if="false">
              <!--
                This is static placeholder but no need to develop it as we introduce fee absteaction
                Remove when we move to 0x v3 fee strategies.
              -->
              <div class="c-trading-panel__fee-need">2.71 ZRX needed.</div>
              <Button class="-blue -small">
                <img
                  class="c-button__icon -before"
                  src="@/assets/icons/arrow.svg"
                  height="9"
                  svg-inline
                  svg-sprite>
                Get ZRX
              </Button>
            </template>
          </div>
        </div>
      </div>
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
import includes from 'lodash/fp/includes'
import { isNumeric, sum } from '@/utils'
import { toFixed, trimZeros, toHumanUnit } from '@/filters'
import { getWeightedAveragePrice } from '@/services/transaction'
import BaseInput from '@/ui/Input'
import Button from '@/ui/Button'
import TransactionConfirm from '@/modules/exchange/ui/TransactionConfirm'
import TransactionDetails from '@/modules/exchange/ui/TransactionDetails'
import TradingPanel from './TradingPanel'
import TradingFormMissingBalance from './TradingFormMissingBalance'

export default {
  name: 'TradingForm',

  components: {
    BaseInput,
    Button,
    TradingPanel,
    TransactionConfirm,
    TransactionDetails,
    TradingFormMissingBalance,
  },

  props: {
    orderNamespace: { type: String, required: true },
    orderSideClass: { type: String, required: true },
    balanceAsset: { type: String, required: true },
    lowestAsk: { type: String },
  },

  data () {
    return {
      isPurging: false,
      toFixed,
      isNumeric,
      trimZeros,
      BigNumber,
    }
  },

  computed: {
    ...mapState(['preferredCurrencySymbol']),
    ...mapGetters(['preferredCurrencySign']),
    ...mapState('exchange', ['assetsBySymbol']),
    ...mapState('exchange/wallet', [
      'balancesAndAllowancesBySymbol',
      'ethBalance',
    ]),
    ...mapState('exchange/market', ['marketsByPair']),
    ...mapState('exchange', [
      'masterPairedSymbol',
      'quotePairedSymbol',
      'assetsBySymbol',
    ]),
    ...mapGetters('exchange', [
      'assetsCryptoCompareInfoSelector',
      'masterFiatPrice',
      'quoteAsset',
    ]),
    ...mapState('exchange/trading', [
      'orderMode',
      'isFiat',
    ]),
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
    weightedAveragePrice () {
      const amount = this.market.makerAmount || this.market.takerAmount
      return amount && this.market.fillableRecords && getWeightedAveragePrice(this.market.fillableRecords)
    },
    marketPrice () {
      const amount = this.market.makerAmount || this.market.takerAmount
      const shouldShow = !this.market.isFillableRecordsLoading && !amount
      return shouldShow && this.isFiat
        ? BigNumber(this.lowestAsk).multipliedBy(this.masterFiatPrice).toString()
        : this.lowestAsk
    },
    lastActiveTransaction () {
      const id = get(this.market, 'transactionsSorted[0]')
      return get(this.market, ['transactionsById', id], {})
    },
    price () {
      return (this.weightedAveragePrice && this.weightedAveragePrice[this.masterPairedSymbol])
        || this.marketPrice
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
    hasEnoughBalance () {
      const amount = this.isBuy
        ? this.total
        : this.quoteAmount
      return BigNumber(this.balanceInHumanUnit).isGreaterThanOrEqualTo(amount)
    },
    missingBalance () {
      const amount = this.isBuy
        ? this.total
        : this.quoteAmount
      const balance = BigNumber(amount).minus(this.balanceInHumanUnit)
      return balance.isLessThan('0.01')
        ? '0.01'
        : balance.toString()
    },
    hasEnoughEthMissingBalance () {
      return this.balanceAsset === 'WETH' && BigNumber(toHumanUnit(this.ethBalance, 18)).isGreaterThanOrEqualTo(this.missingBalance)
    },
    quoteAmount () {
      return this.isBuy
        ? this.market.makerAmount
        : this.market.takerAmount
    },
    total () {
      return parseFloat(this.price)
        && isNumeric(this.price)
        && isNumeric(this.quoteAmount)
        && new BigNumber(this.price)
          .multipliedBy(this.quoteAmount)
          .toString()
    },
    fee () {
      const recs = this.market.fillableRecords
      return recs && recs.length
        ? sum(recs.map(({ fillData }) => fillData.feeAmount))
        : false
    },
    canTrade () {
      const fillAmounts = get(this.market, 'fillableRecords', [])
        .map(rec => get(rec, `fillData.fillAmount.${this.balanceAsset}`))
      return isNumeric(this.quoteAmount)
        && this.quoteAmount > 0
        && this.balance
        && BigNumber(this.balance).isGreaterThanOrEqualTo(sum(fillAmounts))
    },
  },

  mounted () {
    this.cleanUp()
    this.getMarketPrice(this.pair)
  },

  beforeDestroy () {
    this.cleanUp()
  },

  methods: {
    ...mapActions('exchange/market', [
      'getMarketPrice',
      'setFillableRecords',
      'setOrderAmount',
      'setTxStatus',
      'setTransaction',
      'sendTransaction',
      'resetMarket',
      'purgeTransactions',
    ]),
    async cleanUp () {
      if (!this.isStatus(['pending'])) this.resetMarket(this.pair)
      this.isPurging = true
      await this.purgeTransactions(this.pair)
      this.isPurging = false
    },
    handleInput (orderAmount) {
      const payload = { pair: this.pair }
      if (this.isBuy) payload.makerAmount = orderAmount
      else payload.takerAmount = orderAmount
      this.setOrderAmount(payload)
      this.setFillableRecords(this.pair)
    },
    handleButtonClick () {
      if (this.isStatus(['pending', 'failure', 'success'])) {
        this.resetMarket(this.pair)
        this.setTransaction({
          pair: this.pair,
          id: this.lastActiveTransaction.id,
          hidden: true,
        })
      } else this.sendTransaction(this.pair)
    },
    isStatus (statuses) {
      return includes(this.lastActiveTransaction.status, statuses)
    },
  },
}
</script>

<style lang="scss">
.c-trading-form__confirmation {
  justify-content: center;
  border-top: 1px solid $black;
}

.c-trading-form__details {
  flex-grow: 1;
  border-top: 1px solid $black;
}

.c-trading-form__details-heading {
  position: relative;
  display: flex;
  width: 100%;
  justify-content: space-between;
  height: 100%;
  font-size: 14px;
  line-height: 1.2;
  margin-top: 3.5px;

  div { max-width: 50%; }
  div:last-of-type { padding-left: 10px; }
  svg {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
