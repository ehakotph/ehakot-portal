<template>
  <div class="flex flex-col h-screen w-full overflow-hidden bg-transparent relative">

    <Header>
      <LocationSearchBar
        :is-pin-mode="isPinMode"
        :is-getting-location="isGettingLocation"
        @select-place="selectPlace"
        @use-current-location="useCurrentLocation"
        @cancel-pin-mode="cancelPinMode"
      />
    </Header>

    <div class="flex-1 w-full absolute top-0 h-full">
      <Map
        ref="mapRef"
        :user-location="activeUserLocation"
        :truck-locations="truckLocations"
        :pin-mode="isPinMode"
        @pin-placed="onPinPlaced"
      />
    </div>

    <ConfirmPinModal
      :pending-pin="pendingPin"
      :selected-label="selectedLabel"
      :is-saving-location="isSavingLocation"
      @cancel="cancelPinMode"
      @confirm="confirmLocation"
    />

    <CollectionDrawer
      v-model="isDrawerOpen"
      :has-location="hasLocation"
      :user-location="activeUserLocation"
      :is-logged-in="isEffectiveLoggedIn"
      :active-collection="activeCollection"
      :upcoming-collections="matchedCollections.length > 0 ? matchedCollections : availableCollections"
      :selected-city="selectedCity"
      :current-user-barangay="currentUserBarangay"
      :current-user-city="currentUserCity"
      :is-guest="isEffectiveGuest"
      :is-guest-alert-visible="isGuestAlertVisible"
      @dismiss-alert="dismissGuestAlert"
    />

  </div>
</template>

<script lang="ts" setup>
import type { Collections } from '~/types/auth.model'
import type { MapLocation } from '~/components/Map.vue'
import type { NominatimResult } from '~/components/LocationSearchBar.vue'
import { cities } from '~/constants/cities'

const globalStore = useGlobalStore()
const { user, guestLocation } = storeToRefs(globalStore)

const authStore = useAuthStore()
const { isGuest, isLoggedIn, user: authUser } = storeToRefs(authStore)

const isEffectiveGuest = computed(() => {
  if (user.value) {
    return user.value.role === 'guest'
  }
  return isGuest.value
})

const isEffectiveLoggedIn = computed(() => {
  if (user.value) {
    return user.value.role !== 'guest'
  }
  return isLoggedIn.value
})


const { updateUserLocation } = useUsers()
const { searchCollectionByLocation } = useCollections()
const toast = useToast()

const isDrawerOpen = ref(true)
const isGuestAlertVisible = ref(true)

function dismissGuestAlert() {
  isGuestAlertVisible.value = false
}

const mapRef = ref<{ panTo: (lat: number, lng: number, zoom?: number) => void; placePin: (lat: number, lng: number) => void } | null>(null)

const activeUserLocation = computed<MapLocation | null>(() => {
  if (user.value?.location) {
    return user.value.location as MapLocation
  }
  if (isLoggedIn.value && authUser.value?.location) {
    return authUser.value.location as MapLocation
  }
  if (guestLocation.value) {
    return { lat: guestLocation.value.lat, lng: guestLocation.value.lng }
  }
  return null
})

const hasLocation = computed(() => !!activeUserLocation.value)

const selectedCity = ref<string | null>(null)
const selectedBarangay = ref<string | null>(null)
const selectedLabel = computed(() => {
  if (selectedBarangay.value && selectedCity.value) return `${selectedBarangay.value}, ${selectedCity.value}`
  if (selectedCity.value) return selectedCity.value
  return null
})

const currentUserBarangay = computed<string | null>(() => {
  if (selectedBarangay.value) return selectedBarangay.value
  if (user.value?.location_barangay) return user.value.location_barangay
  if (isLoggedIn.value && authUser.value?.location_barangay) return authUser.value.location_barangay
  if (guestLocation.value?.barangay) return guestLocation.value.barangay
  return null
})

const currentUserCity = computed<string | null>(() => {
  if (selectedCity.value) return selectedCity.value
  if (user.value?.location_city) return user.value.location_city
  if (user.value?.city_id) {
    const foundCity = cities.find(c => c.id === user.value?.city_id)
    if (foundCity) return foundCity.name
  }
  if (isLoggedIn.value && authUser.value?.location_city) return authUser.value.location_city
  if (guestLocation.value?.city) return guestLocation.value.city
  return null
})

const availableCollections = ref<Collections[]>([])

const matchedCollections = computed(() => {
  const userBgy = currentUserBarangay.value?.trim().toLowerCase()
  const userCity = currentUserCity.value?.trim().toLowerCase()

  if (!userBgy && !userCity) return []

  const exactBgyMatches = availableCollections.value.filter((col) => {
    if (userBgy && col.barangays && Array.isArray(col.barangays)) {
      return col.barangays.some((b) => {
        const bName = typeof b === 'string' ? b.trim().toLowerCase() : ''
        return bName.includes(userBgy) || userBgy.includes(bName)
      })
    }
    return false
  })

  if (exactBgyMatches.length > 0) return exactBgyMatches

  return availableCollections.value.filter((col) => {
    if (userCity && col.city?.name) {
      return col.city.name.trim().toLowerCase() === userCity
    }
    return false
  })
})

const activeCollection = computed(() => matchedCollections.value.find(col => col.status === 'ONGOING') || null)

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string | null; barangay: string | null }> {
  try {
    const res = await $fetch<any>(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`)
    if (res?.address) {
      const addr = res.address
      const barangay = addr.suburb ?? addr.village ?? addr.quarter ?? addr.neighbourhood ?? null
      const city = addr.city ?? addr.town ?? addr.municipality ?? addr.county ?? null
      return { city, barangay }
    }
  } catch (err) {
    console.error('Reverse geocoding error:', err)
  }
  return { city: null, barangay: null }
}

async function fetchAreaCollections() {
  try {
    const city = currentUserCity.value
    const barangay = currentUserBarangay.value

    const payload: { lat?: number; lng?: number; city: string; barangay?: string } = {
      city: city || ''
    }

    if (activeUserLocation.value?.lat && activeUserLocation.value?.lng) {
      payload.lat = Number(activeUserLocation.value.lat)
      payload.lng = Number(activeUserLocation.value.lng)
    }

    if (barangay) {
      payload.barangay = barangay
    }

    const response = await searchCollectionByLocation(payload)
    availableCollections.value = response?.data ?? []
  } catch (err) {
    console.error('Failed to fetch collections for area:', err)
    availableCollections.value = []
  }
}

watch([user, authUser], () => {
  selectedCity.value = null
  selectedBarangay.value = null
  if (activeUserLocation.value && mapRef.value) {
    const lat = Number(activeUserLocation.value.lat)
    const lng = Number(activeUserLocation.value.lng)
    if (!isNaN(lat) && !isNaN(lng)) {
      mapRef.value.panTo(lat, lng, 14)
    }
  }
  fetchAreaCollections()
}, { deep: true, immediate: true })

watch(hasLocation, (newVal) => {
  if (newVal) {
    isGuestAlertVisible.value = false
    isDrawerOpen.value = true
    fetchAreaCollections()
  }
}, { immediate: true })

const fetchedTruckLocations = ref<MapLocation[]>([])

async function fetchTruckLocations() {
  try {
    const collectionId = activeCollection.value?.id
    if (!collectionId) {
      fetchedTruckLocations.value = []
      return
    }
    const data: any = await useLocations().getDriverLocations(collectionId)

    if (data?.data && Array.isArray(data.data)) {
      fetchedTruckLocations.value = data.data.map((e: any) => {
      if (e.collection?.id) {
        const col = availableCollections.value.find(c => c.id === e.collection.id)
        if (col) {
          col.status = e.collection.status
        }
      }

      return {
        lat: e.lat,
        lng: e.lng,
        plate_number: e.collection?.truck?.plate_number,
        driver_name: e.driver?.name,
        driver_contact: e.driver?.contact_number,
        status: e.collection?.status,
        city_name: e.collection?.city?.name,
        description: e.collection?.description,
        barangays: e.collection?.barangays,
        collection_id: e.collection?.id
      }
    })
    }
  } catch (err) {
    console.error('Failed to fetch truck locations:', err)
  }
}

let truckLocationInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchTruckLocations()
  truckLocationInterval = setInterval(fetchTruckLocations, 5000)
})

onUnmounted(() => {
  if (truckLocationInterval) clearInterval(truckLocationInterval)
})

const truckLocations = computed<MapLocation[]>(() => {
  const userScheduledCollections = matchedCollections.value.length > 0
    ? matchedCollections.value
    : availableCollections.value

  if (userScheduledCollections.length === 0) {
    return []
  }

  const validScheduledCollectionIds = new Set(userScheduledCollections.map(c => c.id))
  const locs: MapLocation[] = []

  userScheduledCollections.forEach((col) => {
    const hist = col.collection_histories?.[0]?.location
    if (hist?.lat && hist?.lng) {
      locs.push({
        lat: hist.lat,
        lng: hist.lng,
        plate_number: col.truck?.plate_number,
        driver_name: col.driver?.name,
        driver_contact: col.driver?.contact_number ?? undefined,
        status: col.status,
        barangays: col.barangays,
        city_name: col.city?.name,
        description: col.collection_histories?.[0]?.description
      })
    }
  })

  fetchedTruckLocations.value.forEach((loc: any) => {
    const matchesUserSchedule = loc.collection_id
      ? validScheduledCollectionIds.has(loc.collection_id)
      : (
          (currentUserBarangay.value && loc.barangays?.includes(currentUserBarangay.value)) ||
          (currentUserCity.value && loc.city_name?.toLowerCase() === currentUserCity.value.toLowerCase())
        )

    if (matchesUserSchedule) {
      const alreadyAdded = locs.some(existing =>
        existing.plate_number === loc.plate_number ||
        (existing.lat === loc.lat && existing.lng === loc.lng)
      )
      if (!alreadyAdded) {
        locs.push(loc)
      }
    }
  })

  return locs
})


const isPinMode = ref(false)
const pendingPin = ref<{ lat: number; lng: number } | null>(null)
const isSavingLocation = ref(false)

async function onPinPlaced(coords: { lat: number; lng: number }) {
  pendingPin.value = coords
  isPinMode.value = true
  const { city, barangay } = await reverseGeocode(coords.lat, coords.lng)
  if (city) selectedCity.value = city
  if (barangay) selectedBarangay.value = barangay

  if (city || barangay) {
    await fetchAreaCollections()
  }
}

function cancelPinMode() {
  isPinMode.value = false
  pendingPin.value = null
}

async function confirmLocation() {
  if (!pendingPin.value) return
  try {
    await saveLocation(pendingPin.value.lat, pendingPin.value.lng)
    cancelPinMode() 
  } catch {
  }
}
function selectPlace(place: NominatimResult) {
  const lat = parseFloat(place.lat)
  const lng = parseFloat(place.lon)

  selectedCity.value = place.city
  selectedBarangay.value = place.barangay

  fetchAreaCollections()

  isPinMode.value = true
  if (mapRef.value) {
    const zoom = place.barangay ? 15 : 13
    mapRef.value.panTo(lat, lng, zoom)
  }
}
const isGettingLocation = ref(false)

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    toast.add({
      title: 'Not supported',
      description: 'Geolocation is not supported by your browser.',
      color: 'warning',
      icon: 'i-lucide-map-pin-off'
    })
    return
  }
  isGettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      isGettingLocation.value = false

      isPinMode.value = true
      pendingPin.value = { lat, lng }
      mapRef.value?.panTo(lat, lng, 16)
      mapRef.value?.placePin(lat, lng)

      const { city, barangay } = await reverseGeocode(lat, lng)
      if (city) selectedCity.value = city
      if (barangay) selectedBarangay.value = barangay

      if (city || barangay) {
        await fetchAreaCollections()
      }
    },
    (err) => {
      isGettingLocation.value = false
      console.error('Geolocation error:', err)
      toast.add({
        title: 'Location access denied',
        description: 'Could not get your location. Please check your browser permissions.',
        color: 'error',
        icon: 'i-lucide-shield-alert'
      })
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function saveLocation(lat: number, lng: number) {
  isSavingLocation.value = true
  try {
    if (isLoggedIn.value && authUser.value?.id) {
      await updateUserLocation(authUser.value.id as number, {
        location: { lat, lng },
      })
      if (authStore.user) {
        authStore.user = {
          ...authStore.user,
          location: { lat, lng },
          location_city: selectedCity.value ?? undefined,
          location_barangay: selectedBarangay.value ?? undefined
        }
      }
      toast.add({
        title: 'Location saved',
        description: 'Your location has been updated successfully.',
        color: 'success',
        icon: 'i-lucide-map-pin-check'
      })
    } else {
      globalStore.setGuestLocation({
        lat,
        lng,
        city: selectedCity.value,
        barangay: selectedBarangay.value
      })
      if (globalStore.user) {
        globalStore.setUser({
          ...globalStore.user,
          location: { lat, lng },
          location_city: selectedCity.value,
          location_barangay: selectedBarangay.value
        })
      }
    }

    isGuestAlertVisible.value = false
    isDrawerOpen.value = true
    await fetchAreaCollections()
  } catch (err) {
    console.error('Failed to save location:', err)
    toast.add({
      title: 'Failed to save location',
      description: 'Something went wrong while saving your location. Please try again.',
      color: 'error',
      icon: 'i-lucide-cloud-off'
    })
    throw err 
  } finally {
    isSavingLocation.value = false
  }
}
</script>