<template>
    <div class="relative z-10 bg-slate-950 flex h-screen overflow-x-hidden">
      <aside
        class="h-screen overflow-hidden transition-all duration-300 border-r border-gray-800"
        :class="isOpenSidebar ? 'w-64' : 'w-0'"
      >
      <Sidebar />
      </aside>

      <UButton 
        :icon="isOpenSidebar ? 'i-lucide-circle-chevron-left' : 'i-lucide-circle-chevron-right'"
        @click="isOpenSidebar = !isOpenSidebar" 
        color="neutral"
        class="hover:opacity-100 absolute top-4 transition-all duration-300 z-999 bg-slate-950 border border-gray-800 rounded-s-none border-l-0 text-primary hover:bg-slate-900"
        :class="isOpenSidebar ? 'ml-64' : 'ml-0'"
      />
      <div class="flex flex-col flex-1 min-h-screen max-h-screen h-screen overflow-auto">
        <slot />
      </div>
    </div>
</template>
<script lang="ts" setup>
const globalStore = useGlobalStore();
const { isOpenSidebar } = storeToRefs(globalStore);
</script>