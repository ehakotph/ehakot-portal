import { defineStore } from 'pinia'
import type { HeatmapReport, User } from '../types/auth.model'
export interface GuestLocation {
  lat: number
  lng: number
  city?: string | null
  barangay?: string | null
}

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isLoading: false,
    isOpenSidebar: false,
    user: null as User | null,
    userRole: '',
    reports: [] as HeatmapReport[],
    guestLocation: null as GuestLocation | null,
    selectedCollectionId: undefined as number | undefined,
  }),
  actions: {
    setIsLoading(loading: boolean) {
      this.isLoading = loading
    },
    setUser(user: User) {
      this.user = user
    },
    setGuestLocation(loc: GuestLocation) {
      this.guestLocation = loc
    },
    clearGuestLocation() {
      this.guestLocation = null
    },
    setSelectedCollectionId(id: number | undefined) {
      this.selectedCollectionId = id
    },
  },
  getters: {
    getUser: (state) => state.user,
    getRole: (state) => state.userRole,
    getGuestLocation: (state) => state.guestLocation,
  },
  persist: {
    storage: persistedState.localStorage,
  },
})
