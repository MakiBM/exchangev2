<template>
  <ModalInner
    v-if="!isPurging"
    v-bind="$attrs">
    <template v-slot:left>
      <div class="c-modal-zrx-get">

        <ModalGetDetails
          activeSide="left"
          leftName="Wrapped Ether"
          leftSymbol="WETH"
          leftIcon="weth-big"
          :leftToken="weth"
          rightName="0x"
          rightSymbol="ZRX"
          rightIcon="zrx-big"
          :rightToken="zrx"
          pendingHeadline="Pending Transaction"
          :status="lastActiveTransaction.status"
          :totalAmountFiat="totalAmountFiat"
          :totalAmount="totalAmount"
          :amount="market.makerAmount">
          <template v-slot:separator>
            <img
              class="c-modal-zrx-get__arrow"
              src="@/assets/icons/arrow.svg"
              svg-inline
              svg-sprite>
          </template>
        </ModalGetDetails>

        <template v-if="isStatus([undefined, 'beforeSign'])">
          <div class="c-modal-zrx-get__price">
            Current ZRX Price
            <span v-if="currentPrice">{{ currentPrice | toFixed(8) }}</span>
            <TextPlaceholder v-else />
            WETH
          </div>
          <div class="c-modal-zrx-get__input-wrap">
            <ItemFocusArrow v-if="!isValidInput" />
            <span>Amount</span>
            <BaseInput
              :class="{'-active': !isValidInput}"
              class="c-modal-zrx-get__input"
              placeholder="Enter Amount"
              token="ZRX"
              :disabled="isStatus(['beforeSign'])"
              :value="market.makerAmount"
              @input="handleInput" />
          </div>
          <div class="c-modal-zrx-get__input-wrap">
            <span>Total</span>
            <BaseInput
              class="c-modal-zrx-get__input"
              token="WETH"
              :disabled="true"
              :info="totalAmountFiat"
              :value="totalAmount | toFixed(8)" />
          </div>
        </template>

        <Button
          :class="{'-disabled': isButtonDisabled}"
          class="c-modal-zrx-get__button -blue -medium -full-width"
          @click.native="handleButtonClick">
          <ItemFocusArrow v-if="!isButtonDisabled" />
          <template v-if="isStatus(['beforeSign', 'pending'])">Waiting for TX Confirmation</template>
          <template v-else-if="isStatus(['failure'])">Try Again</template>
          <template v-else-if="isStatus(['success'])">Next Step</template>
          <template v-else>Get ZRX</template>
        </Button>
      </div>
    </template>

    <template
      v-slot:right>
      <TransactionConfirm v-if="isStatus(['beforeSign'])" />
      <TransactionDetails
        v-else-if="isStatus(['pending', 'success', 'failure'])"
        :txHash="lastActiveTransaction.txHash"
        :status="lastActiveTransaction.status"
        :gas="lastActiveTransaction.gasUsed"
        :gasPrice="lastActiveTransaction.gasPrice"
        :blockHeight="lastActiveTransaction.blockNumber"
        :timestamp="lastActiveTransaction.timestamp"
        symbol="ZRX" />
      <ModalInnerInfo
        v-else
        title="Why do I need ZRX?">
        <template v-slot:desc>
          <p>EtherBlockchain.io Exchange is Powered By 0x Protocol. The 0x token “ZRX” is needed to pay Exchange fees.</p>
          <p>Current exchange fees can be found <a class="__link">here</a>.</p>
          <br>
        </template>
        <template v-slot:notice>
          In addition to needing ZRX for Exchange fees, a small Ethereum network TxFee is also required to complete the transaction.
        </template>
      </ModalInnerInfo>
    </template>
  </ModalInner>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { BigNumber } from '0x.js'
import includes from 'lodash/fp/includes'
import get from 'lodash/get'
import BaseInput from '@/ui/Input'
import Button from '@/ui/Button'
import TextPlaceholder from '@/ui/TextPlaceholder'
import TransactionConfirm from '@/modules/exchange/ui/TransactionConfirm'
import TransactionDetails from '@/modules/exchange/ui/TransactionDetails'
import ModalGetDetails from './ModalGetDetails'
import ModalInner from './ModalInner'
import ModalInnerInfo from './ModalInnerInfo'
import ItemFocusArrow from '@/modules/exchange/ui/ItemFocusArrow'
import { toBaseUnit, toFixed } from '@/filters'
import { getWeightedAveragePrice } from '@/services/transaction'

export default {
  name: 'ModalOnboardingZrxGet',
  components: {
    BaseInput,
    Button,
    ModalInner,
    ModalInnerInfo,
    ItemFocusArrow,
    TextPlaceholder,
    TransactionConfirm,
    TransactionDetails,
    ModalGetDetails,
  },
  data () {
    return {
      isPurging: false,
    }
  },
  computed: {
    ...mapState(['preferredCurrencySymbol']),
    ...mapGetters(['preferredCurrencySign']),
    ...mapState('exchange', ['assetsBySymbol']),
    ...mapState('exchange/wallet', ['balancesAndAllowancesBySymbol']),
    ...mapState('exchange/market', ['marketsByPair']),
    ...mapGetters('exchange', ['assetsCryptoCompareInfoSelector']),
    marketSymbol () {
      return 'ZRX/WETH/GET_ZRX'
    },
    market () {
      return get(this.marketsByPair, [this.marketSymbol], {})
    },
    weightedAveragePrice () {
      const amount = this.market.makerAmount || this.market.takerAmount
      return amount && this.market.fillableRecords && getWeightedAveragePrice(this.market.fillableRecords)
    },
    marketPrice () {
      const amount = this.market.makerAmount || this.market.takerAmount
      return !this.market.isFillableRecordsLoading && !amount && this.market.marketPrice
    },
    lastActiveTransaction () {
      const id = get(this.market, 'transactionsSorted[0]')
      return get(this.market, ['transactionsById', id], {})
    },
    weth () {
      return this.balancesAndAllowancesBySymbol['WETH']
    },
    zrx () {
      return this.balancesAndAllowancesBySymbol['ZRX']
    },
    currentPrice () {
      const price = this.weightedAveragePrice || this.marketPrice
      return price && price['WETH']
    },
    totalAmount () {
      return this.currentPrice > 0 && this.market.makerAmount > 0
        ? BigNumber(this.currentPrice).multipliedBy(this.market.makerAmount).toString()
        : undefined
    },
    totalAmountFiat () {
      const zrxPrice = this.assetsCryptoCompareInfoSelector('ZRX', this.preferredCurrencySymbol).PRICE
      return this.market.makerAmount && zrxPrice
        ? this.preferredCurrencySign + toFixed(BigNumber(this.market.makerAmount).multipliedBy(zrxPrice).toString(), 2)
        : undefined
    },
    hasEnoughBalance () {
      if (!this.weth) return
      const totalAmountInBaseUnit = toBaseUnit(this.totalAmount, this.weth.token.decimals)
      return BigNumber(this.weth.balance).isGreaterThan(totalAmountInBaseUnit)
    },
    isValidInput () {
      return this.totalAmount && this.hasEnoughBalance
    },
    isButtonDisabled () {
      return (this.isStatus([undefined]) && !this.isValidInput)
        || this.isStatus(['beforeSign', 'pending'])
    },
  },

  mounted () {
    this.cleanUp()
    this.getMarketPrice(this.marketSymbol)
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
      'sendTransaction',
      'resetMarket',
      'purgeTransactions',
    ]),
    async cleanUp () {
      if (!this.isStatus(['pending'])) this.resetMarket(this.marketSymbol)
      this.isPurging = true
      await this.purgeTransactions(this.marketSymbol)
      this.isPurging = false
    },
    handleInput (makerAmount) {
      this.setOrderAmount({ pair: this.marketSymbol, makerAmount })
      this.setFillableRecords(this.marketSymbol)
    },
    handleButtonClick () {
      // Try Again
      if (this.isStatus(['failure'])) this.setTxStatus({ pair: this.marketSymbol, status: undefined })
      // Next Step
      else if (this.isStatus(['success']) && this.$attrs.rightNav) this.$attrs.rightNav.onclick()
      // Get Zrx
      else this.sendTransaction(this.marketSymbol)
    },
    isStatus (statuses) {
      return includes(this.lastActiveTransaction.status, statuses)
    },
  },
}
</script>

<style lang="scss">
.c-modal-zrx-get {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 250px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 15px;
  color: rgba($white, 0.5);

  small { font-size: 11px; }
  .-active { color: $white; }
}

.c-modal-zrx-get__price {
  text-align: right;
  width: 100%;
  font-size: 11px;
}

.c-modal-zrx-get__input-wrap {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0;
  width: calc(100% + 20px);
  color: $white;
  font-size: 12px;
}

.c-modal-zrx-get__input {
  font-size: 11px;
  color: $white;
  width: 210px;
  background-color: rgba($white, 0.1);

  .c-input__token {
    width: 55px;
  }
}

.c-modal-zrx-get__button {
  margin-top: 10px;
}

.c-modal-zrx-get__arrow {
  width: auto;
  height: 20px;
}
</style>
