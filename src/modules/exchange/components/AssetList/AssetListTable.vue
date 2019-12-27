<template>
  <Table
    :cols="[
      {label: 'Fav.',   width: '7%'},
      {label: 'Name',   width: '20%', sortable: true},
      {label: 'Symbol', width: '10%', sortable: true},
      {label: 'Price',  width: '30%', sortable: true},
      {label: 'Volume', width: '20%', sortable: true},
      {label: 'Change', width: '13%', sortable: true},
    ]"
    :visibleRows="8"
    :isLoading="isLoading"
    :sort="assetListSort"
    emptyText="No assets to list"
    @sort="handleSort"
    @click.native="handleClickDelegation">

    <AssetListTableRow
      v-for="quoteAsset in quoteAssetListSorted"
      :key="`c-asset-list-row--${quoteAsset}`"
      :data-pair="quoteAsset"
      :class="{'-active': masterSelected === masterPairedSymbol && quoteAsset === quotePairedSymbol}"
      :quoteAsset="quoteAsset"
      class="c-asset-list-row" />

  </Table>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import sortBy from 'lodash/fp/sortBy'
import get from 'lodash/get'
import { eventDelegationTarget } from '@/utils'
import Table from '@/ui/Table'
import AssetListTableRow from './AssetListTableRow'

export default {
  name: 'AssetListTable',
  components: {
    Table,
    AssetListTableRow,
  },

  computed: {
    ...mapState([
      'preferredCurrencySymbol',
      'preferredCurrencySign',
    ]),
    ...mapState('exchange', [
      'isLoading',
      'assetsBySymbol',
      'masterPairedSymbol',
      'quotePairedSymbol',
      'quoteAssetsByMasterSymbol',
    ]),
    ...mapGetters('exchange', [
      'assetsCryptoCompareInfoSelector',
    ]),
    ...mapState('exchange/assetList', [
      'assetListSort',
      'showAssetFavs',
      'favsByMaster',
      'masterSelected',
    ]),
    quoteAssetList () {
      const favsByMasterList = this.favsByMaster[this.masterSelected]
      if (this.showAssetFavs && favsByMasterList && favsByMasterList.length) return favsByMasterList
      else if (this.quoteAssetsByMasterSymbol[this.masterSelected]) return this.quoteAssetsByMasterSymbol[this.masterSelected]
      else return []
    },
    quoteAssetListSorted () {
      const cryptoCompareInfo = field => quoteAsset => get(this.assetsCryptoCompareInfoSelector(quoteAsset, this.masterSelected), [field], 0)
      const sortScenarios = {
        'Name': sortBy(quoteAsset => this.assetsBySymbol[quoteAsset] && this.assetsBySymbol[quoteAsset].name.toLowerCase()),
        'Symbol': sortBy(quoteAsset => this.assetsBySymbol[quoteAsset] && this.assetsBySymbol[quoteAsset].symbol),
        'Price': sortBy(cryptoCompareInfo('PRICE')),
        'Volume': sortBy(cryptoCompareInfo('VOLUMEDAYTO')),
        'Change': sortBy(cryptoCompareInfo('CHANGEPCT24HOUR')),
      }
      if (this.quoteAssetList.length && sortScenarios[this.assetListSort.col]) {
        const listSorted = sortScenarios[this.assetListSort.col]([...this.quoteAssetList])
        if (this.assetListSort.type === 'desc') listSorted.reverse()
        return listSorted
      }
      return this.quoteAssetList
    },
  },

  methods: {
    ...mapActions({
      setMasterPairedSymbol: 'exchange/setMasterPairedSymbol',
      setQuotePairedSymbol: 'exchange/setQuotePairedSymbol',
      setFavsByMaster: 'exchange/assetList/setFavsByMaster',
      setAssetListSort: 'exchange/assetList/setAssetListSort',
    }),
    handleSort (label) {
      this.setAssetListSort(label)
    },
    handleClickDelegation (event) {
      const favEl = eventDelegationTarget('[data-fav]', event)
      const pairEl = eventDelegationTarget('[data-pair]', event)

      if (favEl) {
        this.setFavsByMaster({
          masterSymbol: this.masterSelected,
          favSymbol: favEl.getAttribute('data-fav')
        })
      } else if (pairEl) {
        this.setMasterPairedSymbol(this.masterSelected)
        this.setQuotePairedSymbol(pairEl.getAttribute('data-pair'))
      }
    },
  },
}
</script>

<style lang="scss">
.c-asset-list-row {
  cursor: pointer;

  &.-active {
    background: $blue-dark;
    border-bottom: solid 2px $blue;
  }

  &.-active td {
    height: 49px; // fix height issues
    box-shadow:
      inset 1px 0px 0px 0px rgba(0, 0, 0, 0.3), // border left
      inset 0px 0px 0px 0px $blue; // border bottom
  }
}
</style>
