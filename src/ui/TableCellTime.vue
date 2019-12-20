<template>
  <TableCell>
    <strong>{{ formattedTime }}</strong>
  </TableCell>
</template>

<script>
import TableCell from '@/ui/TableCell'

export default {
  name: 'TableCellTime',
  components: {
    TableCell,
  },
  props: {
    time: { type: Number, required: true },
  },
  computed: {
    formattedTime () {
      return new Date(this.time * 1000)
        .toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' ' + this.timezone
    },
    timezone () {
      const gmtZeroDistance = new Date().getTimezoneOffset() / 60
      const gmtOffset = (gmtZeroDistance > 0 ? '-' : '+') + Math.abs(gmtZeroDistance)
      return `GMT${gmtOffset}`
    },
  }
}
</script>
