<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-slate-950">
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="grid grid-cols-2 rotate-25 gap-44 blur-xl">
        <div
          v-for="(color, i) in ['emerald', 'amber', 'amber', 'emerald']"
          :key="i"
          class="relative flex h-20 w-20 items-center justify-center sm:h-64 opacity-75`"
          :class="i === 3 ? 'sm:w-32' : 'sm:w-64'"
        >
          <div class="absolute inset-0 rounded-full opacity-25 blur-2xl sm:blur-3xl" :class="`bg-${color}-500`"></div>
          <div
            v-for="j in 2"
            :key="j"
            class="absolute h-8 w-8 rounded-full opacity-30 animate-ping sm:h-24 sm:w-24"
            :class="`bg-${color}-400`"
            :style="{ animationDuration: '6s', animationDelay: `${(i * 0.9 + (j - 1) * 1.5) % 6}s` }"
          ></div>
          <div class="relative h-3 w-3 rounded-full sm:h-8 sm:w-8" :class="`bg-${color}-400/30`"></div>
        </div>
      </div>
    </div>

    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup>
</script>