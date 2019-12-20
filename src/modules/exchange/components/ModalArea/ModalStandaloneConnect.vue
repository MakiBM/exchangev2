<template>
  <Modal
    class="-standalone"
    @closeClick="removeOpenedModal(STANDALONE_CONNECT)">
    <ModalOnboardingConnect
      title="Connect Your Account" />
  </Modal>
</template>

<script>
import { mapActions } from 'vuex'
import { STANDALONE_CONNECT } from './constants'
import Modal from './Modal'
import ModalOnboardingConnect from './ModalOnboardingConnect'

export default {
  name: 'ModalStandaloneConnect',
  components: {
    Modal,
    ModalOnboardingConnect,
  },
  data () {
    return {
      STANDALONE_CONNECT,
    }
  },
  methods: {
    ...mapActions('exchange/modalArea', [
      'removeOpenedModal',
    ]),
  },
}
</script>
