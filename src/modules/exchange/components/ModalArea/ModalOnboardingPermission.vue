<template>
  <ModalInner
    v-if="balancesAndAllowancesBySymbol"
    v-bind="$attrs">
    <template v-slot:left>
      <ModalInnerAction
        title="Trading Permission"
        :desc="'The ERC20 standard requires you give permission \n to make orders. Flip the switch to enable.'"
        :buttonText="action.buttonText"
        :isDisabled="isSingle && (!isUnlocked(activeSymbol) || isStatus(['beforeSign', 'pending'], activeSymbol))"
        :isFocused="isSingle && isUnlocked(activeSymbol) && !isStatus(['beforeSign', 'pending'], activeSymbol)"
        @buttonClick="action.buttonClick">
        <div class="c-modal-onboarding-permission__toggles">
          <AssetToggleRow
            v-for="symbol in $attrs.symbols"
            :key="`c-modal-onboarding-permission__toggle-${symbol}`"
            class="c-modal-onboarding-permission__toggle"
            :isSigning="isStatus(['beforeSign'], symbol)"
            :isPending="isStatus(['pending'], symbol)"
            :isUnlocked="isUnlocked(symbol)"
            :symbol="symbol"
            @toggle="onToggle(symbol)" />
        </div>
      </ModalInnerAction>
    </template>
    <template v-slot:right>
      <TransactionConfirm v-if="isStatus(['beforeSign'], activeSymbol)" />
      <TransactionDetails
        v-else-if="!isPurging && isStatus(['pending', 'success', 'failure'], activeSymbol)"
        :txHash="activeTransaction.txHash"
        :status="activeTransaction.status"
        :statusText="statusText"
        :gas="activeTransaction.gasUsed"
        :gasPrice="activeTransaction.gasPrice"
        :blockHeight="activeTransaction.blockNumber"
        :timestamp="activeTransaction.timestamp"
        :symbol="activeSymbol" />
      <ModalInnerInfo
        v-else-if="!isPurging"
        title="Why do I need to set Trading Permissions?">
        <template v-slot:desc>
          <p>Enabling trading permission is a requirement of the ERC20 standard to use the Exchange. This requirement ensures tokens can't be traded from your Ethereum Account by a third party without your permission. Enabling this allowance does not mean you are giving your tokens to the Exchange or a 3rd party. It means you are willingly allowing the 0x smart contracts to transfer up to a specified amount of tokens from your Ethereum Account on your behalf.</p>
        </template>
        <template v-slot:notice>
          There is an Ethereum Network Fee to enable your trading permission for each token you’d like to trade. You will only need to turn permission for a token on once to trade it on any 0x protocol exchange.
        </template>
      </ModalInnerInfo>
    </template>
  </ModalInner>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import get from 'lodash/get'
import includes from 'lodash/fp/includes'
import AssetToggleRow from '@/modules/exchange/ui/AssetToggleRow'
import TransactionConfirm from '@/modules/exchange/ui/TransactionConfirm'
import TransactionDetails from '@/modules/exchange/ui/TransactionDetails'
import ModalInner from './ModalInner'
import ModalInnerInfo from './ModalInnerInfo'
import ModalInnerAction from './ModalInnerAction'
import { STANDALONE_PERMISSION } from './constants'

export default {
  name: 'ModalOnboardingZrxPermission',

  components: {
    AssetToggleRow,
    TransactionConfirm,
    TransactionDetails,
    ModalInner,
    ModalInnerInfo,
    ModalInnerAction,
  },

  data () {
    return {
      isPurging: false,
    }
  },

  computed: {
    ...mapState('exchange/wallet', ['balancesAndAllowancesBySymbol']),
    ...mapState('exchange/allowances', [
      'activeSymbol',
      'allowancesTransactionsBySymbol',
    ]),
    isSingle () {
      return this.$attrs.symbols.length === 1
    },
    isStandalone () {
      return !this.$attrs.rightNav
    },
    action () {
      if (this.isStandalone) {
        return {
          buttonText: 'Continue Trading',
          buttonClick: () => this.removeOpenedModal(STANDALONE_PERMISSION),
        }
      } else {
        return {
          buttonText: this.isStatus(['beforeSign', 'pending'], this.activeSymbol)
            ? 'Waiting Tx Confirmation'
            : 'Next Step',
          buttonClick: () => this.$attrs.rightNav.onclick()
        }
      }
    },
    statusText () {
      switch (this.activeTransaction.status) {
        case 'success': return 'Successful'
        case 'failure': return 'Failed'
        default: return undefined
      }
    },
    activeTransaction () {
      return this.allowancesTransactionsBySymbol[this.activeSymbol] || {}
    },
  },

  async mounted () {
    this.isPurging = true
    if (this.isSingle) this.setActiveSymbol(this.$attrs.symbols[0])
    await this.purgeAllowancesTransaction(this.activeSymbol)
    this.isPurging = false
    if (this.$attrs.onmounted) this.$attrs.onmounted()
  },

  beforeDestroy () {
    if (this.isStatus(['success', 'failure'], this.activeSymbol)) {
      this.removeAllowancesTransaction(this.activeSymbol)
      this.setActiveSymbol(undefined)
    }
  },

  methods: {
    ...mapActions('exchange/allowances', [
      'toggleAllowances',
      'removeAllowancesTransaction',
      'purgeAllowancesTransaction',
    ]),
    ...mapMutations('exchange/allowances', [
      'setActiveSymbol'
    ]),
    ...mapActions('exchange/modalArea', [
      'removeOpenedModal',
    ]),
    onToggle (symbol) {
      this.setActiveSymbol(symbol)
      if (!this.isStatus(['pending'], symbol)) {
        this.toggleAllowances(symbol)
      }
    },
    isStatus (statuses, symbol) {
      const tx = this.allowancesTransactionsBySymbol[symbol] || {}
      return includes(tx.status, statuses)
    },
    isUnlocked (symbol) {
      return get(this.balancesAndAllowancesBySymbol, [symbol, 'isUnlocked'])
    },
  },
}
</script>

<style lang="scss">
.c-modal-onboarding-permission__toggles {
  align-self: flex-start;
  margin-top: 30px;
  width: 100%;
}
</style>
