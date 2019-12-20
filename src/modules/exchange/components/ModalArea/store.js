import isUndefined from 'lodash/isUndefined'
import storage from '@/services/storage'
import { STEP_CONNECT_YOUR_ACCOUNT } from './constants'

const state = () => ({
  openedModals: [],
  isOnboardingActive: !isUndefined(storage.get('exchange/modalArea/isOnboardingActive'))
    ? storage.get('exchange/modalArea/isOnboardingActive')
    : true,
  onboardingStep: !isUndefined(storage.get('exchange/modalArea/onboardingStep'))
    ? storage.get('exchange/modalArea/onboardingStep')
    : STEP_CONNECT_YOUR_ACCOUNT,
})

const mutations = {
  setOpenedModals: (state, payload) => { state.openedModals = payload },
  setIsOnboardingActive: (state, payload) => {
    state.isOnboardingActive = payload
    storage.set('exchange/modalArea/isOnboardingActive', payload)
  },
  setOnboardingStep: (state, payload) => {
    state.onboardingStep = payload
    storage.set('exchange/modalArea/onboardingStep', payload)
  },
}

const actions = {
  init ({ dispatch, state }) {
    const { isOnboardingActive, openedModals } = state
    if (isOnboardingActive && !openedModals.some(modal => modal.id === 'onboarding')) {
      dispatch('addOpenedModal', {
        id: 'onboarding',
        component: 'ModalOnboarding',
      })
    }
  },
  addOpenedModal ({ commit, state }, payload) {
    const { openedModals } = state
    const newOpenedModals = [...openedModals, payload]
    commit('setOpenedModals', newOpenedModals)
  },
  removeOpenedModal ({ commit, state }, payload) {
    const { openedModals } = state
    const newOpenedModals = openedModals.filter(modal => modal.id !== payload)
    commit('setOpenedModals', newOpenedModals)
  },
  setIsOnboardingActive ({ commit, dispatch }, payload) {
    commit('setIsOnboardingActive', payload)
    if (payload === true) {
      dispatch('addOpenedModal', {
        id: 'onboarding',
        component: 'ModalOnboarding',
      })
    } else {
      dispatch('removeOpenedModal', 'onboarding')
    }
  },
  setOnboardingStep ({ commit }, payload) {
    commit('setOnboardingStep', payload)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
