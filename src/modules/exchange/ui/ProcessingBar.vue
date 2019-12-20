<template>
  <div class="c-processing-bar">
    <span
      v-for="i in length"
      :key="`processing-bar-box-${i}`"
      :style="`animation-delay: ${0.15 * i}s;`" />
  </div>
</template>

<script>
export default {
  name: 'ProcessingBar',
  props: {
    length: Number,
  }
}
</script>

<style lang="scss">
.c-processing-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px;

  &.-invert { transform: scale(-1); }

  span {
    background-color: $grey-2;
    display: inline-block;
    height: 5px;
    width: 5px;
    animation: loading 1.5s ease-in-out infinite;
  }

  @keyframes loading {
    0%   { background-color: $grey-2; }
    45%  { background-color: $grey-2; }
    70%  { background-color: $blue; }
    100% { background-color: $grey-2;}
  }
}
</style>
