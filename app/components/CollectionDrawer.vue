<template>
  <div>
    <UDrawer
      v-if="hasLocation || isLoggedIn"
      v-model:open="drawerOpen"
      :modal="false"
      :dismissible="false"
      :handle="false"
      inset
      :class="isDrawerFull ? 'h-[80vh] max-h-[80vh]' : 'h-auto'"
      class="rounded-4xl transition-all duration-300"
      :ui="{ content: 'z-[1001] bottom-4 left-1/2 -translate-x-1/2 sm:right-4 sm:left-auto sm:translate-x-0 w-[calc(100%-2rem)] sm:w-96 overflow-hidden' }"
    >
      <template #header>
        <div
          class="fixed left-1/2 top-0 z-10 flex w-full -translate-x-1/2 items-center justify-center pt-5 pb-2 cursor-pointer"
          @click="toggleDrawer"
        >
          <div class="h-1.5 w-12 rounded-full bg-gray-700 opacity-50 dark:bg-gray-100" />
        </div>

        <!-- Active collection header -->
        <div v-if="activeCollection" class="mt-2 flex items-center justify-between w-full">
          <UUser
            :name="activeCollection.truck ? `Truck ${activeCollection.truck.plate_number}` : 'Truck #101'"
            :description="activeCollection.driver?.name || 'Juan Dela Cruz'"
            :avatar="{ icon: 'i-lucide-truck' }"
            size="xl"
          />
          <UBadge
            :color="getStatusBadgeColor(activeCollection.status)"
            variant="subtle"
            class="capitalize"
          >
            {{ activeCollection.status?.toLowerCase() || 'ongoing' }}
          </UBadge>
        </div>

        <!-- No collection header -->
        <div v-else class="mt-2 flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <UIcon name="i-lucide-calendar-x" class="w-5 h-5" />
            </div>
            <div class="flex flex-col">
              <span class="font-semibold text-slate-100">No Current Data</span>
              <span class="text-xs text-slate-400">No collection scheduled for this area</span>
            </div>
          </div>
        </div>
      </template>

      <template #body>
        <div class="flex flex-col gap-4 text-sm" :class="{ 'max-h-[calc(80vh-140px)] overflow-y-auto pr-1': isDrawerFull }">
          <!-- Compact Mode (Drawer Not Full): Only Current Collection Summary -->
          <div v-if="!isDrawerFull && activeCollection" class="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400 block font-medium">Est. Arrival</span>
              <span class="font-semibold text-gray-900 dark:text-white">15 - 20 mins</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400 block font-medium">City</span>
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ activeCollection.city?.name || selectedCity || 'Caloocan' }}
              </span>
            </div>
          </div>

          <!-- Full Mode (Drawer Expanded): Extended Current Info & Upcoming Collections -->
          <template v-if="isDrawerFull">
            <!-- Active Collection Extended Info -->
            <div v-if="activeCollection" class="flex flex-col gap-3 p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-xs text-emerald-400/80 block font-medium">Est. Arrival</span>
                  <span class="font-semibold text-emerald-200">15 - 20 mins</span>
                </div>
                <div>
                  <span class="text-xs text-emerald-400/80 block font-medium">City</span>
                  <span class="font-semibold text-emerald-200">
                    {{ activeCollection.city?.name || selectedCity || 'Caloocan' }}
                  </span>
                </div>
              </div>

              <div class="flex items-start justify-between py-1 border-t border-emerald-800/40 pt-2">
                <span class="text-xs text-gray-400 font-medium pt-0.5">Schedule Date</span>
                <div class="flex flex-col items-end">
                  <span class="text-xs font-semibold text-gray-200">
                    {{ formatDate(activeCollection.date) }}
                  </span>
                  <span v-if="activeCollection.from && activeCollection.to" class="text-[11px] font-medium text-emerald-300/80 mt-0.5">
                    {{ formatTime(activeCollection.from) }} - {{ formatTime(activeCollection.to) }}
                  </span>
                </div>
              </div>

              <div>
                <span class="text-xs text-gray-400 block font-medium mb-1.5">Barangays Covered</span>
                <div
                  v-if="activeCollection.barangays && Array.isArray(activeCollection.barangays) && activeCollection.barangays.length > 0"
                  class="flex flex-wrap gap-1.5"
                >
                  <UBadge
                    v-for="bgy in activeCollection.barangays"
                    :key="bgy"
                    color="neutral"
                    variant="outline"
                    size="sm"
                  >
                    {{ bgy }}
                  </UBadge>
                </div>
                <span v-else class="text-xs text-gray-400 italic">No barangays covered</span>
              </div>
            </div>

            <!-- Upcoming Collections Section -->
            <div class="mt-2 flex flex-col gap-2.5">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-xs text-gray-400 uppercase tracking-wider">
                  Upcoming Collections
                </span>
                <UBadge color="neutral" variant="subtle" size="xs">
                  {{ upcomingCollectionsList.length }} scheduled
                </UBadge>
              </div>

              <!-- List of Upcoming Collections -->
              <div v-if="upcomingCollectionsList.length > 0" class="flex flex-col gap-2">
                <div
                  v-for="col in upcomingCollectionsList"
                  :key="col.id"
                  class="p-3 rounded-2xl border transition-all duration-200"
                  :class="[
                    col.id === activeCollection?.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800'
                  ]"
                >
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-truck" class="w-4 h-4 text-emerald-400" />
                      <span class="font-medium text-xs text-gray-900 dark:text-gray-100">
                        {{ col.truck ? `Truck ${col.truck.plate_number}` : 'Truck Schedule' }}
                      </span>
                    </div>

                    <!-- Highlight Badge for Active Collection vs Standard Badge -->
                    <UBadge
                      v-if="col.id === activeCollection?.id"
                      color="success"
                      variant="solid"
                      size="xs"
                      class="font-semibold animate-pulse"
                    >
                      Active Now
                    </UBadge>
                    <UBadge
                      v-else
                      :color="getStatusBadgeColor(col.status)"
                      variant="subtle"
                      size="xs"
                      class="capitalize"
                    >
                      {{ col.status?.toLowerCase() || 'scheduled' }}
                    </UBadge>
                  </div>

                  <div class="flex items-start justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span class="pt-0.5">{{ col.driver?.name || 'Assigned Driver' }}</span>
                    <div class="flex flex-col items-end">
                      <span class="font-medium text-gray-300">{{ formatDate(col.date) }}</span>
                      <span v-if="col.from && col.to" class="text-[10px] text-gray-400 mt-0.5">
                        {{ formatTime(col.from) }} - {{ formatTime(col.to) }}
                      </span>
                    </div>
                  </div>

                  <div v-if="col.barangays && col.barangays.length > 0" class="flex flex-wrap gap-1">
                    <span
                      v-for="bgy in col.barangays"
                      :key="bgy"
                      class="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300"
                    >
                      {{ bgy }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty Upcoming State -->
              <div v-else class="p-4 text-center text-xs bg-gray-50 dark:bg-gray-800/40 rounded-2xl text-gray-400">
                No upcoming collections scheduled for {{ locationLabel || 'your location' }}.
              </div>
            </div>
          </template>

          <!-- No Collection State (when no active collection exists and not full) -->
          <div v-if="!activeCollection && !isDrawerFull" class="p-4 text-center text-sm bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <p class="font-semibold text-gray-200">No Current Data</p>
            <p class="text-xs text-gray-400 mt-1">
              There are currently no active collection schedules in
              {{ locationLabel || 'this area' }}.
            </p>
          </div>

          <!-- Trash Ready Action Button -->
          <div v-if="!isGuest" class="mt-2 pt-3 border-t border-gray-200 dark:border-gray-800">
            <TrashReadyCard
              :active-collection="activeCollection"
              :user-location="userLocation"
              :has-location="hasLocation"
              :is-logged-in="isLoggedIn"
            />
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Guest alert -->
    <UAlert
      v-if="isGuest && !hasLocation && isGuestAlertVisible"
      class="fixed rounded-3xl bottom-4 left-1/2 -translate-x-1/2 sm:right-4 sm:left-auto sm:translate-x-0 w-[calc(100%-2rem)] sm:w-96 z-[1001] text-black"
      title="You're Using Guest Mode"
      description="Set your location or log in to view garbage collection schedules near you."
      :avatar="{ src: '/icon.png', size: 'lg', class: 'rounded-xl' }"
      color="info"
      variant="solid"
      :close="{
        color: 'neutral',
        variant: 'ghost',
        class: 'cursor-pointer rounded-full',
        onClick: () => $emit('dismiss-alert')
      }"
      @close="$emit('dismiss-alert')"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Collections, Location } from '~/types/auth.model'
import type { MapLocation } from '~/components/Map.vue'

const props = defineProps<{
  modelValue: boolean
  hasLocation: boolean
  userLocation?: Location | MapLocation | { lat?: number | string; lng?: number | string } | null
  isLoggedIn: boolean
  activeCollection: Collections | null
  upcomingCollections?: Collections[]
  selectedCity: string | null
  currentUserBarangay: string | null
  currentUserCity: string | null
  isGuest: boolean
  isGuestAlertVisible: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'dismiss-alert': []
}>()

// v-model bridge for isDrawerOpen
const drawerOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Internal: drawer full expansion state
const isDrawerFull = ref(false)

function toggleDrawer() {
  isDrawerFull.value = !isDrawerFull.value
}

const locationLabel = computed(() => {
  if (props.currentUserBarangay && props.currentUserCity) {
    return `${props.currentUserBarangay}, ${props.currentUserCity}`
  }
  return props.currentUserBarangay || props.currentUserCity || null
})

const upcomingCollectionsList = computed(() => {
  return props.upcomingCollections ?? []
})

function getStatusBadgeColor(status?: string): 'success' | 'neutral' | 'warning' {
  if (status === 'COMPLETED') return 'success'
  if (status === 'PENDING') return 'neutral'
  return 'warning'
}

function formatDate(dateVal?: Date | string) {
  if (!dateVal) return 'No date scheduled'
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(timeStr?: string) {
  if (!timeStr) return ''
  const [hour, minute] = timeStr.split(':')
  if (!hour || !minute) return timeStr
  let h = parseInt(hour, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${minute} ${ampm}`
}
</script>
