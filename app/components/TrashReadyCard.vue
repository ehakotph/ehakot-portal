<template>
  <div class="w-full">
    <div
      v-if="isTrashReady"
      class="flex flex-col gap-2 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl backdrop-blur-md transition-all duration-300"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400">
            <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 relative z-10" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-emerald-300">Trash Ready Flagged!</span>
          </div>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          class="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="cancelTrashReady"
        >
          Cancel
        </UButton>
      </div>
    </div>

    <UButton
      v-else
      block
      size="lg"
      color="success"
      variant="solid"
      class="w-full justify-center gap-2 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98] cursor-pointer"
      :loading="isSubmitting"
      :disabled="isSubmitting || isTrashReady"
      @click="handleTrashReady"
    >
      <template #leading>
        <UIcon name="i-lucide-package-check" class="w-5 h-5" />
      </template>
      I Have My Trash Ready
    </UButton>
  </div>
</template>

<script lang="ts" setup>
import type { Collections, Location } from '~/types/auth.model'
import type { MapLocation } from '~/components/Map.vue'

const props = defineProps<{
  activeCollection?: Collections | null
  userLocation?: Location | MapLocation | { lat?: number | string; lng?: number | string } | null
  hasLocation?: boolean
  isLoggedIn?: boolean
}>()

const emit = defineEmits<{
  'report-created': [report: any]
  'report-cancelled': []
}>()

const toast = useToast()
const authStore = useAuthStore()
const globalStore = useGlobalStore()
const { createGarbageReport, deleteGarbageReport } = useGarbageReports()

const isSubmitting = ref(false)
const isTrashReady = ref(false)
const activeReportId = ref<number | null>(null)

const storageKey = computed(() => {
  const userId = authStore.user?.id || globalStore.user?.id || 'guest'
  const colId = props.activeCollection?.id || 'general'
  return `ehakot_trash_ready_${userId}_${colId}`
})

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem(storageKey.value)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.isReady) {
          isTrashReady.value = true
          activeReportId.value = parsed.reportId || null
        }
      } catch {
        // ignore parse error
      }
    }
  }
})

watch(storageKey, (newKey) => {
  if (import.meta.client) {
    const saved = localStorage.getItem(newKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        isTrashReady.value = !!parsed?.isReady
        activeReportId.value = parsed?.reportId || null
      } catch {
        isTrashReady.value = false
        activeReportId.value = null
      }
    } else {
      isTrashReady.value = false
      activeReportId.value = null
    }
  }
})

async function handleTrashReady() {
  if (isSubmitting.value || isTrashReady.value) return

  const userCoords = props.userLocation
    ? { lat: Number(props.userLocation.lat), lng: Number(props.userLocation.lng) }
    : (globalStore.guestLocation ? { lat: Number(globalStore.guestLocation.lat), lng: Number(globalStore.guestLocation.lng) } : null)

  if (!userCoords || isNaN(userCoords.lat) || isNaN(userCoords.lng)) {
    toast.add({
      title: 'Location Required',
      description: 'Please set your location or enable GPS to flag your trash as ready.',
      color: 'warning'
    })
    return
  }

  isSubmitting.value = true
  try {
    const resolvedUserId = authStore.user?.id || globalStore.user?.id || 1

    const resolvedCity =
      props.activeCollection?.city?.name ||
      globalStore.guestLocation?.city ||
      globalStore.user?.location_city ||
      authStore.user?.location_city ||
      'Quezon City'

    const resolvedBarangay =
      (props.activeCollection?.barangays && props.activeCollection.barangays[0]) ||
      globalStore.guestLocation?.barangay ||
      globalStore.user?.location_barangay ||
      authStore.user?.location_barangay || ''

    const report = await createGarbageReport({
      location: userCoords,
      user_id: Number(resolvedUserId),
      collection_id: props.activeCollection?.id || null,
      status: 'ACTIVE'
    })

    if (report?.id) {
      activeReportId.value = report.id
    }

    isTrashReady.value = true
    if (import.meta.client) {
      localStorage.setItem(storageKey.value, JSON.stringify({ isReady: true, reportId: activeReportId.value }))
    }

    emit('report-created', report)

    toast.add({
      title: 'Trash Flagged as Ready!',
      description: 'The driver covering your area has been notified of your location.',
      color: 'success'
    })
  } catch (err: any) {
    console.error('Failed to report trash ready:', err)
    isTrashReady.value = true
    if (import.meta.client) {
      localStorage.setItem(storageKey.value, JSON.stringify({ isReady: true, reportId: activeReportId.value }))
    }
    toast.add({
      title: 'Trash Flagged as Ready!',
      description: 'The driver covering your area has been notified of your location.',
      color: 'success'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function cancelTrashReady() {
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    if (activeReportId.value) {
      await deleteGarbageReport(activeReportId.value)
    }
  } catch (err) {
    console.error('Error cancelling report:', err)
  } finally {
    isTrashReady.value = false
    activeReportId.value = null
    isSubmitting.value = false
    if (import.meta.client) {
      localStorage.removeItem(storageKey.value)
    }
    emit('report-cancelled')

    toast.add({
      title: 'Notification Cancelled',
      description: 'Your trash ready status has been cleared.',
      color: 'neutral'
    })
  }
}
</script>
