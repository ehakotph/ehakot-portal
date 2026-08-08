<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/icon.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'E-Hakot'
const description = 'Smart Garbage Collection Monitoring System'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :toaster="{ class: 'z-[99999] !z-[99999]' }">
    <NuxtLayout>
      <UMain class="h-full w-full">
        <NuxtPage />
      </UMain>
    </NuxtLayout>
  </UApp>
</template>
