<template>
  <div class="c-market-trades">
    <SectionTitle>
      Market Trade History
    </SectionTitle>
    <Table
      :cols="[
        {label: 'Date', width: '25%'},
        {label: 'Type', width: '12%'},
        {label: `Price ${masterPairedSymbol}`, width: '21%'},
        {label: `Amount ${quotePairedSymbol}`, width: '21%'},
        {label: `Total ${masterPairedSymbol}`, width: '21%'},
      ]"
      :visibleRows="7"
      :isLoading="isLoading"
      :nextPage="nextPage"
      emptyText="No transactions to show"
      @loadMore="handleLoadMore">

      <MarketTradesTableRow
        v-for="order in ordersSorted"
        :order="order"
        :key="`c-trade-list-row--${ordersByHash[order].tx_hash}`"
        class="c-trade-list-row" />

    </Table>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SectionTitle from '@/ui/SectionTitle'
import Table from '@/ui/Table'
import MarketTradesTableRow from './MarketTradesTableRow'

export default {
  name: 'MarketTrades',
  components: {
    SectionTitle,
    Table,
    MarketTradesTableRow,
  },
  computed: {
    ...mapState('exchange', [
      'masterPairedSymbol',
      'quotePairedSymbol',
    ]),
    ...mapState('exchange/marketTrades', [
      'ordersByHash',
      'ordersSorted',
      'isLoading',
      'nextPage',
    ]),
  },
  methods: {
    ...mapActions({
      getNextPage: 'exchange/marketTrades/getNextPage',
    }),
    handleLoadMore () {
      this.getNextPage()
    },
  },
}
</script>
