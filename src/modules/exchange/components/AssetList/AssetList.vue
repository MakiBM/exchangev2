<template>
  <div class="c-asset-list">
    <div class="c-asset-list__header">
      <h1 class="c-asset-list__title">
        <strong v-if="assetsBySymbol[quotePairedSymbol]">{{ assetsBySymbol[quotePairedSymbol].name }}</strong> Exchange
        <small class="c-asset-list__subtitle">{{ quotePairedSymbol }} / {{ masterPairedSymbol }}</small>
      </h1>
      <img
        class="c-asset-list__powered-logo"
        src="@/assets/logos/0x-powered.svg"
        svg-inline>
    </div>
    <div class="c-asset-list__scroller">
      <AssetListTopBar />
      <AssetListTable v-if="showAssetList" />
      <AssetListHighlights />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AssetListTopBar from './AssetListTopBar'
import AssetListTable from './AssetListTable'
import AssetListHighlights from './AssetListHighlights'

export default {
  name: 'AssetList',
  components: {
    AssetListTopBar,
    AssetListTable,
    AssetListHighlights
  },
  computed: {
    ...mapState('exchange', [
      'assetsBySymbol',
      'masterPairedSymbol',
      'quotePairedSymbol',
    ]),
    ...mapState('exchange/assetList', [
      'showAssetList',
    ]),
  },
}
</script>

<style lang="scss">
.c-asset-list {
  &__title {
    position: relative;
    font-size: 24px;
    line-height: 1;
    text-transform: uppercase;
  }

  &__subtitle {
    display: block;
    font-size: 12px;
    line-height: (15/12);
    margin-top: 0.4em;
    opacity: 0.5;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 35px 15px 20px 15px;
  }

  &__powered-logo {
    width: 85px;
    opacity: 0.5;
  }
}
</style>
