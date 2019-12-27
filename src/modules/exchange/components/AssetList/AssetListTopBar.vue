<template>
  <div class="c-asset-list-top-bar"
    @click="toggleShowAssetList">
    <a
      v-for="masterSymbol in mastersSorted"
      :key="`c-asset-list-top-bar__master-asset--${masterSymbol}`"
      :class="{'-active': masterSymbol === masterSelected}"
      class="c-asset-list-top-bar__master-asset"
      @click.stop="handleClickMaster(masterSymbol)">
      {{ masterSymbol }}
    </a>
    <a
      class="c-asset-list-top-bar__favs"
      @click.stop="toggleShowAssetFavs">
      <!-- Put classes to array as of a bug with svg-inline -->
      <img
        :class="[
          'c-asset-list-top-bar__favs-icon',
          {'-active': showAssetFavs}
        ]"
        src="@/assets/icons/star-pin.svg"
        svg-inline
        >
      Show Favorites
    </a>
    <a
      :class="{'-active': showAssetList}"
      class="c-asset-list-top-bar__toggle-listing">
      <img
        src="@/assets/icons/carrot.svg"
        svg-inline
        svg-sprite>
    </a>
  </div>
</template>

<script>
// TODO: Add 0x project logo on the right

import { mapState, mapActions } from 'vuex'

export default {
  name: 'AssetListTopBar',
  computed: {
    ...mapState('exchange/assetList', [
      'showAssetFavs',
      'showAssetList',
      'mastersSorted',
      'masterSelected',
    ]),
  },
  methods: {
    ...mapActions({
      getAssetsCryptoCompareInfo: 'exchange/getAssetsCryptoCompareInfo',
      toggleShowAssetFavs: 'exchange/assetList/toggleShowAssetFavs',
      toggleShowAssetList: 'exchange/assetList/toggleShowAssetList',
      setMasterSelected: 'exchange/assetList/setMasterSelected',
    }),
    handleClickMaster (masterSymbol) {
      this.setMasterSelected(masterSymbol)
      this.getAssetsCryptoCompareInfo(masterSymbol)
    }
  },
}
</script>

<style lang="scss">
.c-asset-list-top-bar {
  display: flex;
  align-items: center;
  background-color: $grey-2;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
}

.c-asset-list-top-bar__master-asset {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 45px;
  font-size: 12px;
  letter-spacing: 2px;
  transition: all 0.1s $ease;

  &.-active {
    background: $blue;
    pointer-events: none;
  }
}

.c-asset-list-top-bar__favs {
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 1px;
}

.c-asset-list-top-bar__favs-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;

  &.-active {
    use {
      fill: $blue;
      fill-opacity: .2;
    }
    circle {
      stroke: $blue;
    }
    path {
      opacity: 1;
      fill: $blue;
    }
  }
}

.c-asset-list-top-bar__toggle-listing {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transform: scaleY(-1);

  &.-active {
    transform: scaleY(1);
  }
}
</style>
