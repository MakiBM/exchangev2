<template>
  <div class="c-modal">
    <a
      class="c-modal__close"
      @click="$emit('closeClick')">
      <img
        src="@/assets/icons/close.svg"
        svg-inline
        svg-sprite>
    </a>
    <div class="c-modal__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
}
</script>

<style lang="scss">
.c-modal {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  min-height: 400px;
  max-width: calc(100% - 100px);
  width: 100%;
  transform: translateX(-50%) translateY(-50%);
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.45);
  background: $grey-1;

  &.-standalone { max-width: 800px; }
}

.c-modal__close {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px;
}

.c-modal__content {
  display: flex;
  width: 100%;
}
</style>
