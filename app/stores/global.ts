import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    setIsLoading(loading: boolean) {
      this.isLoading = loading
    },
  },
  getters: {
  },
  persist: {
    storage: persistedState.localStorage,
  },
})
