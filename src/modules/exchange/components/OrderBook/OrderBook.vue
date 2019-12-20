<template>
  <div class="c-order-book">
    <SectionTitle>
      Orders
    </SectionTitle>

    <div class="c-order-book__grid">
      <div class="c-order-book__col">
        <div class="c-order-book__header -red">
          <div class="c-order-book__label">Sell Orders</div>
          <p
            class="c-order-book__total">
            Total:
            <strong v-if="sellOrdersVolume && assetsBySymbol[quotePairedSymbol] && assetsBySymbol[quotePairedSymbol].decimals">
              {{ sellOrdersVolume | toHumanUnit(assetsBySymbol[quotePairedSymbol].decimals) | toFixed(8) }}
            </strong>
            <TextPlaceholder v-else />
            {{ quotePairedSymbol }}
          </p>
        </div>
        <Table
          class="c-order-book__table"
          :cols="[
            {label: '', width: '60px'},
            {label: 'Price'},
            {label: `${quotePairedSymbol}`},
            {label: `${masterPairedSymbol}`},
            {label: `Sum (${masterPairedSymbol})`},
          ]"
          :visibleRows="8"
          :isLoading="isLoading"
          :nextPage="nextPage"
          emptyText="No bids to show"
          @loadMore="handleLoadMore">

          <OrderBookTableRow
            v-for="(bid, i) in sellOrdersPaged"
            :key="`c-order-book-row--${bid}`"
            :record="sellOrdersByHash[bid]"
            :sum="sellOrdersSums[i]"
            :lastSum="sellOrdersSums[sellOrdersSums.length - 1]"
            :isSelected="sellOrdersSelected.includes(bid)"
            typeClass="-negative"
            @click.native="handleSellOrdersClickDelegation" />

        </Table>
      </div>

      <div class="c-order-book__col">
        <div class="c-order-book__header -green">
          <div class="c-order-book__label">Buy Orders</div>
          <p class="c-order-book__total">
            Total:
            <strong v-if="buyOrdersVolume && assetsBySymbol[masterPairedSymbol] && assetsBySymbol[masterPairedSymbol].decimals">
              {{ buyOrdersVolume | toHumanUnit(assetsBySymbol[masterPairedSymbol].decimals) | toFixed(8) }}
            </strong>
            <TextPlaceholder v-else />
            {{ masterPairedSymbol }}
          </p>
        </div>
        <Table
          class="c-order-book__table"
          :cols="[
            {label: '', width: '60px'},
            {label: 'Price'},
            {label: `${quotePairedSymbol}`},
            {label: `${masterPairedSymbol}`},
            {label: `Sum (${masterPairedSymbol})`},
          ]"
          :visibleRows="8"
          :isLoading="isLoading"
          :nextPage="nextPage"
          emptyText="No asks to show"
          @loadMore="handleLoadMore">

          <OrderBookTableRow
            v-for="(order, i) in buyOrdersPaged"
            :key="`c-order-book-row--${order}`"
            :record="buyOrdersByHash[order]"
            :sum="buyOrdersSums[i]"
            :lastSum="buyOrdersSums[buyOrdersSums.length - 1]"
            :isSelected="buyOrdersSelected.includes(order)"
            typeClass="-positive"
            @click.native="handleBuyOrdersClickDelegation" />

        </Table>
      </div>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import without from 'lodash/without'
import SectionTitle from '@/ui/SectionTitle'
import Table from '@/ui/Table'
import TextPlaceholder from '@/ui/TextPlaceholder'
import OrderBookTableRow from './OrderBookTableRow'
import { eventDelegationTarget } from '@/utils'

export default {
  name: 'OrderBook',
  components: {
    SectionTitle,
    Table,
    OrderBookTableRow,
    TextPlaceholder,
  },
  data () {
    return {
      sellOrdersSelectMode: undefined,
      buyOrdersSelectMode: undefined,
    }
  },
  computed: {
    ...mapState('exchange', [
      'assetsBySymbol',
      'masterPairedSymbol',
      'quotePairedSymbol',
    ]),
    ...mapState('exchange/orderBook', [
      'buyOrdersByHash',
      'buyOrdersSelected',
      'buyOrdersVolume',
      'buyOrdersSums',
      'sellOrdersByHash',
      'sellOrdersSelected',
      'sellOrdersVolume',
      'sellOrdersSums',
      'isLoading',
      'nextPage',
    ]),
    ...mapGetters('exchange/orderBook', [
      'buyOrdersPaged',
      'sellOrdersPaged',
    ]),
  },
  methods: {
    ...mapActions('exchange/orderBook', [
      'setBuyOrdersSelected',
      'setSellOrdersSelected',
      'getNextPage',
    ]),
    handleSellOrdersClickDelegation (event) {
      this.handleClickDelegation({
        recordsSelected: this.sellOrdersSelected,
        recordsSorted: this.sellOrdersPaged,
        setRecordsSelected: this.setSellOrdersSelected,
        selectMode: this.sellOrdersSelectMode,
        event,
      })
    },
    handleBuyOrdersClickDelegation (event) {
      this.handleClickDelegation({
        recordsSelected: this.buyOrdersSelected,
        recordsSorted: this.buyOrdersPaged,
        setRecordsSelected: this.setBuyOrdersSelected,
        selectMode: this.buyOrdersSelectMode,
        event,
      })
    },
    handleClickDelegation ({ event, recordsSelected, recordsSorted, setRecordsSelected, selectMode }) {
      const plusEl = eventDelegationTarget('[data-plus]', event)
      const sumEl = eventDelegationTarget('[data-sum]', event)

      if (plusEl) {
        const hash = plusEl.getAttribute('data-plus')
        if (this.selectMode !== 'plus') {
          setRecordsSelected([hash])
        } else {
          const newRecords = recordsSelected.includes(hash)
            ? without(recordsSelected, hash)
            : [...recordsSelected, hash]
          setRecordsSelected(newRecords)
        }
        this.selectMode = 'plus'
      } else if (sumEl) {
        if (this.selectMode !== 'sum') setRecordsSelected([])
        const hash = sumEl.getAttribute('data-sum')
        const newRecords = recordsSelected.slice(-1)[0] === hash
          ? []
          : recordsSorted.slice(0, recordsSorted.indexOf(hash) + 1)
        setRecordsSelected(newRecords)
        this.selectMode = 'sum'
      }
    },
    handleLoadMore () {
      this.getNextPage()
    },
  },
}
</script>

<style lang="scss">
.c-order-book {
  .c-table__scrollable-inner {
    height: 400px; // visibleRows * 50
  }
}

.c-order-book__grid {
  display: flex;
  justify-content: space-between;
}

.c-order-book__col {
  width: calc(50% - 10px);
}

.c-order-book__header {
  display: flex;
  align-items: center;
  line-height: 50px;
  padding: 0 15px;
  background-color: #232527;
  border-left: 3px solid transparent;

  &.-red { border-color: $red; }
  &.-green { border-color: $green; }
}

.c-order-book__label {
  width: 160px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.c-order-book__total {
  flex-grow: 1;
  font-size: 12px;
  border-left: 1px solid rgba(0, 0, 0, 0.3);
  text-align: right;
}

.c-order-book__table {
  min-width: 0;
  background: $grey-3;
}
</style>
