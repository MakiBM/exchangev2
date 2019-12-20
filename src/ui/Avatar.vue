<template>
  <div class="c-avatar">
    <img :src="url">
  </div>
</template>

<script>
import makeBlockie from 'ethereum-blockies-base64'

export default {
  name: 'Avatar',
  props: {
    address: String,
  },
  computed: {
    url () {
      return this.address && makeBlockie(this.address)
    },
  },
}
</script>

<style lang="scss">
.c-avatar {
  height: 15px;
  width: 15px;
  transform: translateY(-1px);
  border-radius: 50%;
  overflow: hidden;

  img { display: block; }
}
</style>
