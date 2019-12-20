<template>
  <h2
    :style="muted && 'opacity: 0.3;'"
    class="c-section-title">
    <img
      v-if="active"
      class="c-section-title__icon"
      src="@/assets/icons/arrow.svg"
      svg-inline
      svg-sprite>
    <slot />
  </h2>
</template>

<script>
export default {
  name: 'SectionTitle',
  props: {
    active: Boolean,
    muted: Boolean,
  },
}
</script>

<style lang="scss">
.c-section-title {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 20px;
  font-weight: 700;
  font-size: 16px;
  line-height: 30px;
  text-transform: uppercase;
  white-space: nowrap;
  transition: opacity $quick-ease;
}

.c-section-title__icon {
  position: absolute;
  left: 0;
}
</style>
