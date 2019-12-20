<template>
  <TableRow>
    <!-- Date cell -->
    <TableCellTime :time="orderObj.time" />
    <!-- Type cell -->
    <TableCell :class="isSellType ? '-negative' : '-positive'">
      <strong>{{ isSellType ? 'Sell' : 'Buy' }}</strong>
    </TableCell>
    <!-- Price cell -->
    <TableCell>
      <strong class="c-table-cell__value-primary">{{ price | toFixed(8) }}</strong>
      <span class="c-table-cell__value-secondary">
        {{preferredCurrencySign}}{{price.multipliedBy(masterFiatPrice) | formatFiat }}
      </span>
    </TableCell>
    <!-- Amount cell -->
    <TableCell>
      <strong class="c-table-cell__value-primary">{{ amount | toFixed(8) }}</strong>
      <span class="c-table-cell__value-secondary"></span>
    </TableCell>
    <!-- Total cell -->
    <TableCell>
      <strong class="c-table-cell__value-primary">{{ price.multipliedBy(amount) | toFixed(8) }}</strong>
      <span class="c-table-cell__value-secondary">
        {{preferredCurrencySign}}{{ price.multipliedBy(amount).multipliedBy(masterFiatPrice) | formatFiat }}
      </span>
    </TableCell>
  </TableRow>
</template>

<script>
import { BigNumber } from '0x.js'
import { mapState, mapGetters } from 'vuex'
import TableRow from '@/ui/TableRow'
import TableCell from '@/ui/TableCell'
import TableCellTime from '@/ui/TableCellTime'

export default {
  name: 'MarketTradesTableRow',
  components: {
    TableRow,
    TableCell,
    TableCellTime,
  },
  props: {
    order: { type: String, required: true },
  },
  computed: {
    ...mapGetters([
      'preferredCurrencySign',
    ]),
    ...mapState(['preferredCurrencySymbol']),
    ...mapState('exchange', [
      'masterPairedSymbol',
      'assetsBySymbol',
      'assetsByAddress',
    ]),
    ...mapGetters('exchange', [
      'masterFiatPrice',
      'assetsCryptoCompareInfoSelector',
    ]),
    ...mapState('exchange/marketTrades', [
      'ordersByHash',
    ]),
    orderObj () {
      return this.ordersByHash[this.order]
    },
    isSellType () {
      return this.assetsBySymbol[this.masterPairedSymbol].contract_address === this.orderObj.taker_asset_address
    },
    takerTokenFilledAmount () {
      return new BigNumber(this.orderObj.taker_asset_filled_amount)
        .div(`1e${this.assetsByAddress[this.orderObj.taker_asset_address].decimals}`)
    },
    makerTokenFilledAmount () {
      return new BigNumber(this.orderObj.maker_asset_filled_amount)
        .div(`1e${this.assetsByAddress[this.orderObj.maker_asset_address].decimals}`)
    },
    price () {
      return this.isSellType
        ? this.takerTokenFilledAmount.div(this.makerTokenFilledAmount)
        : this.makerTokenFilledAmount.div(this.takerTokenFilledAmount)
    },
    amount () {
      return this.isSellType
        ? this.makerTokenFilledAmount
        : this.takerTokenFilledAmount
    }
  },
}
</script>
