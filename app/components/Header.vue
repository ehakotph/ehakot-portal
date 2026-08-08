<template>
    <div class="flex items-center justify-between gap-x-4 p-5 px-8 ml-2 relative z-[998]">
      <slot />
  </div>
</template>

<script lang="ts" setup>
const globalStore = useGlobalStore()
</script>   