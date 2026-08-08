<template>
  <div class="flex justify-center items-center h-screen w-screen">
    Welcome to EHakot!
  </div>
</template>

<script lang="ts" setup>
const globalStore = useGlobalStore()
const { isLoading } = storeToRefs(globalStore);
</script>