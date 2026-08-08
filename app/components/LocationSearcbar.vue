<template>
  <div class="relative w-full" ref="searchWrapperRef">
    <UInput
      v-model="searchQuery"
      placeholder="Search city or barangay..."
      class="w-full"
      size="xl"
      icon="i-lucide-map-pin-search"
      :loading="isSearchLoading"
      :ui="{ base: '!rounded-full' }"
      @focus="showDropdown = true"
      @input="onSearchInput"
      @keydown.escape="closeSearch"
    >
      <template #trailing>
        <!-- Cancel pin mode button (shown when pinning) -->
        <UButton
          v-if="isPinMode"
          icon="i-lucide-x"
          variant="soft"
          color="error"
          size="xs"
          class="-mr-2 rounded-full cursor-pointer"
          @click="$emit('cancel-pin-mode')"
        />

        <!-- Current location button -->
        <UButton
          v-else
          icon="i-lucide-locate-fixed"
          variant="soft"
          color="neutral"
          :loading="isGettingLocation"
          class="w-8 h-8 sm:w-auto -mr-1 sm:h-8 rounded-full flex items-center justify-center px-0 sm:px-3 bg-slate-800/90 hover:bg-slate-700/90 text-blue-400 border border-slate-700/50 backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
          @click="$emit('use-current-location')"
        >
          <span class="hidden sm:inline text-xs font-semibold text-slate-200 capitalize">Current location</span>
        </UButton>
      </template>
    </UInput>

    <!-- Search results dropdown -->
    <Transition name="dropdown-fade">
      <div
        v-if="showDropdown && (searchResults.length > 0 || searchQuery.length > 1)"
        class="absolute top-full left-0 right-0 mt-2 z-[1100] rounded-2xl bg-slate-900/95 border border-slate-700/60 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <!-- Loading state -->
        <div v-if="isSearchLoading" class="flex items-center justify-center gap-2 p-4 text-slate-400 text-sm">
          <UIcon name="i-lucide-loader" class="animate-spin w-4 h-4" />
          Searching...
        </div>

        <!-- No results -->
        <div
          v-else-if="searchResults.length === 0 && searchQuery.length > 1"
          class="p-4 text-center text-slate-500 text-sm"
        >
          No results for "<span class="text-slate-300">{{ searchQuery }}</span>"
        </div>

        <!-- Results list -->
        <template v-else>
          <button
            v-for="place in nominatimResults"
            :key="place.place_id"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/80 transition-colors text-left cursor-pointer group"
            @click="onSelectPlace(place)"
          >
            <UIcon
              :name="place.type === 'city' || place.type === 'administrative' ? 'i-lucide-building-2' : 'i-lucide-map-pin'"
              class="w-4 h-4 flex-shrink-0"
              :class="place.type === 'city' || place.type === 'administrative' ? 'text-blue-400' : 'text-emerald-400'"
            />
            <div class="flex flex-col min-w-0">
              <span class="text-sm text-slate-200 group-hover:text-white truncate">{{ place.shortLabel }}</span>
              <span class="text-xs text-slate-500 truncate">{{ place.subLabel }}</span>
            </div>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
export interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  type: string
  shortLabel: string
  subLabel: string
  city: string | null
  barangay: string | null
}

defineProps<{
  isPinMode: boolean
  isGettingLocation: boolean
}>()

const emit = defineEmits<{
  'select-place': [place: NominatimResult]
  'use-current-location': []
  'cancel-pin-mode': []
}>()

const searchWrapperRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const showDropdown = ref(false)
const isSearchLoading = ref(false)
const nominatimResults = ref<NominatimResult[]>([])

const searchResults = computed(() => nominatimResults.value)

function parseNominatimResult(raw: any): NominatimResult {
  const addr = raw.address ?? {}
  const barangay = addr.suburb ?? addr.village ?? addr.quarter ?? addr.neighbourhood ?? null
  const city = addr.city ?? addr.town ?? addr.municipality ?? addr.county ?? null

  const shortLabel = barangay ?? addr.city_district ?? city ?? raw.display_name.split(',')[0]

  const subParts = [city, addr.state]
    .filter(Boolean)
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
  const subLabel = subParts.join(', ') || raw.display_name

  return {
    place_id: raw.place_id,
    lat: raw.lat,
    lon: raw.lon,
    type: raw.type ?? '',
    shortLabel,
    subLabel,
    city,
    barangay,
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) {
    nominatimResults.value = []
    return
  }
  isSearchLoading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const q = encodeURIComponent(searchQuery.value)
      const res: any = await $fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=8&countrycodes=ph&addressdetails=1`
      )
      nominatimResults.value = (res ?? []).map(parseNominatimResult)
    } catch {
      nominatimResults.value = []
    } finally {
      isSearchLoading.value = false
    }
  }, 350)
}

function closeSearch() {
  showDropdown.value = false
}

function onSelectPlace(place: NominatimResult) {
  searchQuery.value = place.shortLabel
  closeSearch()
  emit('select-place', place)
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target as Node)) {
      showDropdown.value = false
    }
  })
})
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
