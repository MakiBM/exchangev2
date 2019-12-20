<template>
  <Modal
    class="c-modal-onboarding"
    @closeClick="setIsOnboardingActive(false)">

    <div
      v-if="ethAccount"
      class="c-modal-onboarding__address">
      <strong>Account</strong>
      <Avatar
        class="c-modal-onboarding__address-avatar"
        :address="ethAccount" />
      <a class="__link">{{ shortAccount }}</a>
    </div>

    <div class="c-modal-onboarding__menu">
      <h3 class="c-modal-onboarding__title">Start Trading</h3>
      <ul class="c-modal-onboarding__list">
        <li
          v-for="(item, index) in menu"
          :key="`c-modal-onboarding__item--${index}`"
          class="c-modal-onboarding__item">
          <a
            :class="{'-active': item.id === activeOnboardingStep}"
            class="c-modal-onboarding__link"
            @click="setOnboardingStep(item.id)">
            <img
              v-if="item.id === activeOnboardingStep"
              class="c-modal-onboarding__item-icon -arrow"
              src="@/assets/icons/arrow.svg"
              svg-inline
              svg-sprite>
            <img
              v-else-if="item.isSuccess"
              class="c-modal-onboarding__item-icon -checkmark"
              src="@/assets/icons/checkmark-circle.svg"
              svg-inline
              svg-sprite>
            <span>{{ String(index + 1).padStart(2, '0') }}</span> {{ item.listTitle }}
          </a>
        </li>
      </ul>
      <div class="c-modal-onboarding__footer">
        <span>Powered by</span>
        <img
          src="@/assets/logos/0x-protocol.svg"
          svg-inline
          svg-sprite>
      </div>
    </div>

    <template v-for="(item, index) in menu">
      <component
        v-if="item.id === activeOnboardingStep"
        :key="`onboarding-step-${index}`"
        :is="item.component"
        :index="String(index + 1).padStart(2, '0')"
        :title="item.title"
        :desc="item.desc"
        :symbols="item.symbols"
        :leftNav="(index - 1 >= 0) && makeNavItem('Previous Step', index - 1)"
        :rightNav="(index + 1 < menu.length) && makeNavItem(rightNavText, index + 1)" />
    </template>

  </Modal>
</template>

<script>
import isUndefined from 'lodash/isUndefined'
import get from 'lodash/get'
import { mapActions, mapState } from 'vuex'
import Avatar from '@/ui/Avatar'
import Modal from './Modal'
import ModalInner from './ModalInner'
import ModalOnboardingConnect from './ModalOnboardingConnect'
import ModalOnboardingWethGet from './ModalOnboardingWethGet'
import ModalOnboardingZrxGet from './ModalOnboardingZrxGet'
import ModalOnboardingPermission from './ModalOnboardingPermission'
import ModalOnboardingOrder from './ModalOnboardingOrder'
import { STEP_CONNECT_YOUR_ACCOUNT, STEP_WRAP_ETHER, STEP_WETH_PERMISSION, STEP_GET_ZRX, STEP_ZRX_PERMISSION, STEP_CREATE_ORDER } from './constants'

export default {
  name: 'ModalOnboarding',
  components: {
    Avatar,
    Modal,
    ModalInner,
    ModalOnboardingConnect,
    ModalOnboardingWethGet,
    ModalOnboardingZrxGet,
    ModalOnboardingPermission,
    ModalOnboardingOrder,
  },
  data () {
    return {
      rightNavText: '<span class="__link">Skip</span> This Step',
    }
  },
  computed: {
    ...mapState('exchange', [
      'masterPairedSymbol',
    ]),
    ...mapState('exchange/modalArea', ['onboardingStep']),
    ...mapState('exchange/wallet', [
      'ethAccount',
      'balancesAndAllowancesBySymbol',
    ]),
    activeOnboardingStep () {
      return this.menu.some(item => item.id === this.onboardingStep)
        ? this.onboardingStep
        : STEP_CONNECT_YOUR_ACCOUNT
    },
    shortAccount () {
      const tail = this.ethAccount.slice(-15)
      return `...${tail}`
    },
    menu () {
      const items = []
      items.push({
        id: STEP_CONNECT_YOUR_ACCOUNT,
        component: 'ModalOnboardingConnect',
        listTitle: 'Connect Your Account',
        desc: 'In order to interact with the Exchange, connect your Ethereum \n wallet/account to our platform with MetaMask or Ledger.',
        isSuccess: !isUndefined(this.ethAccount),
      })
      if (this.masterPairedSymbol === 'WETH') {
        items.push({
          id: STEP_WRAP_ETHER,
          listTitle: 'Wrap Ether',
          component: 'ModalOnboardingWethGet',
          title: 'Wrap Ether',
          isSuccess: get(this.balancesAndAllowancesBySymbol, ['WETH', 'balance'], 0) > 0.001,
        })
        items.push({
          id: STEP_WETH_PERMISSION,
          listTitle: 'WETH Trading Permission',
          component: 'ModalOnboardingPermission',
          symbols: ['WETH'],
          desc: 'Set trading permissions for a token \n you\'d like to start trading.',
          isSuccess: get(this.balancesAndAllowancesBySymbol, ['WETH', 'isUnlocked']),
        })
      }
      items.push({
        id: STEP_GET_ZRX,
        listTitle: 'Get ZRX for Trading Fees',
        component: 'ModalOnboardingZrxGet',
        title: 'Get ZRX',
        isSuccess: get(this.balancesAndAllowancesBySymbol, ['ZRX', 'balance'], 0),
      })
      items.push({
        id: STEP_ZRX_PERMISSION,
        listTitle: 'ZRX Trading Permission',
        component: 'ModalOnboardingPermission',
        symbols: ['ZRX'],
        desc: 'Set trading permissions for a token \n you\'d like to start trading.',
        isSuccess: get(this.balancesAndAllowancesBySymbol, ['ZRX', 'isUnlocked']),
      })
      items.push({
        id: STEP_CREATE_ORDER,
        listTitle: 'Create and Order',
        component: 'ModalOnboardingOrder',
        desc: 'Start trading by creating \n your first order.',
        isSuccess: items.every(item => item.isSuccess)
      })
      return items
    }
  },
  methods: {
    ...mapActions('exchange/modalArea', [
      'setOnboardingStep',
      'setIsOnboardingActive',
    ]),
    makeNavItem (text, index) {
      return {
        text,
        onclick: () => this.setOnboardingStep(this.menu[index].id),
      }
    }
  },
}
</script>

<style lang="scss">
.c-modal-onboarding__address {
  position: absolute;
  top: 15px;
  right: 45px;
  display: flex;
  align-items: center;
  height: 27px;
}

.c-modal-onboarding__address-avatar {
  margin: 0 10px;
}

.c-modal-onboarding__menu {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  flex-shrink: 0;
  padding: 30px 30px 10px 30px;
  width: 260px;
  height: 100%;
  background-color: $grey-2;
  box-shadow: inset -20px 0px 20px -20px rgba($black, 0.3);
}

.c-modal-onboarding__title {
  margin-bottom: 25px;
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  text-transform: uppercase;
}

.c-modal-onboarding__list {
  width: 100%;
}

.c-modal-onboarding__item {
  position: relative;
  margin-bottom: 17px;
  padding-left: 5px;
  span { margin-right: 5px; }
}

.c-modal-onboarding__item-icon {
  position: absolute;
  right: calc(100% + 5px);
  width: auto;

  &.-arrow {
    height: 10px;
    top: 5px;
  }
  &.-checkmark {
    height: 12px;
    top: 3px;
    color: $green;
  }
}

.c-modal-onboarding__link {
  font-size: 12px;
  letter-spacing: 0.05px;
  line-height: 18px;
  text-decoration: none;
  text-transform: uppercase;
  color: rgba($white, 0.3);
  transition: color $quick-ease;

  &:hover { color: $white; }
  &.-active {
    color: $white;
    font-weight: 700;

    &::after {
      content: '';
      position: absolute;
      left: calc(100% + 30px);
      top: calc(50% - 6px);
      z-index: 3;
      height: 0;
      width: 0;
      border-color: transparent transparent transparent rgba(0, 0, 0, 0.4);
      border-style: solid;
      border-width: 6px 0 6px 6px;
    }
  }
}

.c-modal-onboarding__footer {
  display: flex;
  width: 100%;
  padding: 10px;
  padding-top: 15px;
  margin-top: auto;
  border-top: 1px solid $grey-1;
  align-items: center;
  justify-content: center;
  font-size: 10px;

  span {
    margin-right: 10px;
    opacity: 0.3;
  }
}
</style>
