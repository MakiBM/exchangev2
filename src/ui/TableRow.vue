<template>
  <tr class="c-table-row">
    <slot />
  </tr>
</template>

<script>
export default {
  name: 'TableRow',
}
</script>

<style lang="scss">
.c-table-row {
  &:nth-child(odd) { background: $grey-2; }
  &:nth-child(even) { background: $grey-3; }
  &:hover { background: $grey-4; }
}
</style>
