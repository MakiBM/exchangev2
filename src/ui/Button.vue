<template>
  <button class="c-button">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'Button',
}
</script>

<style lang="scss">
.c-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  width: 100%;
  border: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all $quick-ease;

  &.-transparent { background: transparent; }
  &.-muted { opacity: 0.2; }

  &.-blue {
    background: $blue;
    color: $white;
    &:hover { background: darken($blue, 5%); }
  }

  &.-grey {
    background: $grey-0;
    color: $white;
    &:hover { background: darken($grey-0, 10%); }
  }

  &.-medium {
    height: 30px;
    letter-spacing: 1.8px;
    padding: 0 10px;
    width: auto;
    font-weight: 700;
  }

  &.-small {
    height: 25px;
    letter-spacing: 0;
    padding: 0 10px;
    width: auto;
  }

  &.-full-width {
    width: 100%;
  }

  &.-disabled {
    background: $grey-2;
    color: rgba($white, 0.15);
    pointer-events: none;
  }
}

.c-button__icon {
  &.-before { transform: translateX(-3px); }
}
</style>
