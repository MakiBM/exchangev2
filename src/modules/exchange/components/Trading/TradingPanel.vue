<template>
  <div class="c-trading-panel">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Tradinganel',
}
</script>

<style lang="scss">
.c-trading-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $grey-2;

  .__row-spaced { width: 100%; }
}

.c-trading-panel__title {
  text-transform: uppercase;
  font-weight: 900;
  padding: 10px;
  border-left: 3px solid;

  .-positive & {
    border-color: $green;
    i { color: $green; }
  }
  .-negative & {
    border-color: $red;
    i { color: $red; }
  }
}

.c-trading-panel__section {
  padding: 10px;
  font-size: 12px;
  line-height: 2;
  border-top: 1px solid $black;

  &.-padding { padding: 25px 10px; }
  &.-border { border-left: 3px solid; }
  &.-light { background: $grey-1; }
  &.-light-2-rows { height: 70px; }
  &.-center { text-align: center; }
  &.-grow {
    flex-grow: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .-positive & { border-left-color: $green; }
  .-negative & { border-left-color: $red; }
  &.-blue { border-left-color: $blue; }
}

.c-trading-panel__button-wrap {
  border-top: 1px solid $black;
}

.c-trading-panel__balance {
  div { flex-basis: 50%; }
  div:last-of-type { text-align: right; }
}

.c-trading-panel__value-wrap {
  display: flex;
  align-items: center;
  width: 265px;
  height: 25px;
  margin: 7px 0;

  &.-balance {
    margin: 0;
    font-size: 10px;
    color: $red;
    svg { margin-right: 5px; }
  }
}

.c-trading-panel__slider {
  height: 25px;
}

.c-trading-panel__date {
  display: flex;
  align-items: center;
  span { text-decoration: underline; }
}

.c-trading-panel__date-icon {
  margin-right: 5px;
}

.c-trading-panel__fee {
  display: flex;
  align-items: center;
}

.c-trading-panel__fee-need {
  color: $red;
  font-size: 10px;
  font-weight: 700;
  margin: 0 7px;
}
</style>
