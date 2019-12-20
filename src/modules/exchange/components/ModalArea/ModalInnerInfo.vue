<template>
  <div class="c-modal-inner-info">
    <strong class="c-modal-inner-info__title">
      {{ title }}
    </strong>
    <div class="c-modal-inner-info__desc">
      <slot name="desc" />
    </div>
    <div class="c-modal-inner-info__notice">
      <strong class="c-modal-inner-info__notice-title">IMPORTANT</strong>
      <slot name="notice" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalInnerInfo',
  props: {
    title: String,
  }
}
</script>

<style lang="scss">
.c-modal-inner-info {
  padding: 0 50px;
  line-height: 1.2;
  font-size: 12px;
}

.c-modal-inner-info__title {
  margin-bottom: 13px;
  font-size: 14px;
}

.c-modal-inner-info__desc {
  p {
    color: rgba(255, 255, 255, 0.5);
    margin-top: 14px;
  }
}

.c-modal-inner-info__notice {
  margin-top: 14px;
}

.c-modal-inner-info__notice-title {
  color: $red;
  display: block;
}
</style>
