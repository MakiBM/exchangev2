<template>
  <td class="c-table-cell">
    <slot />
  </td>
</template>

<script>
export default {
  name: 'TableCell',
}
</script>

<style lang="scss">
.c-table-cell {
  height: 50px;
  padding: 0 14px;
  vertical-align: middle;
  box-shadow:
    inset 1px 0px 0px 0px rgba(0, 0, 0, 0.3), // border left
    inset 0px -1px 0px 0px rgba(0, 0, 0, 0.3); // border bottom

  &.-negative {
    border-left: 1px solid $red;
    background-color: $red-dark;
  }

  &.-positive {
    border-left: 1px solid $green;
    background-color: $green-dark;
  }
}

.c-table-cell__value-primary {
  display: block;
}

.c-table-cell__value-secondary {
  display: block;
  opacity: 0.5;
  height: 1em;
}
</style>
