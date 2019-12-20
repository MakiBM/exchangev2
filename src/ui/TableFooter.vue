<template>
  <tr>
    <TableCell
      :colspan="colspan"
      class="c-table-footer__cell">
      <slot />
    </TableCell>
  </tr>
</template>

<script>
import TableCell from '@/ui/TableCell'

export default {
  name: 'TableFooter',
  components: {
    TableCell,
  },
  props: {
    colspan: Number,
  },
}
</script>

<style lang="scss">
.c-table-footer__cell {
  width: 100%;
  background: $grey-2;
}
</style>
