<template>
  <Modal
    class="c-partial-fill -standalone"
    @closeClick="removeOpenedModal(id)">

    <div class="c-partial-fill__column">
      <div class="c-partial-fill__header">
        <strong class="c-partial-fill__title">Order Partially Filled</strong>
        <p class="c-partial-fill__description">Your order has been partially filled with the details shown below</p>
        <strong class="c-partial-fill__title -success">
          <img
            src="@/assets/icons/checkmark-circle.svg"
            svg-inline
            svg-sprite>
          Successful
        </strong>
      </div>

      <div class="c-partial-fill__input -light -first">
        <div class="c-partial-fill__label">Price</div>
        <div class="c-partial-fill__amount">
          <template v-if="isFiat"> {{ preferredCurrencySign }} </template>
          <template v-if="isFiat"> {{ BigNumber(price).multipliedBy(masterFiatPrice) | toFixed(8) | trimZeros }} </template>
          <template v-else> {{ price | toFixed(8) | trimZeros }} </template>
          <span class="__muted">{{ this.masterAsset.symbol }}</span>
        </div>
      </div>
      <div class="c-partial-fill__input -light">
        <div class="c-partial-fill__label">Amount</div>
        <div class="c-partial-fill__amount">
          {{ filledQuoteAmount | toFixed(8) | trimZeros }} <span class="__muted">{{ this.quoteAsset.symbol }}</span>
        </div>
      </div>
      <div class="c-partial-fill__input -light">
        <strong class="c-partial-fill__label">Total</strong>
        <div class="c-partial-fill__amount">
          <template v-if="isFiat"> {{ preferredCurrencySign }} </template>
          <template v-if="isFiat"> {{ filledQuoteAmount.multipliedBy(price).multipliedBy(masterFiatPrice) | toFixed(8) | trimZeros }} </template>
          <template v-else> {{ filledQuoteAmount.multipliedBy(price) | toFixed(8) | trimZeros }} </template>
          <span class="__muted">{{ this.masterAsset.symbol }}</span>
        </div>
      </div>

      <div class="c-partial-fill__footer">
        <h5 class="c-partial-fill__footer-heading">TXH</h5>
        <a class="c-partial-fill__footer-link __link" target="_blank">
          {{ data.transaction.txHash.slice(0, 32) }}...
        </a>
        <h5 class="c-partial-fill__footer-heading">You Have</h5>
        <div class="c-partial-fill__footer-balances">
          <div>
            <strong>{{ masterAssetBalance | toFixed(8) }}</strong> {{ this.masterAsset.symbol }}
          </div>
          <div>
            <strong>{{ quoteAssetBalance | toFixed(8) }}</strong> {{ this.quoteAsset.symbol }}
          </div>
        </div>
      </div>
    </div>

    <div class="c-partial-fill__column">
      <div class="c-partial-fill__header">
        <strong class="c-partial-fill__title">Create New Order</strong>
        <p class="c-partial-fill__description">Place a new {{ title }} order to fill the outstanding amount.</p>
        <strong class="c-partial-fill__title">Missing Amount</strong>
      </div>

      <div class="c-partial-fill__input -dark -first">
        <div class="c-partial-fill__label">Price</div>
        <div class="c-partial-fill__amount">
          <template v-if="isFiat"> {{ preferredCurrencySign }} </template>
          <template v-if="isFiat"> {{ BigNumber(price).multipliedBy(masterFiatPrice) | toFixed(8) | trimZeros }} </template>
          <template v-else> {{ price | toFixed(8) | trimZeros }} </template>
          <span class="__muted">{{ this.masterAsset.symbol }}</span>
        </div>
      </div>
      <div class="c-partial-fill__input -dark">
        <div class="c-partial-fill__label">Amount</div>
        <div class="c-partial-fill__amount">
          {{ missingQuoteAmount | toFixed(8) | trimZeros }} <span class="__muted">{{ this.quoteAsset.symbol }}</span>
        </div>
      </div>
      <div class="c-partial-fill__input -dark">
        <strong class="c-partial-fill__label">Total</strong>
        <div class="c-partial-fill__amount">
          <template v-if="isFiat"> {{ preferredCurrencySign }} </template>
          <template v-if="isFiat"> {{ missingQuoteAmount.multipliedBy(price).multipliedBy(masterFiatPrice) | toFixed(8) | trimZeros }} </template>
          <template v-else> {{ missingQuoteAmount.multipliedBy(price) | toFixed(8) | trimZeros }} </template>
          <span class="__muted">{{ this.masterAsset.symbol }}</span>
        </div>
      </div>

      <FeeAndExpiration
        class="c-partial-fill__fee-and-expiration"
        :timestamp="new Date(timestamp)"
        :fee="orderConfig.makerFee"
        @setTimestamp="newTimestamp => timestamp = newTimestamp" />

      <img
        class="c-partial-fill__arrow"
        src="@/assets/icons/arrow.svg"
        svg-inline
        svg-sprite>
      <Button
        class="c-partial-fill__button -blue -medium -full-width"
        @click.native="handleSubmit">
        Yes, Place New {{ title }} Order
      </Button>
      <a
        class="c-partial-fill__link"
        href="#"
        @click.prevent="removeOpenedModal(id)">
        No, continue trading
      </a>
    </div>

  </Modal>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { BigNumber } from '0x.js'
import { addDays } from 'date-fns'
import get from 'lodash/get'
import { getWeightedAveragePrice } from '@/services/transaction'
import { getOrderConfigAsync, submitOrder } from '@/services/orders'
import Modal from './Modal'
import Button from '@/ui/Button'
import FeeAndExpiration from '@/modules/exchange/ui/FeeAndExpiration'

export default {
  name: 'ModalPartialFill',

  components: {
    Modal,
    Button,
    FeeAndExpiration,
  },

  props: {
    id: String,
    data: Object,
  },

  data () {
    return {
      Date,
      BigNumber,
      timestamp: addDays(Date.now(), 1).getTime(),
      orderConfig: {},
    }
  },

  computed: {
    ...mapState(['preferredCurrencySymbol']),
    ...mapGetters(['preferredCurrencySign']),
    ...mapState('exchange', ['assetsBySymbol']),
    ...mapGetters('exchange', ['assetsCryptoCompareInfoSelector']),
    ...mapState('exchange/trading', ['isFiat']),
    ...mapState('exchange/wallet', [
      'balancesAndAllowancesBySymbol',
      'ethAccount',
    ]),
    title () {
      return this.data.market.mode === 'buy'
        ? 'Buy'
        : 'Sell'
    },
    makerTakerAssets () {
      const [makerSymbol, takerSymbol] = this.data.market.pair.split('/')
      return {
        maker: this.assetsBySymbol[makerSymbol],
        taker: this.assetsBySymbol[takerSymbol],
      }
    },
    masterAsset () {
      return this.data.market.mode === 'buy'
        ? this.makerTakerAssets.taker
        : this.makerTakerAssets.maker
    },
    quoteAsset () {
      return this.data.market.mode === 'buy'
        ? this.makerTakerAssets.maker
        : this.makerTakerAssets.taker
    },
    masterAssetBalance () {
      const balance = this.balancesAndAllowancesBySymbol[this.masterAsset.symbol].balance
      return BigNumber(balance).dividedBy(`1e${this.masterAsset.decimals}`)
    },
    quoteAssetBalance () {
      const balance = this.balancesAndAllowancesBySymbol[this.quoteAsset.symbol].balance
      return BigNumber(balance).dividedBy(`1e${this.quoteAsset.decimals}`)
    },
    masterFiatPrice () {
      return get(this.assetsCryptoCompareInfoSelector(this.masterAsset.symbol, this.preferredCurrencySymbol), 'PRICE')
    },
    price () {
      return getWeightedAveragePrice(this.data.market.fillableRecords)[this.masterAsset.symbol]
    },
    quoteAmount () {
      const { makerAmount, takerAmount } = this.data.market
      return makerAmount || takerAmount
    },
    filledQuoteAmount () {
      return BigNumber(this.data.transaction.filledAmounts[this.quoteAsset.symbol]).dividedBy(`1e${this.quoteAsset.decimals}`)
    },
    missingQuoteAmount () {
      return BigNumber(this.quoteAmount).minus(this.filledQuoteAmount)
    },
  },

  mounted () {
    this.setOrderConfig()
  },

  methods: {
    ...mapActions('exchange/modalArea', [
      'removeOpenedModal',
    ]),
    async handleSubmit () {
      await this.setOrderConfig()
      await this.submitOrder()
      this.removeOpenedModal(this.id)
    },
    async setOrderConfig () {
      try {
        const [takerSymbol, makerSymbol] = this.data.market.pair.split('/')
        this.orderConfig = await getOrderConfigAsync({
          takerSymbol,
          makerSymbol,
          timestamp: this.timestamp,
          ethAccount: this.ethAccount,
          amounts: {
            [this.quoteAsset.symbol]: this.missingQuoteAmount,
            [this.masterAsset.symbol]: this.missingQuoteAmount.multipliedBy(this.price),
          },
        })
      } catch (e) {
        this.orderConfig = {}
        throw e
      }
    },
    async submitOrder () {
      try {
        await submitOrder(this.orderConfig)
      } catch (e) {
        throw e
      }
    },
  },
}
</script>

<style lang="scss">
.c-partial-fill {
  background-image: linear-gradient(to right,
    #222427 0%, #222427 calc(50% - 30px),
    #1d1e22 50%,
    #313538 50%, #313538 100%
  );

  .c-modal__content {
    justify-content: space-around;
  }
}

.c-partial-fill__column {
  flex-basis: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 15px 20px 15px;
  max-width: 280px;
}

.c-partial-fill__header {
  text-align: center;
}

.c-partial-fill__title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 5px;

  &.-success { color: $green; }
  svg { margin-right: 5px; }
}

.c-partial-fill__description {
  color: rgba($white, 0.5);
  margin-bottom: 15px;
}

.c-partial-fill__input {
  display: flex;
  width: 100%;
  margin-bottom: 10px;

  &.-first { margin-top: 20px; }
}

.c-partial-fill__label {
  width: 75px;
  padding: 7px 14px;

  .-dark & { background-color: #232527; }
  .-light & { background-color: #2a2c30; }
}

.c-partial-fill__amount {
  flex-grow: 1;
  padding: 7px 14px;

  .-dark & { background-color: #2e3134; }
  .-light & { background-color: #313538; }
}

.c-partial-fill__fee-and-expiration {
  width: 100%;
  height: auto !important;
  padding: 0;
  margin-top: 5px;
  border-top: none;
}

.c-partial-fill__arrow {
  color: $blue;
  transform: rotate(90deg);
  width: 20px;
  height: auto;
  margin: 0 0 15px 0;
}

.c-partial-fill__link {
  color: rgba($white, 0.5);
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-align: center;
  text-transform: uppercase;
  margin-top: 10px;
}

.c-partial-fill__footer {
  margin-top: 5px;
  width: 100%;
}

.c-partial-fill__footer-heading {
  font-size: 11px;
  font-weight: 400;
  line-height: 25px;
  opacity: 0.5;
  text-transform: uppercase;
}

.c-partial-fill__footer-balances {
  display: flex;
  justify-content: space-between;
  width: 85%;
  font-size: 12px;
}

.c-partial-fill__footer-link {
  display: block;
  margin-bottom: 10px;
}
</style>
