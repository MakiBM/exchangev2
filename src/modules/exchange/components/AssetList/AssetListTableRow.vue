<template>
  <TableRow>
    <!-- Fav. cell -->
    <TableCell
      :data-fav="quoteAsset"
      :class="{'-active': favsByMaster[masterSelected] && favsByMaster[masterSelected].includes(quoteAsset)}"
      class="c-cell-fav">
      <a class="c-cell-fav__link">
        <img
          class="c-cell-fav__icon"
          src="@/assets/icons/star.svg"
          svg-inline
          svg-sprite>
      </a>
    </TableCell>
    <!-- Name cell -->
    <TableCell class="c-cell-name">
      <div class="c-cell-name__row">
        <img
          class="c-cell-name__icon"
          :src="require(`@/assets/token-symbols/${quoteAsset.toLowerCase()}.svg`)">
        <strong v-if="assetsBySymbol[quoteAsset]">{{ assetsBySymbol[quoteAsset].name }}</strong>
        <TextPlaceholder v-else />
      </div>
    </TableCell>
    <!-- Symbol cell -->
    <TableCell>
      <strong>{{ quoteAsset }}</strong>
    </TableCell>
    <!-- Price cell -->
    <TableCell class="c-cell-price">
      <div class="c-cell-price__left">
        <strong v-if="cryptoCompareInfoMaster">
          {{ cryptoCompareInfoMaster.PRICE | toFixed(8) }}
        </strong>
        <TextPlaceholder v-else />
        {{ masterSelected }}
      </div>
      <img
        class="c-cell-price__icon"
        src="@/assets/icons/arrow.svg"
        svg-inline
        svg-sprite>
      <div class="c-cell-price__right">
        <template v-if="cryptoCompareInfoFiat">
          {{ preferredCurrencySign }}{{ cryptoCompareInfoFiat.PRICE | formatFiat }}
        </template>
        <TextPlaceholder v-else />
      </div>
    </TableCell>
    <!-- Volume cell -->
    <TableCell>
      <strong v-if="cryptoCompareInfoMaster">
        {{ cryptoCompareInfoMaster.VOLUMEDAYTO | toFixed(8) }}
      </strong>
      <TextPlaceholder v-else />
      {{ masterSelected }}
    </TableCell>
    <!-- Change cell -->
    <TableCell
      :class="{
        '-positive': cryptoCompareInfoMaster && cryptoCompareInfoMaster.CHANGEPCT24HOUR > 0,
        '-negative': cryptoCompareInfoMaster && cryptoCompareInfoMaster.CHANGEPCT24HOUR < 0,
      }"
      class="c-cell-change">
      <strong v-if="cryptoCompareInfoMaster">
        {{ cryptoCompareInfoMaster.CHANGEPCT24HOUR | toFixed(2) }}%
      </strong>
      <TextPlaceholder v-else />
      <img
        class="c-cell-change__icon"
        src="@/assets/icons/arrow.svg"
        svg-inline
        svg-sprite>
    </TableCell>
  </TableRow>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import TableRow from '@/ui/TableRow'
import TableCell from '@/ui/TableCell'
import TextPlaceholder from '@/ui/TextPlaceholder'

export default {
  name: 'AssetListTableRow',
  props: {
    quoteAsset: { type: String, required: true },
  },
  components: {
    TableRow,
    TableCell,
    TextPlaceholder,
  },
  computed: {
    ...mapGetters(['preferredCurrencySign']),
    ...mapState(['preferredCurrencySymbol']),
    ...mapState('exchange', [
      'assetsBySymbol',
    ]),
    ...mapGetters('exchange', [
      'assetsCryptoCompareInfoSelector',
    ]),
    ...mapState('exchange/assetList', [
      'favsByMaster',
      'masterSelected',
    ]),
    cryptoCompareInfoMaster () {
      return this.assetsCryptoCompareInfoSelector(this.quoteAsset, this.masterSelected)
    },
    cryptoCompareInfoFiat () {
      return this.assetsCryptoCompareInfoSelector(this.quoteAsset, this.preferredCurrencySymbol)
    },
  },
}
</script>

<style lang="scss">
.c-cell-fav {
  padding: 0;

  &:hover &__icon { stroke: $white; }
  &.-active path { fill: $blue; }
}

.c-cell-fav__link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.c-cell-fav__icon {
  stroke: $blue-fade;
  transition: stroke $quick-ease;

  path {
    fill: transparent;
    transition: fill $quick-ease;
  }
}

.c-cell-name__row {
  display: flex;
  align-items: center;
}

.c-cell-name__icon {
  width: 24px;
  height: 24px;
  margin-right: 15px;
}

.c-cell-price {
  display: flex;
  align-items: center;
}

.c-cell-price__left {
  width: 50%;
}

.c-cell-price__icon {
  opacity: 0.3;
}

.c-cell-price__right {
  width: calc(50% - 15px);
  padding-left: 30px;
}

.c-cell-change {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &.-negative {
    color: $red;
  }

  &.-positive {
    color: $green;
  }
}

.c-cell-change__icon {
  margin-left: 10px;
  margin-right: 5px;
  transform-origin: center;
  opacity: 0;

  .-positive & { transform: rotate(-90deg); opacity: 1; }
  .-negative & { transform: rotate(90deg); opacity: 1; }
}
</style>
