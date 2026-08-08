<template>
  <div class="flex flex-col h-full w-full overflow-hidden relative">
    <!-- Header with schedule selector — stacks on mobile -->
    <Header>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-x-3 w-full">
        <div class="flex items-center gap-x-2 shrink-0">
          <!-- <UIcon name="i-lucide-route" class="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" /> -->
          <h1 class="text-base sm:text-lg font-semibold text-slate-100 whitespace-nowrap">Driver's Route</h1>
          <UButton
            :color="testMode ? 'primary' : 'secondary'"
            variant="soft"
            size="xs"
            icon="i-lucide-bug"
            @click="testMode = !testMode"
          >
            {{ testMode ? 'Test Mode On' : 'Test Mode Off' }}
          </UButton>
        </div>

        <USelectMenu
          :model-value="selectedCollectionId"
          :items="collectionOptions"
          value-key="value"
          label-key="label"
          placeholder="Select a collection schedule"
          class="w-full"
          icon="i-lucide-calendar-clock"
          @update:model-value="handleCollectionSelect"
        >
          <template #item-label="{ item }">
            <div class="flex flex-col gap-0.5">
              <span class="font-medium">{{ item.label }}</span>
              <span class="text-xs text-slate-400">{{ item.sub }}</span>
            </div>
          </template>
        </USelectMenu>
      </div>
    </Header>

    <!-- Empty state: no collection selected -->
    <div
      v-if="!selectedCollection"
      class="flex-1 flex flex-col items-center justify-center gap-y-4 px-6"
    >
      <div class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/60 border border-slate-700/50">
        <UIcon name="i-lucide-map-pin-off" class="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
      </div>
      <div class="text-center space-y-1">
        <p class="text-slate-300 font-semibold text-base sm:text-lg">No Schedule Selected</p>
        <p class="text-slate-500 text-xs sm:text-sm max-w-xs">
          Select an active or ongoing collection schedule above to start tracking your route.
        </p>
      </div>
    </div>

    <!-- Map + info panel when a collection is selected -->
    <template v-else>
      <!-- Collection info bar — grid layout that wraps on mobile -->
      <div class="px-4 sm:px-6 py-3 bg-slate-900/80 border-b border-slate-800">
        <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-x-4">
          <!-- Status -->
          <div class="flex items-center gap-x-1.5">
            <UIcon
              name="i-lucide-circle"
              :class="[
                'w-2.5 h-2.5 sm:w-3 sm:h-3',
                selectedCollection.status === 'ONGOING' ? 'text-sky-400 animate-pulse' : 'text-amber-400'
              ]"
            />
            <span
              class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
              :class="selectedCollection.status === 'ONGOING' ? 'text-sky-400' : 'text-amber-400'"
            >
              {{ selectedCollection.status }}
            </span>
          </div>

          <!-- Date -->
          <div class="flex items-center gap-x-1.5">
            <UIcon name="i-lucide-calendar-days" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span class="text-[10px] sm:text-xs text-slate-300 truncate">{{ formatDate2(selectedCollection.date) }}</span>
          </div>

          <!-- Time -->
          <div class="flex items-center gap-x-1.5">
            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span class="text-[10px] sm:text-xs text-slate-300">{{ selectedCollection.from }} – {{ selectedCollection.to }}</span>
          </div>

          <!-- City -->
          <div class="flex items-center gap-x-1.5">
            <UIcon name="i-lucide-building-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span class="text-[10px] sm:text-xs text-slate-300 truncate">{{ selectedCollection.city?.name }}</span>
          </div>

          <!-- Barangays — full width on mobile -->
          <div class="flex items-center gap-x-1.5 col-span-2 sm:col-span-1">
            <UIcon name="i-lucide-list-checks" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
            <span class="text-[10px] sm:text-xs text-slate-300 truncate">{{ selectedCollection.barangays?.join(', ') }}</span>
          </div>

          <!-- Truck -->
          <div class="flex items-center gap-x-1.5 col-span-2 sm:col-span-1">
            <UIcon name="i-lucide-truck" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
            <span class="text-[10px] sm:text-xs text-slate-300">{{ selectedCollection.truck?.plate_number || 'Unassigned' }}</span>
          </div>
        </div>
      </div>

      <!-- Tracking status bar — only visible when ONGOING -->
      <div
        v-if="selectedCollection.status === 'ONGOING'"
        class="flex  sm:flex-row items-start sm:items-center justify-between gap-2 px-4 sm:px-6 py-2 bg-slate-950/60 border-b border-slate-800/50"
      >
        <div class="flex items-center gap-x-2 w-full">
          <span class="relative flex h-2.5 w-2.5" v-if="isTracking">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span v-else class="inline-flex rounded-full h-2.5 w-2.5 bg-slate-600"></span>
          <span class="text-[10px] sm:text-xs font-medium" :class="isTracking ? 'text-emerald-400' : 'text-slate-500'">
            {{ isTracking ? 'Tracking active — updating every 5s' : 'Tracking inactive' }}
          </span>
        </div>

        <div class="flex items-center gap-x-2 w-full sm:w-auto justify-end sm:justify-end w-full">
          <span v-if="driverLocation" class="text-[10px] text-slate-500 font-mono">
            {{ driverLocation.lat.toFixed(6) }}, {{ driverLocation.lng.toFixed(6) }}
          </span>
        </div>
      </div>

      <!-- Map fills the rest -->
      <div class="flex-1 w-full relative">
        <Map
          ref="mapRef"
          :truck-location="driverLocation"
          :pin-mode="testMode"
          :hide-user-control="true"
          @pin-placed="onPinPlaced"
        />

        <!-- Start Collection floating button — only for PENDING -->
        <Transition name="slide-up">
          <div
            v-if="selectedCollection.status === 'PENDING'"
            class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1002] w-[calc(100%-2rem)] sm:w-auto"
          >
            <UButton
              icon="i-lucide-play-circle"
              label="Start Collection"
              color="primary"
              size="lg"
              class="w-full sm:w-auto justify-center shadow-2xl shadow-emerald-500/20 font-semibold"
              :loading="isStarting"
              @click="handleStartClick"
            />
          </div>
        </Transition>

        <!-- Complete Collection floating button — only for ONGOING -->
        <Transition name="slide-up">
          <div
            v-if="selectedCollection.status === 'ONGOING'"
            class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1002] w-[calc(100%-2rem)] sm:w-auto"
          >
            <UButton
              icon="i-lucide-check-circle"
              label="Complete Collection"
              color="primary"
              size="lg"
              class="w-full sm:w-auto justify-center shadow-2xl shadow-emerald-500/20 font-semibold"
              :loading="isCompleting"
              @click="isCompleteModalOpen = true"
            />
          </div>
        </Transition>

        <!-- GPS error overlay -->
        <Transition name="fade">
          <div
            v-if="geoError"
            class="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[1002] flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-red-950/90 border border-red-500/40 backdrop-blur-md text-red-300 text-[10px] sm:text-xs font-semibold shadow-xl max-w-[calc(100%-2rem)]"
          >
            <UIcon name="i-lucide-map-pin-off" class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ geoError }}</span>
          </div>
        </Transition>
      </div>
    </template>

    <!-- Warning Modal -->
    <UModal v-model:open="isWarningModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-amber-500">
            <UIcon name="i-lucide-alert-triangle" class="w-6 h-6" />
            <h3 class="text-lg font-semibold">Schedule Mismatch</h3>
          </div>
        </template>
        <p class="text-sm text-slate-300">
          The selected collection schedule is not aligned with the current date and time. Are you sure you want to start this collection anyway?
        </p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="soft" @click="isWarningModalOpen = false" :disabled="isStarting">Cancel</UButton>
            <UButton color="amber" :loading="isStarting" @click="proceedStartCollection">Proceed</UButton>
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <!-- Complete Modal -->
    <UModal v-model:open="isCompleteModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-emerald-500">
            <UIcon name="i-lucide-check-circle" class="w-6 h-6" />
            <h3 class="text-lg font-semibold">Complete Collection</h3>
          </div>
        </template>
        <p class="text-sm text-slate-300">
          Are you sure you want to mark this collection as completed? This action cannot be undone and will stop location tracking.
        </p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="soft" @click="isCompleteModalOpen = false" :disabled="isCompleting">Cancel</UButton>
            <UButton color="emerald" :loading="isCompleting" @click="completeCollection">Confirm</UButton>
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <!-- Leave/Switch Warning Modal -->
    <UModal v-model:open="isLeaveModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-amber-500">
            <UIcon name="i-lucide-alert-triangle" class="w-6 h-6" />
            <h3 class="text-lg font-semibold">Ongoing Collection</h3>
          </div>
        </template>
        <p class="text-sm text-slate-300">
          You have an ongoing collection. Are you sure you want to navigate away or switch schedules? Location tracking will stop.
        </p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="soft" @click="cancelLeave">Cancel</UButton>
            <UButton color="amber" @click="confirmLeave">Proceed</UButton>
          </div>
        </template>
      </UCard>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { MapLocation } from '~/components/Map.vue';
import type { Collections } from '~/types/auth.model';

// ---- Stores ----
const globalStore = useGlobalStore();
const { user, selectedCollectionId } = storeToRefs(globalStore);

// ---- Composables ----
const { getCollections, updateCollections } = useCollections();
const toast = useToast();

// ---- Map ref ----
const mapRef = ref<{ panTo: (lat: number, lng: number, zoom?: number) => void } | null>(null);

// ---- State ----
const collections = ref<Collections[]>([]);
const driverLocation = ref<MapLocation | null>(null);
const isTracking = ref(false);
const isStarting = ref(false);
const isCompleting = ref(false);
const isWarningModalOpen = ref(false);
const isCompleteModalOpen = ref(false);
const isLeaveModalOpen = ref(false);
const pendingRoute = ref<any>(null);
const pendingCollectionId = ref<any>(null);
const isConfirmedLeave = ref(false);
const geoError = ref<string | null>(null);
const testMode = ref(false);
const router = useRouter();
let trackingInterval: ReturnType<typeof setInterval> | null = null;

function onPinPlaced(coords: { lat: number; lng: number }) {
  if (testMode.value) {
    driverLocation.value = {
      ...driverLocation.value,
      ...coords,
      ...getDriverLocationMetadata()
    };
  }
}

function isCollectionAligned(collection: Collections) {
  if (!collection.date) return false;
  const colDate = new Date(collection.date);
  const now = new Date();
  
  if (colDate.getFullYear() !== now.getFullYear() ||
      colDate.getMonth() !== now.getMonth() ||
      colDate.getDate() !== now.getDate()) {
    return false;
  }
  
  if (collection.from && collection.to) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const parseTimeString = (t: string) => {
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 0;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    
    const fromMinutes = parseTimeString(collection.from);
    const toMinutes = parseTimeString(collection.to);
    
    if (currentMinutes < fromMinutes || currentMinutes > toMinutes) {
      return false;
    }
  }
  return true;
}

function handleStartClick() {
  if (!selectedCollection.value) return;
  if (!isCollectionAligned(selectedCollection.value)) {
    isWarningModalOpen.value = true;
  } else {
    proceedStartCollection();
  }
}

async function proceedStartCollection() {
  await startCollection();
  isWarningModalOpen.value = false;
}

// ---- Derived ----
const selectedCollection = computed(() =>
  collections.value.find(c => c.id === selectedCollectionId.value) ?? null
);

const collectionOptions = computed(() =>
  collections.value.map(c => ({
    value: c.id,
    label: `${formatDate2(c.date)} — ${c.city?.name ?? 'Unknown city'}`,
    sub: `${c.status} · ${c.barangays?.join(', ') ?? ''} · ${c.from ?? ''} – ${c.to ?? ''}`
  }))
);

function getDriverLocationMetadata() {
  if (!selectedCollection.value) return {};
  return {
    plate_number: selectedCollection.value.truck?.plate_number,
    driver_name: user.value?.name || user.value?.email || 'Driver',
    city_name: selectedCollection.value.city?.name,
    barangays: selectedCollection.value.barangays,
    status: selectedCollection.value.status,
    description: selectedCollection.value.from && selectedCollection.value.to 
      ? `Time: ${selectedCollection.value.from} - ${selectedCollection.value.to}`
      : undefined
  };
}

// ---- Fetch driver's active/ongoing collections ----
async function fetchDriverCollections() {
  try {
    const { data } = await getCollections({
      query: buildQuery({
        paginate: false,
        driver_id: user.value?.id,
        status: ['PENDING', 'ONGOING'],
        includes: 'city:name,truck:plate_number,driver:email'
      })
    });

    collections.value = data;

    const selected = collections.value.find(c => c.id === selectedCollectionId.value);
    if (selected?.status === 'ONGOING') {
      nextTick(() => {
        startTracking();
      });
    }
  } catch (error) {
    console.error('Failed to fetch driver collections:', error);
    toast.add({
      title: 'Failed to load schedules',
      description: 'Could not retrieve your collection schedules.',
      color: 'error',
      icon: 'i-lucide-cloud-off'
    });
  }
}

// ---- Start Collection (PENDING → ONGOING) ----
async function startCollection() {
  if (!selectedCollection.value || selectedCollection.value.status !== 'PENDING') return;

  isStarting.value = true;
  try {
    // Ensure location access is granted before starting
    if (!testMode.value) {
      try {
        await getCurrentPosition();
        geoError.value = null;
      } catch (err: any) {
        geoError.value = err.message || 'Location access is required to start collection.';
        toast.add({
          title: 'Location Required',
          description: 'Please allow location access to start the collection.',
          color: 'error',
          icon: 'i-lucide-map-pin-off'
        });
        return;
      }
    } else {
      geoError.value = null;
      // Default driver location to Manila if testing and no location yet
      if (!driverLocation.value) {
        driverLocation.value = { lat: 14.5995, lng: 120.9842, ...getDriverLocationMetadata() };
      }
    }

    await updateCollections(
      { ...selectedCollection.value, status: 'ONGOING' },
      selectedCollection.value.id
    );

    // Update local state so UI reacts immediately
    const idx = collections.value.findIndex(c => c.id === selectedCollection.value!.id);
    if (idx !== -1) {
      collections.value[idx] = { ...collections.value[idx], status: 'ONGOING' };
    }

    toast.add({
      title: 'Collection started',
      description: 'Status updated to ONGOING. GPS tracking has started.',
      color: 'success',
      icon: 'i-lucide-truck'
    });

    // Auto-start tracking after status change
    startTracking();
  } catch (error) {
    console.error('Failed to start collection:', error);
    toast.add({
      title: 'Failed to start collection',
      description: 'Could not update the collection status. Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle'
    });
  } finally {
    isStarting.value = false;
  }
}

// ---- Complete Collection (ONGOING → COMPLETED) ----
async function completeCollection() {
  if (!selectedCollection.value || selectedCollection.value.status !== 'ONGOING') return;

  isCompleting.value = true;
  try {
    await updateCollections(
      { ...selectedCollection.value, status: 'COMPLETED' },
      selectedCollection.value.id
    );

    // Update local state so UI reacts immediately
    const idx = collections.value.findIndex(c => c.id === selectedCollection.value!.id);
    if (idx !== -1) {
      collections.value[idx] = { ...collections.value[idx], status: 'COMPLETED' };
    }

    toast.add({
      title: 'Collection completed',
      description: 'Status updated to COMPLETED. GPS tracking has stopped.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    });

    stopTracking();
    isCompleteModalOpen.value = false;
  } catch (error) {
    console.error('Failed to complete collection:', error);
    toast.add({
      title: 'Failed to complete collection',
      description: 'Could not update the collection status. Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle'
    });
  } finally {
    isCompleting.value = false;
  }
}

// ---- GPS location tracking ----
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

/**
 * Called every 5 seconds to update the driver's location.
 * This is where you would add the API call to send the location to the backend.
 */
async function updateDriverLocation() {
  try {
    let lat = driverLocation.value?.lat;
    let lng = driverLocation.value?.lng;

    if (!testMode.value) {
      const position = await getCurrentPosition();
      lat = position.coords.latitude;
      lng = position.coords.longitude;
    }
    
    geoError.value = null;

    if (lat !== undefined && lng !== undefined) {
      driverLocation.value = {
        ...driverLocation.value,
        lat: Number(lat),
        lng: Number(lng),
        ...getDriverLocationMetadata()
      };
      
      if (selectedCollectionId.value) {
        await useLocations().updateDriverLocation({
          lat: Number(lat),
          lng: Number(lng),
          driver_id: user.value.id,
          collection_id: selectedCollectionId.value
        });
      }


      console.log(`[Driver Location] ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)} @ ${new Date().toLocaleTimeString()}`);
    }
  } catch (err: any) {
    console.error('Geolocation error:', err);
    geoError.value = err.message || 'Could not get your location.';
  }
}

// ---- Tracking controls ----
function startTracking() {
  if (trackingInterval) return;

  isTracking.value = true;

  // Get initial location immediately
  updateDriverLocation();

  // Then poll every 5 seconds
  trackingInterval = setInterval(updateDriverLocation, 5000);
}

function stopTracking() {
  isTracking.value = false;
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
}

// ---- When a collection is selected, only track if ONGOING ----
function onCollectionSelect() {
  stopTracking();

  const selected = collections.value.find(c => c.id === selectedCollectionId.value);
  if (selected?.status === 'ONGOING') {
    nextTick(() => {
      startTracking();
    });
  }
}

function handleCollectionSelect(newId: any) {
  if (selectedCollectionId.value === newId) return;

  if (selectedCollection.value?.status === 'ONGOING') {
    pendingCollectionId.value = newId;
    isLeaveModalOpen.value = true;
  } else {
    selectedCollectionId.value = newId;
    onCollectionSelect();
  }
}

function cancelLeave() {
  isLeaveModalOpen.value = false;
  pendingRoute.value = null;
  pendingCollectionId.value = null;
}

function confirmLeave() {
  isLeaveModalOpen.value = false;
  if (pendingRoute.value) {
    isConfirmedLeave.value = true;
    const target = pendingRoute.value;
    pendingRoute.value = null;
    router.push(target);
  } else if (pendingCollectionId.value !== null) {
    selectedCollectionId.value = pendingCollectionId.value;
    pendingCollectionId.value = null;
    onCollectionSelect();
  }
}

onBeforeRouteLeave((to, from, next) => {
  if (selectedCollection.value?.status === 'ONGOING' && !isConfirmedLeave.value) {
    pendingRoute.value = to;
    isLeaveModalOpen.value = true;
    next(false);
  } else {
    next();
  }
});

// ---- Pan map when driver location changes ----
watch(driverLocation, (loc) => {
  if (loc && mapRef.value) {
    mapRef.value.panTo(loc.lat, loc.lng, 16);
  }
}, { once: true }); // Only auto-pan on first location fix

// ---- Lifecycle ----
onBeforeMount(async () => {
  await fetchDriverCollections();
});

onBeforeUnmount(() => {
  stopTracking();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 16px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}
</style>