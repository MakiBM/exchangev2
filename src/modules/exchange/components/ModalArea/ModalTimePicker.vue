<template>
  <Modal
    class="c-time-picker -standalone"
    @closeClick="removeOpenedModal(TIMEPICKER)">

    <p class="c-time-picker__headline __muted">Select a Day and Time that your order will be good until.</p>

    <div class="c-time-picker__panels">
      <div class="c-time-picker__panel -left">
        <div class="c-calendar">
          <div class="c-calendar__months">
            <div class="c-calendar__months-nav">
              <img
                :class="[
                  {'-hide': isThisMonth(month)},
                  'c-calendar__months-icon -prev',
                ]"
                src="@/assets/icons/carrot.svg"
                svg-inline
                svg-sprite
                @click="addMonths(-1)">
            </div>
            <div class="c-calendar__months-name">
              {{ format(month, 'MMMM yyyy') }}
            </div>
            <div class="c-calendar__months-nav">
              <img
                class="c-calendar__months-icon -next"
                src="@/assets/icons/carrot.svg"
                svg-inline
                svg-sprite
                @click="addMonths(1)">
            </div>
          </div>
          <div class="c-calendar__day-names">
            <span
              v-for="name in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']"
              :key="`c-calendar__day-name-${name}`">
              {{ name }}
            </span>
          </div>
          <div class="c-calendar__dates">
            <span
              v-for="day in monthDates"
              :key="`c-calendar__dates-day-${day}`"
              :class="dayClass(day)"
              class="c-calendar__dates-day"
              @click="setDay(day)">
              {{ format(day, 'dd') }}
            </span>
          </div>
        </div>
      </div>

      <div class="c-time-picker__panel -right">

        <div class="c-time-inputs">
          <div class="c-time-inputs__time">
            <span
                :class="{'-active': clockMode === 'hr'}"
                @click="setClockMode('hr')">
              {{ format(newTimestamp, 'hh') }}
            </span>
            <i>:</i>
            <span
                :class="{'-active': clockMode === 'min'}"
                @click="setClockMode('min')">
              {{ format(newTimestamp, 'mm') }}
            </span>
            <span>{{ format(newTimestamp, 'a') }}</span>
          </div>
          <div class="c-time-inputs__zone">
            {{ format(newTimestamp, 'O') }}
          </div>
        </div>

        <div class="c-clock">
          <div class="c-clock__background"></div>
          <div
            :class="{'-min': clockMode === 'min'}"
            class="c-clock__highlight"
            :style="`transform: rotate(${clockPosition}deg)`" />
          <div
            v-for="(item, i) in clockItems"
            :key="`c-clock__item-${item}`"
            :style="rotateClockItem(i, clockItems.length)"
            class="c-clock__item"
            @click="handleClockItemClick(item)">
            <div :style="unrotateClockLabel(i, clockItems.length)">
              {{ item }}
            </div>
          </div>
          <div class="c-clock__foreground">
            <div>
              <span
                :class="{'-active': isAM}"
                @click="addHours(-12)">
                AM
              </span>
              <span
                :class="{'-active': !isAM}"
                @click="addHours(12)">
                PM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Button
      class="c-time-picker__button -blue -medium"
      @click.native="confirm">
      Confirm
    </Button>
  </Modal>
</template>

<script>
import { mapActions } from 'vuex'
import { format, addMonths, isThisMonth, startOfMonth, endOfMonth, eachDayOfInterval,
  endOfWeek, startOfWeek, isToday, startOfToday, differenceInCalendarDays,
  setHours, setMinutes, setDate, getDate, addDays } from 'date-fns'
import { TIMEPICKER } from './constants'
import Modal from './Modal'
import Button from '@/ui/Button'

export default {
  name: 'ModalTimePicker',
  components: {
    Modal,
    Button,
  },
  props: {
    id: String,
    data: Object,
  },
  data () {
    return {
      TIMEPICKER,
      isThisMonth,
      format,
      month: undefined,
      newTimestamp: undefined,
      clockMode: 'hr',
    }
  },
  created () {
    const timestamp = this.data.timestamp || addDays(Date.now(), 1)
    this.month = timestamp
    this.newTimestamp = timestamp
  },
  computed: {
    monthDates () {
      const startMonth = startOfMonth(this.month)
      const endMonth = endOfMonth(this.month)
      return eachDayOfInterval({
        start: startOfWeek(startMonth, { weekStartsOn: 1 }),
        end: endOfWeek(endMonth, { weekStartsOn: 1 }),
      })
    },
    clockItems () {
      return this.clockMode === 'hr'
        ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    },
    clockPosition () {
      const base = 360 / 12
      const formatInput = this.clockMode === 'hr' ? 'H' : 'm'
      let position = parseInt(format(this.newTimestamp, formatInput))
      if (this.clockMode === 'min') position /= 5
      return position * base
    },
    isAM () {
      return format(this.newTimestamp, 'a') === 'AM'
    },
  },
  methods: {
    ...mapActions('exchange/modalArea', [
      'removeOpenedModal',
    ]),
    setDay (day) {
      const hrs = format(this.newTimestamp, 'H')
      const mins = format(this.newTimestamp, 'm')
      this.newTimestamp = day
      this.newTimestamp = setHours(this.newTimestamp, hrs)
      this.newTimestamp = setMinutes(this.newTimestamp, mins)
    },
    addMonths (amount) {
      this.month = addMonths(this.month, amount)
    },
    dayClass (day) {
      if (differenceInCalendarDays(day, this.newTimestamp) === 0) return '-selected'
      else if (isToday(day)) return '-today'
      else if (day < startOfMonth(this.month)) return '-hidden'
      else if (day < startOfToday() || day > endOfMonth(this.month)) return '-muted'
    },
    rotateClockItem (i, length) {
      return `transform: translateX(-50%) rotate(${360 / length * i}deg)`
    },
    unrotateClockLabel (i, length) {
      return `transform: rotate(${360 / length * i * -1}deg)`
    },
    setClockMode (mode) {
      this.clockMode = mode
    },
    handleClockItemClick (number) {
      number = parseInt(number)
      if (this.clockMode === 'hr') {
        if (!this.isAM) number += 12
        this.setHours(number)
      } else {
        this.newTimestamp = setMinutes(this.newTimestamp, number)
      }
    },
    setHours (number) {
      const days = getDate(this.newTimestamp)
      this.newTimestamp = setHours(this.newTimestamp, number)
      this.newTimestamp = setDate(this.newTimestamp, days)
    },
    addHours (number) {
      const hours = parseInt(format(this.newTimestamp, 'H')) + number
      this.setHours(hours)
    },
    confirm () {
      this.data.onConfirm(this.newTimestamp.getTime())
      this.removeOpenedModal(TIMEPICKER)
    },
  },
}
</script>

<style lang="scss">
.c-time-picker {
  .c-modal__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 30px;
  }
}

.c-time-picker__panels {
  flex-grow: 1;
  display: flex;
  margin-top: 30px;
  margin-bottom: 20px;
  width: 100%;
}

.c-time-picker__panel {
  display: flex;
  align-items: center;
  flex-direction: column;
  flex-basis: 50%;

  &.-left { border-right: 1px solid #232527; }
}

.c-time-picker__button {
  width: 250px !important;
}

.c-calendar {
  max-width: 250px;
  min-height: 255px;
  width: 100%;
}

.c-calendar__months {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.c-calendar__months-nav {
  width: calc(100% / 7);
  text-align: center;
}

.c-calendar__months-icon {
  width: 10px;
  height: 6px;
  opacity: 0.5;
  cursor: pointer;

  &.-prev { transform: rotate(90deg); }
  &.-next { transform: rotate(-90deg); }
  &.-hide { opacity: 0; pointer-events: none; }
}

.c-calendar__months-name {
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 14px;
}

.c-calendar__day-names {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  margin-top: 15px;
  color: rgba($white, 0.5);
  font-size: 14px;
  font-weight: 700;

  span {
    width: calc(100% / 7);
    text-align: center;
  }
}

.c-calendar__dates {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
}

.c-calendar__dates-day {
  font-size: 14px;
  width: calc(100% / 7 - 8px);
  margin: 2px 4px;
  text-align: center;
  border-bottom: 1px solid transparent;
  cursor: pointer;

  &.-today { border-bottom-color: $white; }
  &.-hidden {
    opacity: 0;
    pointer-events: none;
  }
  &.-muted {
    opacity: 0.3;
    pointer-events: none;
  }
  &.-selected {
    border-bottom-color: $blue;
    color: $blue;
    background-color: rgba(0, 170, 234, 0.2);
    font-weight: 900;
    pointer-events: none;
  }
}

.c-clock {
  position: relative;
  width: 170px;
  height: 170px;
}

.c-clock__background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #2b2d30;
}

.c-clock__highlight {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(0, 170, 234, 0.2);
  box-shadow: inset 0 0 0 1px $blue;
  transition: transform $quick-ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 1px);
    height: calc(100% + 1px);
    border-radius: 50%;
    transition: background $quick-ease;
  }

  @mixin gradient($deg) {
    background: linear-gradient(
      #{$deg},
      #2b2d30 50%, #2b2d30 50%,
      transparent 50%, transparent 100%
    );
  }

  &::before { @include gradient(80deg); }
  &::after { @include gradient(-80deg); }
  &.-min {
    &::before { @include gradient(85deg); }
    &::after { @include gradient(-85deg); }
  }
}

.c-clock__item {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  color: rgba($white, 0.5);
  line-height: 1;
  pointer-events: none;

  div {
    cursor: pointer;
    pointer-events: all;
    padding: 10px 5px;
  }
}

.c-clock__foreground {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 65px);
  height: calc(100% - 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #323538;
  box-shadow: 0 0 20px rgba($black, 0.3);
  font-size: 14px;
  letter-spacing: 1px;
  color: rgba($white, 0.5);

  span {
    cursor: pointer;
    display: inline-block;
    padding: 0 4px;

    &.-active {
      color: $blue;
      font-weight: 700;
    }
  }
}

.c-time-inputs {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  letter-spacing: 1px;
  line-height: 1;
}

.c-time-inputs__time {
  padding: 8px 20px;
  background-color: rgba($white, 0.1);
  color: rgba($white, 0.5);

  span {
    display: inline-block;
    padding: 0 2px;

    &:not(:last-child) { cursor: pointer; }

    &.-active {
      color: $white;
      font-weight: 700;
    }
  }
}

.c-time-inputs__zone {
  padding: 8px 15px;
  background-color: #232527;
}
</style>
