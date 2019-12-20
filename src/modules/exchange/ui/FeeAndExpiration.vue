<template>
  <div class="c-trading-panel__section -light -light-2-rows">
    <div class="__row-spaced">
      <div class="__muted"> Expiration </div>
      <a
        class="c-trading-panel__date"
        @click="openTimePicker">
        <img
          class="c-trading-panel__date-icon"
          src="@/assets/icons/pen.svg"
          svg-inline
          svg-sprite>
        <span>
          <template v-if="timestamp">{{ format(timestamp, 'MMM-dd-yyyy hh:mm a O') }}</template>
          <template v-else>Set Time & Date</template>
        </span>
      </a>
    </div>
    <div class="__row-spaced">
      <div class="__muted"> Fee </div>
      <div class="c-trading-panel__fee">
        <template v-if="fee"> {{ fee | toHumanUnit(18) | toFixed(8) | trimZeros }} </template>
        <template v-else> - </template>
        ZRX
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { format } from 'date-fns'
import { BigNumber } from '0x.js'
import { TIMEPICKER } from '@/modules/exchange/components/ModalArea/constants'

export default {
  name: 'FeeAndExpiration',
  props: {
    timestamp: Date,
    fee: BigNumber,
  },
  data () {
    return {
      format,
    }
  },
  methods: {
    ...mapActions('exchange/modalArea', [
      'addOpenedModal',
    ]),
    openTimePicker () {
      this.addOpenedModal({
        id: TIMEPICKER,
        component: 'ModalTimePicker',
        data: {
          timestamp: this.timestamp,
          onConfirm: timestamp => this.$emit('setTimestamp', timestamp)
        },
      })
    },
  }
}
</script>
