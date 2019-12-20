<template>
  <img
    class="c-modal-innder-focus-arrow"
    src="@/assets/icons/arrow.svg"
    svg-inline
    svg-sprite>
</template>

<script>
export default {
  name: 'ItemFocusArrow',
}
</script>

<style lang="scss">
.c-modal-innder-focus-arrow {
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%) translateX(-10px);
  color: $blue;
}
</style>
