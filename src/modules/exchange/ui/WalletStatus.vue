<template>
  <div class="c-wallet-status">
    <img
      class="c-wallet-status__img"
      :src="img">
    <img
      :class="['c-wallet-status__top-arrow', {'-white': isArrowWhite}]"
      src="@/assets/icons/arrow.svg"
      svg-inline
      svg-sprite>
    <strong v-if="title">{{ title }}</strong>
    <p>{{ desc }}</p>
    <strong v-if="subtitle">
      {{ subtitle }}
    </strong>
  </div>
</template>

<script>
export default {
  name: 'WalletStatus',
  props: {
    title: String,
    subtitle: String,
    desc: String,
    img: String,
    isArrowWhite: Boolean,
  },
}
</script>

<style lang="scss">
.c-wallet-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  line-height: 1.2;
  color: rgba($white, 0.5);
  text-align: center;

  strong:first-child { margin-bottom: 10px; }
  strong:last-child { margin-top: 10px; color: $white; }
  p { max-width: 220px; }
  img { height: 164px; }

}

.c-wallet-status__top-arrow {
  color: $blue;
  transform: rotate(-90deg);
  margin-top: 10px;
  margin-bottom: 15px;
  height: 15px;
  width: auto;

  &.-white { color: $white; }
}
</style>
