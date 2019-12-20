<template>
  <Modal
    class="c-modal-standalone-permission -standalone"
    @closeClick="removeOpenedModal(id)">
    <ModalOnboardingPermission
      title="Set trading permissions"
      :symbols="data.symbols"
      :onmounted="data.onmounted" />
  </Modal>
</template>

<script>
import { mapActions } from 'vuex'
import Modal from './Modal'
import ModalOnboardingPermission from './ModalOnboardingPermission'

export default {
  name: 'ModalStandalonePermission',

  components: {
    Modal,
    ModalOnboardingPermission,
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
.c-modal-standalone-permission {

  .c-modal-inner__header-title {
    text-transform: none;
    font-size: 17px;
  }

  .c-modal-inner-action__title { display: none; }
  .c-modal-inner-action__desc { text-align: left; }

  .c-button,
  .c-button:hover {
    background: transparent;
    color: $blue;
  }
}
</style>
