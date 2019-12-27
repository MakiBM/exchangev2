<template>
  <Modal
    class="c-modal-standalone-weth-get -standalone"
    @closeClick="removeOpenedModal(id)">
    <ModalOnboardingWethGet
      title="Wrap Weth"
      :onmounted="data.onmounted" />
  </Modal>
</template>

<script>
import { mapActions } from 'vuex'
import Modal from './Modal'
import ModalOnboardingWethGet from './ModalOnboardingWethGet'

export default {
  name: 'ModalStandaloneWeth',

  components: {
    Modal,
    ModalOnboardingWethGet,
  },

  props: {
    id: String,
    data: Object,
  },

  methods: {
    ...mapActions('exchange/modalArea', [
      'removeOpenedModal',
    ]),
  },
}
</script>

<style lang="scss">
.c-modal-standalone-weth-get {

  .c-modal-inner__header-title {
    text-transform: none;
    font-size: 17px;
  }

  .c-modal-inner-action__title { display: none; }
  .c-modal-inner-action__desc { text-align: left; }
}
</style>
