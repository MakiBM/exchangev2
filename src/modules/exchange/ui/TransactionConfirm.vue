<template>
  <WalletStatus
    class="c-transaction-confirm"
    subtitle="Confirm your Transaction in MetaMask"
    :img="require('@/assets/images/metamask-confirm.png')" />
  <!-- TODO: Or Ledger -->
</template>

<script>
import WalletStatus from './WalletStatus'

export default {
  name: 'TransactionConfirm',
  components: {
    WalletStatus,
  }
}
</script>

<style lang="scss">
.c-transaction-confirm {
  .c-wallet-status__img {
    transform: translateX(12px);
  }
}
</style>
