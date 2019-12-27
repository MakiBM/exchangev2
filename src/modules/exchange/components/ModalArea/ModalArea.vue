<template>
  <div
    v-if="openedModals.length"
    class="c-modal-area">
    <div class="c-modal-area__overlay"></div>

    <template
      v-for="(modal, i) in openedModals">
      <div
        class="c-modal-area__item"
        :key="`modal-${modal.id}`"
        :style="modalStyles(openedModals.length - i - 1)">
        <component
          :is="modal.component"
          :id="modal.id"
          :data="modal.data" />
      </div>
    </template>

  </div>
</template>

<script>
import { mapState } from 'vuex'
// Modals are used as dynamic components
import ModalOnboarding from './ModalOnboarding'
import ModalStandaloneConnect from './ModalStandaloneConnect'
import ModalStandalonePermission from './ModalStandalonePermission'
import ModalStandaloneWethGet from './ModalStandaloneWethGet'
import ModalPartialFill from './ModalPartialFill'
import ModalTimePicker from './ModalTimePicker'

export default {
  name: 'ModalArea',
  components: {
    ModalOnboarding,
    ModalStandaloneConnect,
    ModalStandalonePermission,
    ModalStandaloneWethGet,
    ModalPartialFill,
    ModalTimePicker,
  },
  computed: {
    ...mapState('exchange/modalArea', [
      'openedModals',
    ]),
  },
  methods: {
    modalStyles (i) {
      return `
        opacity: ${1 - 0.1 * i};
        transform: scale(${1 - 0.05 * i}) translateY(${10 * i}px);
      `
    },
  },
}
</script>

<style lang="scss">
.c-modal-area__overlay {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(21, 22, 24, 0.85);
}

.c-modal-area__item {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  margin-top: 35px;
  transition: all 0.2s ease;
}
</style>
