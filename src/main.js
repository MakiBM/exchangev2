import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import filters from './filters'

Vue.config.productionTip = false

// Expose store in development to trigger actions form dev tools
if (process.env.NODE_ENV !== 'production') {
  window.store = store
}

// Register all global filters.
Object.entries(filters).forEach(filter => {
  Vue.filter(filter[0], filter[1])
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
