<template>
  <div class="c-exchange __page theme-dark">
    <AssetList class="__container" />
    <Chart class="__container -wide" />
    <div class="__container __relative">
      <Trading />
      <ModalArea />
    </div>
    <OrderBook class="__container" />
    <MarketTrades class="__container" />
    <UserTrades class="__container" />
  </div>
</template>

<script>
import AssetList from './components/AssetList/AssetList.vue'
import Chart from './components/Chart/Chart.vue'
import Trading from './components/Trading/Trading.vue'
import ModalArea from './components/ModalArea/ModalArea.vue'
import OrderBook from './components/OrderBook/OrderBook.vue'
import MarketTrades from './components/MarketTrades/MarketTrades.vue'
import UserTrades from './components/UserTrades/UserTrades.vue'
// import exchangeStore from './store'
// const storeModuleName = 'exchange'

export default {
  name: 'Exchange',
  components: {
    AssetList,
    Chart,
    Trading,
    ModalArea,
    OrderBook,
    MarketTrades,
    UserTrades,
  },
  beforeCreate () {
    // if (!(this.$store && this.$store.state && this.$store.state[storeModuleName])) {
    //   this.$store.registerModule(storeModuleName, exchangeStore)
    // }
  },
  async mounted () {
    await this.$store.dispatch('exchange/init')
    await this.$store.dispatch('exchange/assetList/init')
    await this.$store.dispatch('exchange/wallet/init')
    await this.$store.dispatch('exchange/market/init')
    await this.$store.dispatch('exchange/limit/init')
    await this.$store.dispatch('exchange/modalArea/init')
    await this.$store.dispatch('exchange/orderBook/init')
    await this.$store.dispatch('exchange/marketTrades/init')
  },
}
</script>
