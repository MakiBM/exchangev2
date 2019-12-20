<template>
  <span class="c-truncated-text">
    <span class="c-truncated-text__first-part">{{ firstPart }}</span>
    <span class="c-truncated-text__last-part">{{ lastPart }}</span>
  </span>
</template>

<script>
export default {
  name: 'TruncatedText',
  props: {
    text: { type: String, required: true },
  },
  computed: {
    firstPart () {
      return this.text.slice(0, -8)
    },
    lastPart () {
      return this.text.slice(-8)
    },
  }
}
</script>

<style lang="scss">
.c-truncated-text {
  overflow: hidden;
  white-space: nowrap;
}

// Variables to control the truncation behaviour
$startFixedChars     : 3;    // Number of chars before ellipsis - have priority over end chars
$endFixedChars       : 8;    // Number of chars after ellipsis  - lower priority than start chars
$fontFaceScaleFactor : 0.65; // Magic number dependent on font face - set by trial and error

// Dervied from the 3 variables above
$startWidth : 1em * $fontFaceScaleFactor * ($startFixedChars + 3);
$endWidth   : 1em * $fontFaceScaleFactor * $endFixedChars;

.c-truncated-text__first-part,
.c-truncated-text__last-part {
  display: inline-block;
  vertical-align: bottom;
  white-space: nowrap;
  overflow: hidden;
}
.c-truncated-text__first-part {
  max-width: calc(100% - #{$endWidth});
  min-width: $startWidth;
  text-overflow: ellipsis;
}
.c-truncated-text__last-part {
  max-width: calc(100% - #{$startWidth});
  direction: rtl;
}
</style>
