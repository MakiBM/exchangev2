<template>
  <ModalInner
    v-if="!isPurging"
    v-bind="$attrs">
    <template v-slot:left>
      <div class="c-modal-weth-get">

        <Toggle
          v-if="isStatus([undefined, 'beforeSign'])"
          leftLabel="UNWRAP"
          rightLabel="WRAP"
          class="c-modal-weth-get__toggle -grey -small"
          :checked="isWrapping"
          @click.native="toggleWrap" />

        <ModalGetDetails
          :pendingHeadline="isWrapping ? 'Wrapping' : 'Unwrapping'"
          :showPendingValue="true"
          class="c-modal-weth-get__head"
          :activeSide="isWrapping ? 'left' : 'right'"
          leftName="Ether"
          leftSymbol="ETH"
          leftIcon="eth-big"
          :leftToken="{balance: ethBalance, token: { decimals: 18 }}"
          rightName="Wrapped Ether"
          rightSymbol="WETH"
          rightIcon="weth-big"
          :rightToken="weth"
          :status="transaction.status"
          :totalAmountFiat="amountFiat"
          :totalAmount="amount"
          :amount="amount">
          <template v-slot:separator>
            <div class="c-modal-weth-get__separator">
              <div
                :class="{'-rotate': !isWrapping}"
                class="c-modal-weth-get__separator-arrows">
                <img
                  class="c-modal-weth-get__separator-arrow -left"
                  src="@/assets/icons/arrow.svg"
                  svg-inline
                  svg-sprite>
                <img
                  class="c-modal-weth-get__separator-arrow -right -active"
                  src="@/assets/icons/arrow.svg"
                  svg-inline
                  svg-sprite>
              </div>
            </div>
          </template>
          <template v-slot:separatorLabel>
            <small class="c-modal-weth-get__separatorLabel">1 ETH = 1 WETH</small>
          </template>
        </ModalGetDetails>

        <div
          v-if="isStatus([undefined, 'beforeSign'])"
          class="c-modal-weth-get__input">
          <ItemFocusArrow v-if="!isValidInput" />
          <BaseInput
            :class="{'-active': !isValidInput}"
            class="c-modal-weth-get__input-control -big"
            placeholder="Enter Amount"
            :token="isWrapping ? 'ETH' : 'WETH'"
            :info="amountFiat || `(Min. 0.01 ${isWrapping ? 'ETH' : 'WETH'})`"
            :value="amount"
            @input="setAmount" />
        </div>

        <Button
          :class="{'-disabled': isButtonDisabled}"
          class="c-modal-zrx-get__button -blue -medium -full-width"
          @click.native="handleButtonClick">
          <ItemFocusArrow v-if="!isButtonDisabled" />
          <template v-if="isStatus(['beforeSign', 'pending'])">Waiting for TX Confirmation</template>
          <template v-else-if="isStatus(['failure'])">Try Again</template>
          <template v-else-if="isStatus(['success']) && isStandalone">Continue Trading</template>
          <template v-else-if="isStatus(['success'])">Next Step</template>
          <template v-else>
            <img
              class="c-modal-weth-get__button-icon"
              src="@/assets/icons/arrow-double.svg"
              svg-inline
              svg-sprite>
            Wrap Ether
          </template>
        </Button>
      </div>
    </template>

    <template v-slot:right>
      <TransactionConfirm v-if="isStatus(['beforeSign'])" />
      <TransactionDetails
        v-else-if="isStatus(['pending', 'success', 'failure'])"
        :txHash="transaction.txHash"
        :status="transaction.status"
        :gas="transaction.gasUsed"
        :gasPrice="transaction.gasPrice"
        :blockHeight="transaction.blockNumber"
        :timestamp="transaction.timestamp"
        symbol="WETH" />
      <ModalInnerInfo
        v-else
        title="What is Wrapped Ether?">
        <template v-slot:desc>
          <p>Etherblockchain.io Exchange only supports the trading of Ethereum ERC20 tokens at this time. Ether/ETH which is the native token of the Ethereum Blockchain is not an ERC20 token. Therefore, to trade Ether on the Exchange you’ll first have to “Wrap” it.</p>
          <p>Wrapping ETH is a reversible transaction. You can “Unwrap” WETH back to ETH 1:1 at anytime so don’t worry about losing your ETH.</p>
        </template>
        <template v-slot:notice>
          Do not wrap all of your Ether! Make sure to leave some Ether unwrapped in order to pay network transaction fees during trading.
        </template>
      </ModalInnerInfo>
    </template>
  </ModalInner>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { BigNumber } from '0x.js'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/fp/includes'
import { toHumanUnit, toFixed } from '@/filters'
import Toggle from '@/ui/Toggle'
import BaseInput from '@/ui/Input'
import Button from '@/ui/Button'
import ModalGetDetails from './ModalGetDetails'
import ModalInner from './ModalInner'
import ModalInnerInfo from './ModalInnerInfo'
import ItemFocusArrow from '@/modules/exchange/ui/ItemFocusArrow'
import TransactionConfirm from '@/modules/exchange/ui/TransactionConfirm'
import TransactionDetails from '@/modules/exchange/ui/TransactionDetails'
import { STANDALONE_WETH_GET } from './constants'

export default {
  name: 'ModalOnboardingWethGet',

  components: {
    Toggle,
    BaseInput,
    Button,
    ModalInner,
    ModalInnerInfo,
    ItemFocusArrow,
    TransactionConfirm,
    TransactionDetails,
    ModalGetDetails,
  },

  data () {
    return {
      isUndefined,
      isPurging: false,
    }
  },

  computed: {
    ...mapState(['preferredCurrencySymbol']),
    ...mapGetters(['preferredCurrencySign']),
    ...mapGetters('exchange', ['assetsCryptoCompareInfoSelector']),
    ...mapState('exchange/wallet', [
      'ethBalance',
      'balancesAndAllowancesBySymbol',
    ]),
    ...mapState('exchange/wrap', [
      'amount',
      'transaction',
      'isWrapping',
    ]),
    weth () {
      return this.balancesAndAllowancesBySymbol['WETH']
    },
    amountFiat () {
      const price = this.assetsCryptoCompareInfoSelector('WETH', this.preferredCurrencySymbol).PRICE
      return this.amount && price
        ? this.preferredCurrencySign + toFixed(BigNumber(this.amount).multipliedBy(price).toString(), 2)
        : undefined
    },
    isValidInput () {
      if (!this.weth) return false
      const hasBalance = this.isWrapping
        ? BigNumber(toHumanUnit(this.ethBalance, 18)).isGreaterThanOrEqualTo(this.amount)
        : BigNumber(toHumanUnit(this.weth.balance, this.weth.token.decimals)).isGreaterThanOrEqualTo(this.amount)
      return hasBalance && BigNumber(this.amount).isGreaterThanOrEqualTo(0.01)
    },
    isButtonDisabled () {
      return (this.isStatus([undefined]) && !this.isValidInput)
        || this.isStatus(['beforeSign', 'pending'])
    },
    isStandalone () {
      return !this.$attrs.rightNav
    },
  },

  async mounted () {
    await this.cleanUp()
    if (this.$attrs.onmounted) this.$attrs.onmounted()
  },

  beforeDestroy () {
    this.cleanUp()
  },

  methods: {
    ...mapActions('exchange/wrap', [
      'reset',
      'purgeTransaction',
      'sendTransaction',
      'setTransaction',
    ]),
    ...mapMutations('exchange/wrap', [
      'setIsWrapping',
      'setAmount',
    ]),
    async cleanUp () {
      if (!this.isStatus(['pending'])) this.reset()
      this.isPurging = true
      await this.purgeTransaction()
      this.isPurging = false
    },
    toggleWrap () {
      this.setIsWrapping(!this.isWrapping)
    },
    isStatus (statuses) {
      return includes(this.transaction.status, statuses)
    },
    handleButtonClick () {
      // Try Again
      if (this.isStatus(['failure'])) this.setTransaction({ status: undefined })
      // Continue Trading
      else if (this.isStatus(['success']) && this.isStandalone) this.removeOpenedModal(STANDALONE_WETH_GET)
      // Next Step
      else if (this.isStatus(['success'])) this.$attrs.rightNav.onclick()
      // Wrap / Unwarp
      else this.sendTransaction()
    },
  },
}
</script>

<style lang="scss">
.c-modal-weth-get {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-width: 250px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 15px;
  color: rgba($white, 0.5);

  small { font-size: 11px; }
  .-active { color: $white; }
}

.c-modal-weth-get__toggle {
  color: $white;
  margin: 0 auto;
  margin-bottom: 20px;
  transform: translateX(-10px);
}

.c-modal-weth-get__separator {
  position: relative;
  top: 10px;
}

.c-modal-weth-get__separator-arrows {
  position: relative;
  margin: 0 auto 5px auto;
  width: 30px;
  height: 25px;
  color: rgba($white, 0.2);
  transition: transform $quick-ease;

  &.-rotate { transform: rotate(180deg); }
}

.c-modal-weth-get__separator-arrow {
  position: absolute;
  height: 15px;
  width: auto;

  &.-left {
    top: 0;
    left: 0;
    transform: scaleX(-1);
  }

  &.-right {
    bottom: 0;
    right: 0;
  }
}

.c-modal-weth-get__input {
  position: relative;
}

.c-modal-weth-get__input-control {
  background-color: rgba($white, 0.1);
}

.c-modal-weth-get__button {
  margin-top: 10px;
}

.c-modal-weth-get__button-icon {
  height: 12px;
  width: auto;
  margin-right: 5px;
}
</style>
