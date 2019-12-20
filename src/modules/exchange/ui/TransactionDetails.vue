<template>
  <div class="c-transaction-details">
    <h5 class="c-transaction-details__heading">TXH</h5>
    <a
      v-if="txHash"
      class="c-transaction-details__number __link">
      {{ txHash }}
    </a>
    <span
      v-else
      class="c-transaction-details__number __link">
      -
    </span>

    <template v-if="status === 'pending'">
      <h5 class="c-transaction-details__heading">Pending</h5>
      <div class="c-transaction-details__timer">{{ pendingCounter.hrs }} hrs {{ pendingCounter.mins }} mins {{ pendingCounter.sec }} sec</div>
    </template>
    <template v-else-if="statusText">
      <h5 class="c-transaction-details__heading">Status</h5>
      <div
        :class="`-${status}`"
        class="c-transaction-details__status">
        {{ statusText }}
      </div>
    </template>
    <template v-else-if="status === 'success' || status === 'failure'">
      <h5 class="c-transaction-details__heading">Block Height</h5>
      <a
        v-if="blockHeight"
        class="c-transaction-details__id __link">
        {{ blockHeight }}
      </a>
      <div
        v-else
        class="c-transaction-details__id __link">
        -
      </div>
    </template>

    <h5 class="c-transaction-details__heading">TO</h5>
    <div class="c-transaction-details__recipient">
      <Avatar
        :address="contractAddress"
        class="c-transaction-details__identicon" />
      <a class="c-transaction-details__recipient-name __link">
        Contract: {{ symbol }}
      </a>
      <div
        v-if="status === 'failure'"
        class="c-transaction-details__error">
        Error encountered during contract execution.
      </div>
    </div>
    <div class="c-transaction-details__fees">
      <h5 class="c-transaction-details__heading">Network Fee / TX Gas</h5>
      <div class="c-transaction-details__row">
        <span
          v-if="status === 'pending'"
          class="c-transaction-details__fee-message -pending">
          Pending...
        </span>
        <span
          v-else
          :class="`-${status}`"
          class="c-transaction-details__fee-message">
          <template v-if="ethFee">{{ ethFee }} ETH</template>
          <template v-else>-</template>
        </span>
        <strong class="c-transaction-details__fee-amount">
          {{ preferredCurrencySign }}{{ fiatFee || '-.--' }}
        </strong>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { BigNumber } from '0x.js'
import zipObject from 'lodash/zipObject'
import get from 'lodash/get'
import Avatar from '@/ui/Avatar'

export default {
  name: 'TransactionDetails',
  components: {
    Avatar,
  },
  props: {
    txHash: String,
    symbol: String,
    status: String,
    gasPrice: String,
    gas: Number,
    blockHeight: Number,
    timestamp: Number,
    statusText: String,
  },
  data () {
    return {
      pendingTimeout: undefined,
      pendingCounter: {
        hrs: '00',
        mins: '00',
        sec: '00',
      },
    }
  },
  mounted () {
    this.pendingTimer()
  },
  computed: {
    ...mapGetters(['preferredCurrencySign']),
    ...mapState(['preferredCurrencySymbol']),
    ...mapGetters('exchange', ['assetsCryptoCompareInfoSelector']),
    ...mapState('exchange', ['assetsBySymbol']),
    contractAddress () {
      return get(this.assetsBySymbol, `${this.symbol}.contract_address`)
    },
    ethFee () {
      return this.gas && this.gasPrice
        ? BigNumber(this.gas).multipliedBy(this.gasPrice).dividedBy('1e18')
        : undefined
    },
    fiatFee () {
      const ethPrice = this.assetsCryptoCompareInfoSelector('WETH', this.preferredCurrencySymbol).PRICE
      return this.ethFee
        ? BigNumber(this.ethFee).multipliedBy(ethPrice)
        : undefined
    },
  },
  methods: {
    pendingTimer () {
      if (this.status === 'pending') {
        const timestampNow = new Date()
        const timestampDifference = new Date(timestampNow - this.timestamp)
        // ISO date example: 1970-01-01T09:30:34.000Z; our substring contains everything from the `day` to the `second`
        const timeUnitsArray = timestampDifference.toISOString().substr(8, 11).split(/[:T]/)
          .map(unit => parseInt(unit, 10))
          .map(unit => Math.floor(unit).toString().padStart(2, '0'))
        if (this.pendingTimeout) clearTimeout(this.pendingTimeout)
        this.pendingCounter = zipObject(['days', 'hrs', 'mins', 'sec'], timeUnitsArray)
        this.pendingTimeout = setTimeout(() => this.pendingTimer(), 1000)
      }
    },
  },
}
</script>

<style lang="scss">
.c-transaction-details {
  padding: 10px 25px;
  max-width: 350px;
  width: 100%;
  margin: 0 auto;
}

.c-transaction-details__heading {
  margin-bottom: 2px;
  line-height: 15px;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  opacity: 0.5;

  &:not(:first-of-type) {
    margin-top: 15px;
  }
}

.c-transaction-details__number {
  display: block;
  font-size: 12px;
  font-weight: 600;
  line-height: 15px;
  word-break: break-word;
}

.c-transaction-details__timer {
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
}

.c-transaction-details__status {
  font-size: 14px;
  text-transform: uppercase;
  font-weight: bold;

  &.-success { color: $green; }
  &.-failure { color: $red; }
}

.c-transaction-details__recipient {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.c-transaction-details__error {
  position: relative;
  width: 100%;
  margin: 2px 0 0 32px;
  padding: 4px 0 0 10px;
  font-size: 11px;
  color: #fe1313;

  &::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 2px;
    display: inline-block;
    height: 10px;
    width: 8px;
    border-bottom: 1px solid $white;
    border-left: 1px solid $white;
  }
}

.c-transaction-details__identicon {
  margin-top: 2px;
  margin-right: 5px;
}

.c-transaction-details__fees {
  padding: 15px 0;
  margin-top: 15px;
  border-top: 1px solid $white;
}

.c-transaction-details__row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.c-transaction-details__fee-message {
  &.-pending { font-style: italic; }
  &.-success { font-weight: bold; }
}
</style>
