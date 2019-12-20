import ls from 'local-storage'

const locationKey = location && location.host
  ? `etherblockchain@${location.host}`
  : false

export default {
  set (key, val) {
    if (locationKey) {
      const locationStore = ls.get(locationKey) || {}
      ls.set(locationKey, {
        ...locationStore,
        [key]: val,
      })
    }
  },

  get (key) {
    if (locationKey) {
      const locationStore = ls.get(locationKey)
      if (locationStore) return locationStore[key]
    }
  },
}
