<template>
  <div class="c-modal-inner">
    <header class="c-modal-inner__header">
      <div
        v-if="index"
        class="c-modal-inner__header-index">
        {{ index }}
      </div>
      <strong
        v-if="title"
        class="c-modal-inner__header-title">
        {{ title }}
      </strong>
      <div
        v-if="desc"
        class="c-modal-inner__header-desc">
        {{ desc }}
      </div>
    </header>
    <div class="c-modal-inner__content">
      <div class="c-modal-inner__left">
        <slot name="left" />
        <div
          :class="{'-hidden': !leftNav}"
          class="c-modal-inner__link -prev">
          <a @click="() => leftNav && leftNav.onclick()" class="__link">
            <img
              src="@/assets/icons/arrow.svg"
              svg-inline
              svg-sprite>
            <span v-html="leftNav.text" />
          </a>
        </div>
      </div>

      <div
        v-if="$slots.center"
        class="c-modal-inner__center">
        <slot name="center" />
      </div>

      <div
        :class="{'-no-border': disableBorder}"
        class="c-modal-inner__right">
        <slot name="right" />
        <div
          :class="{'-hidden': !rightNav}"
          class="c-modal-inner__link -skip">
          <a
            v-html="rightNav.text"
            @click="() => rightNav && rightNav.onclick()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalInner',
  props: {
    index: String,
    title: String,
    desc: String,
    leftNav: [Object, Boolean],
    rightNav: [Object, Boolean],
    disableBorder: Boolean,
  },
}
</script>

<style lang="scss">
.c-modal-inner {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.c-modal-inner__header {
  height: 80px;
  padding: 0 25px;
  padding-top: 10px;
  display: flex;
  align-items: center;
}

.c-modal-inner__header-index {
  font-size: 36px;
  font-weight: 600;
  line-height: 1;
  margin-right: 20px;
}

.c-modal-inner__header-title {
  font-size: 14px;
  text-transform: uppercase;
}

.c-modal-inner__header-desc {
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.5;
  white-space: pre;
}

.c-modal-inner__content {
  display: flex;
  flex-grow: 1;
  &:last-of-type { margin-bottom: 20px; }
}

.c-modal-inner__left {
  display: flex;
  flex-direction: column;
  width: 50%;
}

.c-modal-inner__center {
  display: flex;
  flex-direction: column;
  width: 0;
  padding-bottom: 46px;
}

.c-modal-inner__right {
  display: flex;
  flex-direction: column;
  width: 50%;
}

.c-modal-inner__left + .c-modal-inner__right:not(.-no-border) {
  border-left: 1px solid $grey-2;
}

.c-modal-inner__link {
  display: flex;
  flex-shrink: 0;
  margin-top: auto;
  height: 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;

  &.-prev { justify-content: center; }
  &.-skip {
    justify-content: flex-end;
    margin-right: 20px;
  }

  &.-hidden {
    opacity: 0;
    pointer-events: none;
  }

  svg {
    height: 9px;
    transform: scaleX(-1) translateX(3px);
    transition: transform $quick-ease;
  }

  &:hover svg {
    transform: scaleX(-1) translateX(7px);
  }
}
</style>
