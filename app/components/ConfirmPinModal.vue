<template>
  <UModal
    v-model:open="isOpen"
    :dismissible="false"
    :ui="{
      content: 'sm:max-w-sm mx-4 sm:mx-auto rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl z-[1200]',
      overlay: 'backdrop-blur-sm bg-black/40 z-[1150]'
    }"
  >
    <template #content>
      <div class="p-6 flex flex-col gap-5">

        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-100 text-base leading-tight">Confirm Pin Location</h3>
            <p class="text-xs text-slate-400 mt-0.5">Save this as your location?</p>
          </div>
        </div>

        <!-- Coordinates + label -->
        <div class="bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3 flex flex-col gap-1.5">
          <div class="flex items-center gap-2 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            <span class="font-mono text-sm font-semibold tabular-nums">
              {{ pendingPin ? `${pendingPin.lat.toFixed(5)}, ${pendingPin.lng.toFixed(5)}` : '—' }}
            </span>
          </div>
          <div v-if="selectedLabel" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="text-sm text-blue-300 font-medium truncate">{{ selectedLabel }}</span>
          </div>
        </div>

        <!-- Note -->
        <p class="text-xs text-slate-500 leading-relaxed -mt-1">
          You can drag the pin on the map to adjust before saving.
        </p>

        <!-- Actions -->
        <div class="flex gap-3">
          <UButton
            class="flex-1 justify-center rounded-full"
            color="neutral"
            variant="outline"
            size="md"
            :disabled="isSavingLocation"
            @click="$emit('cancel')"
          >
            Cancel
          </UButton>
          <UButton
            class="flex-1 justify-center rounded-full"
            color="primary"
            variant="solid"
            size="md"
            :loading="isSavingLocation"
            @click="$emit('confirm')"
          >
            Save Location
          </UButton>
        </div>

      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  pendingPin: { lat: number; lng: number } | null
  selectedLabel: string | null
  isSavingLocation: boolean
}>()

defineEmits<{
  cancel: []
  confirm: []
}>()

// Modal opens whenever there's a pending pin
const isOpen = computed(() => !!props.pendingPin)
</script>
