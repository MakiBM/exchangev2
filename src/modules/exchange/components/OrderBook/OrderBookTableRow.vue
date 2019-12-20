<template>
  <TableRow
    v-if="parseFloat(data.masterAsset.remainingFillableAmount) && parseFloat(data.quoteAsset.remainingFillableAmount)"
    :class="[{'-selected': isSelected}, typeClass]"
    class="c-order-book-table-row">
    <!-- Plus Cell -->
    <TableCell
      class="c-cell-plus">
      <!--
        Keep the line within the cell so it doesnt break columns widths.
        Also TR doesn't respect position relative so we need to go deeper to make it available.
        A bit of a hack - it doesn't belongs to semantically, but it does the job.
      -->
      <div
        :style="`transform: scaleX(${volumeLineScale})`"
        :class="typeClass"
        class="c-order-book-table-row__line">
      </div>

      <a
        class="c-cell-plus__link"
        :data-plus="data.hash">
        <img
          src="@/assets/icons/plus.svg"
          svg-inline
          svg-sprite>
      </a>
    </TableCell>
    <!-- Price Cell -->
    <TableCell>
      <strong class="c-table-cell__value-primary __truncate">{{ data.masterPrice | toFixed(8) }}</strong>
      <span class="c-table-cell__value-secondary __truncate">
        {{ preferredCurrencySign }}{{ fiatPrice | formatFiat }}
      </span>
    </TableCell>
    <!-- Quote Fillable Amount Cell -->
    <TableCell>
      <strong class="c-table-cell__value-primary __truncate">
        {{ data.quoteAsset.remainingFillableAmount | toHumanUnit(data.quoteAsset.decimals) | toFixed(8) }}
      </strong>
      <span class="c-table-cell__value-secondary __truncate"></span>
    </TableCell>
    <!-- Master Fillable Amount Cell -->
    <TableCell>
      <strong class="c-table-cell__value-primary __truncate">
        {{ data.masterAsset.remainingFillableAmount | toHumanUnit(data.masterAsset.decimals) | toFixed(8) }}
      </strong>
      <span class="c-table-cell__value-secondary __truncate"></span>
    </TableCell>
    <!-- Sum Cell -->
    <TableCell
      :data-sum="data.hash"
      :class="typeClass"
      class="c-order-book-table-row__sum">
      <strong class="c-table-cell__value-primary __truncate">{{ sum | toHumanUnit(data.masterAsset.decimals) | toFixed(8) }}</strong>
      <span class="c-table-cell__value-secondary __truncate">
        {{ preferredCurrencySign }}{{ sum.multipliedBy(masterFiatPrice) | toHumanUnit(data.masterAsset.decimals) | formatFiat }}
      </span>
    </TableCell>
  </TableRow>
</template>

<script>
import { BigNumber } from '0x.js'
import { mapGetters, mapState } from 'vuex'
import get from 'lodash/get'
import TableRow from '@/ui/TableRow'
import TableCell from '@/ui/TableCell'
import { easeOut } from '@/utils'
import filters from '@/filters'

const { toHumanUnit } = filters

export default {
  name: 'OrderbookTableRow',
  components: {
    TableRow,
    TableCell,
  },
  props: {
    record: { type: Object, required: true },
    sum: { type: BigNumber, required: true },
    lastSum: { type: BigNumber, required: true },
    typeClass: { type: String, required: true },
    isSelected: { type: Boolean, required: true },
  },
  computed: {
    ...mapGetters(['preferredCurrencySign']),
    ...mapState(['preferredCurrencySymbol']),
    ...mapState('exchange', [
      'assetsCryptoCompareInfo'
    ]),
    data () {
      return this.record.metaData
    },
    masterFiatPrice () {
      return get(this.assetsCryptoCompareInfo, [this.data.masterAsset.ccsymbol, this.preferredCurrencySymbol, 'PRICE'])
    },
    fiatPrice () {
      return new BigNumber(this.data.masterPrice)
        .multipliedBy(this.masterFiatPrice)
    },
    volumeLineScale () {
      const { remainingFillableAmount, decimals } = this.data.masterAsset
      const recordVolume = toHumanUnit(remainingFillableAmount, decimals)
      const tableSumVolume = toHumanUnit(this.lastSum, decimals)
      let x = new BigNumber(recordVolume).div(tableSumVolume).toNumber()
      x = easeOut(x)
      x = Math.max(x, 0.005)
      x = Math.min(x, 0.9)
      return x
    },
  },
}
</script>

<style lang="scss">
.c-order-book-table-row {

  &.-selected {
    &.-negative {
      background: $red-dark;
      border-left: 1px solid $red;
    }
    &.-negative:hover { background: darken($red-dark, 5%); }

    &.-positive {
      background: $green-dark;
      border-left: 1px solid $green;
    }
    &.-positive:hover { background: darken($green-dark, 5%); }
  }

  &:hover &__sum {
    background: transparent;
  }
}

.c-order-book-table-row__line {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  height: 1px;
  width: 100vw;
  max-width: $content-width / 2;
  transform: scaleX(0);
  transform-origin: center left;
  transition: transform $quick-ease;

  &.-negative { background: $red; }
  &.-positive { background: $green; }
}

.c-order-book-table-row__sum {
  cursor: pointer;
}

.c-cell-plus {
  position: relative;
  padding: 0;
  color: rgba($white, 0.3);
  transition: color $quick-ease;

  &:hover { color: $white; }
  .-selected.-negative & { color: $red; }
  .-selected.-positive & { color: $green; }
}

.c-cell-plus__link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
