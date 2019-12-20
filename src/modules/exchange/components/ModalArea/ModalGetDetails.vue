<template>
  <div class="c-modal-get-details">

    <template v-if="isStatus([undefined, 'beforeSign'])">
      <div class="c-modal-get-details__symbols-row">
        <img
          class="c-modal-get-details__symbol"
          :src="require(`@/assets/token-symbols/${leftIcon}.svg`)">
        <div>
          <slot name="separator" />
          <div class="c-modal-get-details__symbol-separator">
            <slot name="separatorLabel" />
          </div>
        </div>
        <img
          class="c-modal-get-details__symbol"
          :src="require(`@/assets/token-symbols/${rightIcon}.svg`)">
      </div>
      <div class="c-modal-get-details__symbols-row">
        <div class="c-modal-get-details__symbol">
          <small>{{ leftName }} Balance</small>
          <div class="c-modal-get-details__symbol-price">
            <strong
              v-if="leftToken"
              :class="{'-active': activeSide === 'left'}"
              class="__truncate">
              {{ leftToken.balance | toHumanUnit(leftToken.token.decimals) | toFixed(8) | trimZeros }}
            </strong>
            <TextPlaceholder v-else />
            <span> {{ leftSymbol }} </span>
          </div>
        </div>
        <div class="c-modal-get-details__symbol">
          <small>{{ rightName }} Balance</small>
          <div class="c-modal-get-details__symbol-price">
            <strong
              v-if="rightToken"
              :class="{'-active': activeSide === 'right'}"
              class="__truncate">
              {{ rightToken.balance | toHumanUnit(rightToken.token.decimals) | toFixed(8) | trimZeros }}
            </strong>
            <TextPlaceholder v-else />
            <span> {{ rightSymbol }} </span>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="isStatus(['pending'])">
      <div
        :class="{'-has-subtitle': showPendingValue}"
        class="c-modal-get-details__title">
        <strong>{{ pendingHeadline }}</strong>
        <div v-if="showPendingValue">
          <strong>{{ totalAmount | toFixed(8) | trimZeros }}</strong> {{ activeSide === 'left' ? leftSymbol : rightSymbol }}
        </div>
      </div>
      <div class="c-modal-get-details__symbols-row">
        <img
          class="c-modal-get-details__symbol"
          :src="require(`@/assets/token-symbols/${leftIcon}.svg`)">
          <div class="c-modal-get-detail__processing-bar">
            <ProcessingBar
              :class="{'-invert': activeSide === 'right'}"
              :length="10" />
            <div
              v-if="$slots.separatorLabel"
              class="c-modal-get-detail__processing-bar-separator">
              <slot name="separatorLabel" />
            </div>
          </div>
        <img
          class="c-modal-get-details__symbol"
          :src="require(`@/assets/token-symbols/${rightIcon}.svg`)">
      </div>
      <div class="c-modal-get-details__symbols-row">
        <div class="c-modal-get-details__symbol">
          <small>{{ activeSide === 'left' ? 'Sending' : 'Receiving' }}</small>
          <div
            :class="{'-active': activeSide === 'left' }"
            class="c-modal-get-details__symbol-price">
            <strong>{{ totalAmount | toFixed(8) | trimZeros }}</strong>
            <span> {{ leftSymbol }} </span>
          </div>
        </div>
        <div class="c-modal-get-details__symbol">
          <small>{{ activeSide === 'left' ? 'Receiving' : 'Sending' }}</small>
          <div
            :class="{'-active': activeSide === 'right' }"
            class="c-modal-get-details__symbol-price">
            <strong>{{ amount }}</strong>
            <span> {{ rightSymbol }} </span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="isStatus(['failure', 'success'])">
      <strong
        v-if="isStatus(['failure'])"
        class="c-modal-get-details__title -red">
        <img src="@/assets/icons/failure.svg" svg-inline svg-sprite>
        Failed
      </strong>
      <strong
        v-else-if="isStatus(['success'])"
        class="c-modal-get-details__title -green">
        <img src="@/assets/icons/checkmark-circle.svg" svg-inline svg-sprite>
        Successful
      </strong>
      <div class="c-modal-get-details__symbols-row -center">
        <img
          class="c-modal-get-details__symbol"
          :src="require(`@/assets/token-symbols/${activeSide === 'left' ? rightIcon : leftIcon}.svg`)">
      </div>
      <div class="c-modal-get-details__symbols-row -center">
        <div class="c-modal-get-details__symbol">
          <small>{{ activeSide === 'left' ? rightName : leftName }} Balance</small>
          <div class="c-modal-get-details__symbol-price -active">
            <strong>{{ amount }}</strong>
            <span> {{ activeSide === 'left' ? rightSymbol : leftSymbol }} </span>
            <img
              class="c-modal-get-details__arrow"
              src="@/assets/icons/arrow.svg"
              svg-inline
              svg-sprite>
            <strong>{{ totalAmountFiat }}</strong>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import includes from 'lodash/fp/includes'
import ProcessingBar from '@/modules/exchange/ui/ProcessingBar'
import TextPlaceholder from '@/ui/TextPlaceholder'

export default {
  name: 'ModalGetDetails',

  components: {
    ProcessingBar,
    TextPlaceholder,
  },

  props: {
    pendingHeadline: String,
    showPendingValue: Boolean,
    activeSide: String,
    leftSymbol: String,
    rightSymbol: String,
    leftIcon: String,
    rightIcon: String,
    leftName: String,
    rightName: String,
    leftToken: Object,
    rightToken: Object,
    amount: String,
    totalAmount: String,
    totalAmountFiat: String,
    status: String,
  },

  methods: {
    isStatus (statuses) {
      return includes(this.status, statuses)
    },
  },
}
</script>

<style lang="scss">
.c-modal-get-details {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;
  width: 100%;
}

.c-modal-get-details__title {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 30px;
  text-transform: uppercase;
  color: $white;

  &.-has-subtitle { margin-bottom: 0; }
  &.-red { color: $red; }
  &.-green { color: $green; }

  svg { margin-right: 5px; }
  div {
    width: 100%;
    text-align: center;
    color: rgba($white, 0.5);
  }
  div strong { color: $white; }
}

.c-modal-get-details__symbols-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  &:not(:first-of-type) {
    margin-top: 15px;
  }

  &.-center { justify-content: center; }
}

.c-modal-get-details__symbol {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 58px;
  height: auto;
  min-height: 58px;

  small, span, strong {
    white-space: nowrap;
  }
}

.c-modal-get-details__symbol-separator {
  margin-top: 13px;
}

.c-modal-get-details__symbol-price {
  display: flex;
  align-items: center;

  &.-active { color: $white; }
  strong { max-width: 110px; }
  span {
    flex-shrink: 0;
    margin-left: 3px;
  }
}

.c-modal-get-details__arrow {
  height: 12px;
  margin: 0 10px;
}

.c-modal-get-detail__processing-bar {
  width: 100%;
}

.c-modal-get-detail__processing-bar-separator {
  margin-top: -5px;
  margin-bottom: -15px;
  display: block;
  text-align: center;
}
</style>
