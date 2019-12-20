<template>
  <div class="c-input">
    <span
      v-if="prepend"
      class="c-input__prepend">
      {{ prepend }}
    </span>
    <input
      type="number"
      :placeholder="placeholder"
      :value="value"
      :disabled="disabled"
      step="0.01"
      class="c-input__control"
      @mousewheel="preventMouseWheel"
      @input="e => $emit('input', e.target.value)">
    <slot v-if="$slots.default" />
    <span
      v-else-if="token"
      :data-info="info"
      class="c-input__token">
      {{ token }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    prepend: { type: [String, Boolean] },
    placeholder: { type: String },
    value: { type: String },
    token: { type: String },
    info: { type: [String, Boolean] },
    disabled: { type: Boolean },
  },
  methods: {
    preventMouseWheel (e) {
      const el = e.currentTarget
      if (el === document.activeElement) {
        el.blur()
        setTimeout(() => el.focus(), 10)
      }
    },
  },
}
</script>

<style lang="scss">
.c-input {
  position: relative;
  display: flex;
  align-items: center;
  background-color: $grey-1;
  line-height: 25px;
  width: 100%;

  &.-active { box-shadow: 0 0 0 2px $blue; }
  &.-big { line-height: 30px; }
}

.c-input__prepend {
  padding-left: 7px;
  margin-right: -5px;
}

.c-input__control {
  padding: 0 7px;
  background: transparent;
  color: $white;
  flex-grow: 1;
  font-size: 13px;
  font-weight: 600;
  appearance: textfield;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    color: currentColor;
    font-weight: normal;
  }
}

.c-input__token {
  position: relative;
  background-color: $almost-black;
  text-align: center;
  min-width: 50px;
  padding: 0 10px;

  &:before {
    content: attr(data-info);
    position: absolute;
    top: 0;
    right: 100%;
    font-size: 10px;
    color: rgba($white, 0.4);
    white-space: nowrap;
    padding: 0 5px;
    pointer-events: none;
  }
}

</style>
