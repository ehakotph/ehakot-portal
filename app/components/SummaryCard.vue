<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  valueColor?: string
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  valueColor: 'text-highlighted',
})

const formattedValue = computed(() => {
  return typeof props.value === 'number'
    ? props.value.toLocaleString()
    : props.value
})
</script>

<template>
  <div
    class="rounded-lg border border-slate-900 bg-slate-900/80 p-5 shadow-sm transition-all duration-200"
    :class="{
      'cursor-pointer hover:border-primary hover:shadow-md': props.onClick,
    }"
    @click="props.onClick?.()"
  >
    <p class="text-sm text-muted">
      {{ title }}
    </p>

    <h2
      class="mt-2 text-3xl font-bold w-full text-center"
      :class="props.valueColor"
    >
      {{ formattedValue }}
    </h2>
  </div>
</template>