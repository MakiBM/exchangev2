import Vue from 'vue'

const busVue = new Vue()

const eventBus = {
  emit: busVue.$emit.bind(busVue),
  on: busVue.$on.bind(busVue),
  off: busVue.$off.bind(busVue),
  once: busVue.$once.bind(busVue),
}

export default eventBus
