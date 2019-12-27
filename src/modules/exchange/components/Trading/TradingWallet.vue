<template>
  <TradingPanel>
    <strong class="c-trading-panel__title __row-spaced">
      {{ isBalance ? 'Balance' : 'Account' }}
      <a
        class="c-trading-wallet__title-link __link"
        @click="toggleIsBalance">
        {{ isBalance ? 'Account' : 'Balance' }}
        <img
          class="c-trading-wallet__title-icon"
          src="@/assets/icons/arrow-reverse.svg"
          svg-inline
          svg-sprite>
      </a>
    </strong>

    <div class="c-trading-wallet__disconnect c-trading-panel__section -light -light-2-rows">
      <Avatar
        class="c-trading-wallet__disconnect-avatar"
        :address="ethAccount" />
      <a class="c-trading-wallet__disconnect-account __link">
        <TruncatedText :text="ethAccount" />
      </a>
      <Button
        class="c-trading-wallet__disconnect-button -medium -grey"
        @click.native="handleDisconnect">
        Disconnect
      </Button>
    </div>

    <template v-if="isBalance">
      <div class="c-trading-wallet__section c-trading-panel__section -border">
        <div class="c-trading-wallet__item">
          <div class="c-trading-wallet__item-label">
            <img
              class="c-trading-wallet__item-emblem"
              :src="require(`@/assets/token-symbols/eth.svg`)">
            <strong>ETH</strong>
            <a
              class="c-trading-wallet__item-link __link"
              @click="handleClickWethGet">
              <img
                src="@/assets/icons/arrow-double.svg"
                svg-inline
                svg-sprite>
            </a>
          </div>
          <strong class="c-trading-wallet__item-balance">
            {{ ethBalance | toHumanUnit(18) | toFixed(8) }}
          </strong>
          <img
            class="c-trading-wallet__item-arrow"
            src="@/assets/icons/arrow.svg"
            svg-inline
            svg-sprite>
          <div class="c-trading-wallet__item-fiat">
            {{ preferredCurrencySign }}{{ ethValue | formatFiat }}
          </div>
        </div>
      </div>
      <template v-for="(item, i) in tokens">
        <div
          v-if="item.balance > 0"
          :key="`c-trading-panel-token-${i}`"
          class="c-trading-wallet__section c-trading-panel__section -border">
          <div class="c-trading-wallet__item">
            <div class="c-trading-wallet__item-label">
              <img
                class="c-trading-wallet__item-emblem"
                :src="require(`@/assets/token-symbols/${item.token.symbol.toLowerCase()}.svg`)">
              <strong>{{ item.token.symbol }}</strong>
              <a
                v-if="item.token.symbol === 'WETH'"
                class="c-trading-wallet__item-link __link"
                @click="handleClickWethGet">
                <img
                  src="@/assets/icons/arrow-double.svg"
                  svg-inline
                  svg-sprite>
              </a>
            </div>
            <strong class="c-trading-wallet__item-balance">
              {{ item.balance | toHumanUnit(item.token.decimals) | toFixed(8) }}
            </strong>
            <img
              class="c-trading-wallet__item-arrow"
              src="@/assets/icons/arrow.svg"
              svg-inline
              svg-sprite>
            <div class="c-trading-wallet__item-fiat">
              {{ preferredCurrencySign }}{{ item.value | formatFiat }}
            </div>
          </div>
        </div>
      </template>
    </template>

    <template v-else>
      <div class="c-trading-panel__section">
        <a
          class="__link __upper"
          @click="handleClickPermission">
          Trading Permission
        </a>
      </div>
      <template v-for="(item, i) in tokens">
        <div
          v-if="item.balance > 0"
          :key="`c-trading-panel-token-${i}`"
          class="c-trading-wallet__section c-trading-panel__section -border">
          <div class="c-trading-wallet__item">
            <Toggle
              class="c-trading-wallet__item-label -dark"
              :rightLabel="item.token.symbol"
              :checked="item.isUnlocked"
              :isLoading="isAllowancePending(item.token.symbol)"
              :withSpinner="true"
              :isAllowances="true"
              @click.native="handleClickToggle(item.token.symbol)" />
            <strong class="c-trading-wallet__item-balance">
              {{ item.balance | toHumanUnit(item.token.decimals) | toFixed(8) }}
            </strong>
            <img
              class="c-trading-wallet__item-arrow"
              src="@/assets/icons/arrow.svg"
              svg-inline
              svg-sprite>
            <div class="c-trading-wallet__item-fiat">
              {{ preferredCurrencySign }}{{ item.value | formatFiat }}
            </div>
          </div>
        </div>
      </template>
    </template>

    <div class="c-trading-panel__section -grow">
    </div>

    <div class="c-trading-wallet__total-row c-trading-panel__section -light -light-2-rows">
      <div class="__row-spaced">
        <span class="__upper">Total token value</span>
        <strong
          v-if="isNumeric(totalValue)"
          class="c-trading-wallet__total-value">
          {{ preferredCurrencySign }}{{ totalValue | formatFiat }}
        </strong>
      </div>
    </div>

    <div class="c-trading-panel__button-wrap">
      <Button
        class="-transparent __link"
        @click.native="setIsOnboardingActive(true)">
        Trading Steps
        <img
          class="c-trading-wallet__button-icon"
          src="@/assets/icons/arrow.svg"
          svg-inline
          svg-sprite>
      </Button>
    </div>
  </TradingPanel>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { BigNumber } from '0x.js'
import pull from 'lodash/pull'
import map from 'lodash/map'
import get from 'lodash/fp/get'
import { isNumeric } from '@/utils'
import Button from '@/ui/Button'
import Avatar from '@/ui/Avatar'
import Toggle from '@/ui/Toggle'
import TruncatedText from '@/ui/TruncatedText'
import TradingPanel from './TradingPanel'
import { STANDALONE_PERMISSION, STANDALONE_WETH_GET } from '@/modules/exchange/components/ModalArea/constants'

export default {
  name: 'TradingWallet',
  components: {
    Button,
    Avatar,
    Toggle,
    TruncatedText,
    TradingPanel,
  },
  data () {
    return {
      isNumeric,
    }
  },
  computed: {
    ...mapState(['preferredCurrencySymbol']),
    ...mapGetters(['preferredCurrencySign']),
    ...mapGetters('exchange', ['assetsCryptoCompareInfoSelector']),
    ...mapState('exchange', [
      'masterPairedSymbol',
      'quotePairedSymbol',
    ]),
    ...mapState('exchange/trading', [
      'isBalance'
    ]),
    ...mapState('exchange/wallet', [
      'ethAccount',
      'ethBalance',
      'balancesAndAllowancesBySymbol',
    ]),
    ...mapState('exchange/allowances', [
      'allowancesTransactionsBySymbol',
      'allowancesTransactionsSorted',
    ]),
    tokens () {
      const walletTokens = Object.keys(this.balancesAndAllowancesBySymbol)
      if (this.masterPairedSymbol !== 'WETH' && this.quotePairedSymbol !== 'WETH') pull(walletTokens, 'WETH')
      return walletTokens.map(symbol => {
        const item = this.balancesAndAllowancesBySymbol[symbol]
        const price = this.assetsCryptoCompareInfoSelector(symbol, this.preferredCurrencySymbol).PRICE
        const balance = BigNumber(item.balance).dividedBy(`1e${item.token.decimals}`)
        if (price) item.value = BigNumber(balance).multipliedBy(price)
        return item
      })
    },
    ethValue () {
      const price = this.assetsCryptoCompareInfoSelector('WETH', this.preferredCurrencySymbol).PRICE
      return BigNumber(this.ethBalance).dividedBy('1e18').multipliedBy(price)
    },
    totalValue () {
      const values = this.tokens.map(item => item.value)
      return BigNumber.sum.apply(null, [...values, this.ethValue])
    },
  },

  mounted () {
    this.purgeAllowancesTransaction(this.allowancesTransactionsSorted)
  },

  methods: {
    ...mapActions('exchange/wallet', [
      'reset',
    ]),
    ...mapActions('exchange/trading', [
      'toggleIsBalance'
    ]),
    ...mapActions('exchange/modalArea', [
      'setIsOnboardingActive',
      'addOpenedModal',
    ]),
    ...mapActions('exchange/allowances', [
      'purgeAllowancesTransaction',
    ]),
    ...mapActions('exchange/allowances', ['toggleAllowances']),
    ...mapMutations('exchange/allowances', ['setActiveSymbol']),
    isAllowancePending (symbol) {
      const tx = this.allowancesTransactionsBySymbol[symbol] || {}
      return tx.status === 'pending'
    },
    handleDisconnect () {
      this.reset()
    },
    handleClickToggle (symbol) {
      this.addOpenedModal({
        id: STANDALONE_PERMISSION,
        component: 'ModalStandalonePermission',
        data: {
          symbols: map(this.tokens, get('token.symbol')),
          onmounted: () => {
            this.setActiveSymbol(symbol)
            this.toggleAllowances(symbol)
          },
        },
      })
    },
    handleClickPermission () {
      this.addOpenedModal({
        id: STANDALONE_PERMISSION,
        component: 'ModalStandalonePermission',
        data: {
          symbols: map(this.tokens, get('token.symbol')),
        },
      })
    },
    handleClickWethGet () {
      this.addOpenedModal({
        id: STANDALONE_WETH_GET,
        component: 'ModalStandaloneWethGet',
      })
    },
  },
}
</script>

<style lang="scss">
.c-trading-wallet__title-link {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.c-trading-wallet__title-icon {
  margin-left: 7px;
}

.c-trading-wallet__total-row,
.c-trading-wallet__disconnect {
  display: flex;
  align-items: center;
  overflow: hidden;
}
.c-trading-wallet__disconnect-avatar {
  margin: 0 7px 0 5px;
  flex-shrink: 0;
}

.c-trading-wallet__disconnect-account {
  flex-basis: 100%;
  overflow: hidden;
}

.c-trading-wallet__disconnect-button {
  flex-shrink: 0;
  margin-left: 5px;
}

.c-trading-wallet__button-icon {
  margin-left: 3px;
  height: 9px;
}

.c-trading-wallet__section {
  height: 45px;
}

.c-trading-wallet__item {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.c-trading-wallet__item-label {
  flex-shrink: 0;
  width: 120px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.c-trading-wallet__item-emblem {
  margin-right: 10px;
  width: 24px;
  height: 24px;
}

.c-trading-wallet__item-link {
  margin-left: auto;
  margin-right: 20px;
  transform: translateY(3px);
  svg {
    width: 15px;
    height: 15px;
  }
}

.c-trading-wallet__item-balance {
  width: calc(100% - 200px);
}

.c-trading-wallet__item-arrow {
  flex-shrink: 0;
  opacity: 0.5;
}

.c-trading-wallet__item-fiat {
  flex-shrink: 0;
  width: 80px;
  text-align: right;
  opacity: 0.5;
}

.c-trading-wallet__total-value {
  font-size: 18px;
}
</style>
