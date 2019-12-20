<template>
  <div class="c-asset-list-highlights">
    <div class="c-asset-list-highlights__block -blue">
      <div class="c-asset-list-highlights__row">
        <strong v-if="cryptoCompareInfoMaster">
          {{ cryptoCompareInfoMaster.PRICE | toFixed(8) }}
        </strong>
        <TextPlaceholder v-else />
        <strong class="c-asset-list-highlights__currency-value">
          <template v-if="cryptoCompareInfoFiat">
            {{ preferredCurrencySign }}{{ cryptoCompareInfoFiat.PRICE | formatFiat }}
          </template>
          <TextPlaceholder v-else />
        </strong>
      </div>
      <strong class="c-asset-list-highlights__label">Last {{ quotePairedSymbol }} Price</strong>
    </div>
    <div class="c-asset-list-highlights__block">
      <div class="c-asset-list-highlights__row">
        <strong v-if="cryptoCompareInfoMaster">
          {{ cryptoCompareInfoMaster.HIGH24HOUR | toFixed(8) }}
        </strong>
        <TextPlaceholder v-else />
        <span class="c-asset-list-highlights__currency-value">
          <template v-if="cryptoCompareInfoFiat">
            {{ preferredCurrencySign }}{{ cryptoCompareInfoFiat.HIGH24HOUR | formatFiat }}
          </template>
          <TextPlaceholder v-else />
        </span>
      </div>
      <small class="c-asset-list-highlights__label -small">24hr High</small>
    </div>
    <div class="c-asset-list-highlights__block">
      <div class="c-asset-list-highlights__row">
        <strong v-if="cryptoCompareInfoMaster">
          {{ cryptoCompareInfoMaster.LOW24HOUR | toFixed(8) }}
        </strong>
        <TextPlaceholder v-else />
        <span class="c-asset-list-highlights__currency-value">
          <template v-if="cryptoCompareInfoFiat">
            {{ preferredCurrencySign }}{{ cryptoCompareInfoFiat.LOW24HOUR | formatFiat }}
          </template>
          <TextPlaceholder v-else />
        </span>
      </div>
      <small class="c-asset-list-highlights__label -small">24hr Low</small>
    </div>
    <div class="c-asset-list-highlights__block">
      <strong v-if="cryptoCompareInfoMaster">
        {{ cryptoCompareInfoMaster.VOLUME24HOURTO | formatFiat }}
      </strong>
      <TextPlaceholder v-else />
      <small class="c-asset-list-highlights__label -small">24hr Volume {{ masterPairedSymbol }}</small>
    </div>
    <div class="c-asset-list-highlights__block">
      <strong v-if="cryptoCompareInfoMaster">
        {{ cryptoCompareInfoMaster.VOLUME24HOUR | formatFiat }}
      </strong>
      <TextPlaceholder v-else />
      <small class="c-asset-list-highlights__label -small">24hr Volume {{ quotePairedSymbol }}</small>
    </div>
    <div
      :class="{
        '-positive': (
          cryptoCompareInfoMaster &&
          cryptoCompareInfoMaster.CHANGEPCT24HOUR > 0
        ),
        '-negative': (
          cryptoCompareInfoMaster &&
          cryptoCompareInfoMaster.CHANGEPCT24HOUR < 0
        ),
      }"
      class="c-asset-list-highlights__block">
      <div class="c-asset-list-highlights__row">
        <strong v-if="cryptoCompareInfoMaster">
          {{ cryptoCompareInfoMaster.CHANGEPCT24HOUR | toFixed(2) }}%
        </strong>
        <TextPlaceholder v-else />
        <img
          class="c-asset-list-highlights__icon"
          src="@/assets/icons/arrow.svg"
          svg-inline
          svg-sprite>
      </div>
      <span class="c-asset-list-highlights__label">24hr Change</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import TextPlaceholder from '@/ui/TextPlaceholder'

export default {
  name: 'AssetListHighlights',
  components: {
    TextPlaceholder,
  },
  computed: {
    ...mapGetters(['preferredCurrencySign']),
    ...mapState(['preferredCurrencySymbol']),
    ...mapState('exchange', [
      'masterPairedSymbol',
      'quotePairedSymbol',
    ]),
    ...mapGetters('exchange', [
      'assetsCryptoCompareInfoSelector',
    ]),
    cryptoCompareInfoMaster () {
      return this.assetsCryptoCompareInfoSelector(this.quotePairedSymbol, this.masterPairedSymbol)
    },
    cryptoCompareInfoFiat () {
      return this.assetsCryptoCompareInfoSelector(this.quotePairedSymbol, this.preferredCurrencySymbol)
    },
  },
}
</script>

<style lang="scss">
.c-asset-list-highlights {
  display: flex;
}

.c-asset-list-highlights__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.c-asset-list-highlights__block {
  position: relative;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  background-color: $grey-1;
  border-top: 1px solid $grey-3;
  border-left: 1px solid $grey-3;

  strong:first-child {
    margin-right: 15px;
  }

  &.-blue {
    color: $blue;
    border-left: 3px solid $blue;
  }

  &.-negative {
    color: $red;
    border-left: 3px solid $red;
  }

  &.-positive {
    color: $green;
    border-left: 3px solid $green;

  }
}

.c-asset-list-highlights__label {
  width: 100%;

  &.-small { opacity: 0.5; }
}

.c-asset-list-highlights__icon {
  position: relative;
  top: 10px;
  opacity: 0;

  .-negative & {
    opacity: 1;
    transform: rotate(90deg);
  }

  .-positive & {
    opacity: 1;
    transform: rotate(-90deg);
  }
}
</style>
