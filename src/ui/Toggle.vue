<template>
  <div
    class="c-toggle"
    :class="[
      {'-checked': isLoading ? !checked : checked},
      {'-loading': isLoading},
      {'-singular': isSingular},
      {'-allowances': isAllowances},
    ]">
    <strong
      v-if="leftLabel"
      class="c-toggle__label -left"
      :class="{'-active': !checked}">
      {{ leftLabel }}
    </strong>
    <div class="c-toggle__wrap">
      <div class="c-toggle__bar"></div>
      <div class="c-toggle__button">
        <img
          v-if="isAllowances && checked && !isLoading"
          class="c-toggle__checkmark"
          src="@/assets/icons/checkmark.svg"
          svg-inline
          svg-sprite>
      </div>
    </div>
    <strong
      v-if="rightLabel"
      class="c-toggle__label -right"
      :class="{'-active': checked}">
      {{ rightLabel }}
    </strong>
  </div>
</template>

<script>
export default {
  name: 'Toggle',
  props: {
    leftLabel: String,
    rightLabel: String,
    checked: Boolean,
    isLoading: Boolean,
    isAllowances: Boolean,
  },
  computed: {
    isSingular () {
      return [this.leftLabel, this.rightLabel].filter(Boolean).length === 1
    },
  },
}
</script>

<style lang="scss">
.c-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.c-toggle__label {
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.2;
  transition: opacity $quick-ease;

  &.-left { margin-right: 7px; }
  &.-right { margin-left: 7px; }
  &.-active { opacity: 1; }

  .-singular & {
    opacity: 1;
    &.-left { margin-right: 10px; }
    &.-right { margin-left: 10px; }
  }
}

.c-toggle__wrap {
  position: relative;
  width: 36px;
  height: 14px;
  margin: 4px 1px;

  .-small & { height: 12px; }
}

.c-toggle__bar {
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  transition: background-color linear .08s;
  background-color: $grey-2;

  .-dark & { background-color: $grey-4; }
}

.c-toggle__button {
  position: absolute;
  top: -3px;
  left: 0;
  right: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.6);
  transition: transform linear .08s, background-color linear .08s;
  will-change: transform;
  background-color: $blue;

  .-checked & { transform: translateX(16px); }
  .-checked.-allowances & { background-color: $green; }
  .-loading & { background: lighten($grey-1, 20%) !important; }
  .-grey & { background: lighten($grey-1, 20%); }
  .-small & { height: 18px; width: 18px; }
}

.c-toggle__checkmark {
  height: 10px;
  width: 10px;
}

.c-toggle__spinner {
  position: absolute;
  width: 30px;
  height: 30px;
}
</style>
