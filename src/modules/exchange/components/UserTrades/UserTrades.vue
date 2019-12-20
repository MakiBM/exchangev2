<template>
  <div v-if="ethAccount">
    <SectionTitle
      class="c-user-trades__title"
      :active="activeTable === 'open'"
      :muted="activeTable !== 'open'"
      @click.native="handleClickTitle('open')">
      My Open Orders
    </SectionTitle>
    <SectionTitle
      class="c-user-trades__title"
      :active="activeTable === 'history'"
      :muted="activeTable !== 'history'"
      @click.native="handleClickTitle('history')">
      My Trade History
    </SectionTitle>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import SectionTitle from '@/ui/SectionTitle'

export default {
  name: 'UserTrades',
  components: {
    SectionTitle,
  },
  computed: {
    ...mapState('exchange/wallet', ['ethAccount']),
    ...mapGetters({
      activeTable: 'exchange/userTrades/activeTable',
    }),
  },
  methods: {
    ...mapActions({
      setActiveTable: 'exchange/userTrades/setActiveTable',
    }),
    handleClickTitle (tableName) {
      this.setActiveTable(tableName)
    }
  },
}
</script>

<style lang="scss">
.c-user-trades__title {
  cursor: pointer;
}
</style>
