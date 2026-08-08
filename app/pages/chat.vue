<template>
  <div class="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden relative">
    <header class="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl z-20">
      <div class="flex items-center gap-3">
        <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <span class="absolute inline-flex h-full w-full rounded-2xl opacity-30"></span>
          <img src="/icon.png" alt="eHakot Logo" class="w-9 h-7 shrink-0"/>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <h1 class="font-bold text-base text-slate-100">eHakot AI Assistant</h1>
            <UBadge color="success" variant="subtle" size="xs" class="capitalize font-semibold">
              {{currentRole + ' mode'  }}
            </UBadge>
          </div>
          <span class="text-xs text-slate-400">
            {{ lang === 'en' ? 'Powered by Gemini AI • Waste Management Companion' : 'Pinapagana ng Gemini AI • Kasama sa Pamamahala ng Basura' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <div class="flex items-center p-0.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
          <button
            type="button"
            class="px-2.5 py-1 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer"
            :class="lang === 'en' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'"
            @click="lang = 'en'"
          >
            ENG
          </button>
          <button
            type="button"
            class="px-2.5 py-1 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer"
            :class="lang === 'fil' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'"
            @click="lang = 'fil'"
          >
            FIL
          </button>
        </div>

        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          class="text-slate-400 hover:text-red-400 cursor-pointer"
          :title="lang === 'en' ? 'Clear Chat History' : 'Burahin ang Kasaysayan ng Chat'"
          @click="clearHistory"
        >
          {{ lang === 'en' ? 'Clear' : 'Burahin' }}
        </UButton>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto" ref="chatContainerRef">

      <div v-if="messages.length === 0" class="my-auto py-8 px-6 space-y-6 max-w-2xl mx-auto text-center">
        <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div class="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-blue-500/30 blur-xl animate-pulse"></div>
          <div class="absolute inset-2 rounded-3xl bg-emerald-500/30 animate-ping"></div>
          <div class="relative w-16 h-16 rounded-3xl bg-slate-900/90 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20 backdrop-blur-xl">
            <img src="/icon.png" alt="eHakot Logo" class="w-12 h-10 shrink-0"/>
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-extrabold text-white tracking-tight">
            {{ lang === 'en' ? 'Ask eHakot AI anything' : 'Magtanong kay eHakot AI' }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {{ lang === 'en'
              ? 'Get instant answers about collection schedules, garbage reports, recycling guidelines, or city routes.'
              : 'Kumuha ng mabilis na sagot tungkol sa iskedyul ng koleksyon, ulat ng basura, gabay sa pagreresiklo, o ruta ng koleksyon.'
            }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          <button
            v-for="(prompt, idx) in suggestedPrompts"
            :key="idx"
            type="button"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-200 hover:text-white backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer group active:scale-98"
            @click="sendMessage(prompt.query)"
          >
            <div class="flex items-center gap-2.5 min-w-0 pr-2">
              <div class="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5" />
              </div>
              <span class="font-medium text-slate-200 group-hover:text-white truncate">{{ prompt.label }}</span>
            </div>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        </div>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex gap-3 text-sm transition-all duration-200"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          v-if="msg.role === 'assistant'"
          class="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex-shrink-0 mt-0.5"
        >
          <img src="/icon.png" alt="eHakot Logo" class="w-6 h-5 shrink-0"/>
        </div>

        <div
          class="max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-xl leading-relaxed whitespace-pre-wrap"
          :class="[
            msg.role === 'user'
              ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/40'
              : 'bg-slate-900/90 text-slate-200 rounded-tl-sm border border-slate-800/90 backdrop-blur-md'
          ]"
        >
          {{ msg.content }}
        </div>

        <div
          v-if="msg.role === 'user'"
          class="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex-shrink-0 mt-0.5"
        >
          <UIcon name="i-lucide-user" class="w-4 h-4" />
        </div>
      </div>

      <div v-if="isSending" class="flex gap-3 justify-start items-center">
        <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
          <img src="/icon.png" alt="eHakot Logo" class="w-6 h-5 shrink-0"/>
        </div>
        <div class="p-3.5 rounded-3xl rounded-tl-sm bg-slate-900/80 border border-slate-800/80 text-slate-400 text-xs flex items-center gap-2 backdrop-blur-md">
          <span class="inline-flex gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
          </span>
          {{ lang === 'en' ? 'eHakot AI is thinking...' : 'Nag-iisip ang eHakot AI...' }}
        </div>
      </div>
    </main>

    <footer class="p-4 bg-slate-900/80 border-t border-slate-800/80 backdrop-blur-xl z-20">
      <form class="max-w-4xl mx-auto" @submit.prevent="handleSend">
        <UInput
          v-model="inputMessage"
          icon="i-lucide-bot"
          :placeholder="lang === 'en' ? 'Ask eHakot AI anything about garbage schedules, reports, or recycling...' : 'Magtanong sa eHakot AI tungkol sa iskedyul, ulat, o pagreresiklo...'"
          size="xl"
          class="w-full"
          :disabled="isSending"
          :ui="{ base: '!rounded-full bg-slate-950/80 text-slate-100 border-slate-700/60 focus:border-emerald-500 pr-12' }"
          @keydown.enter.prevent="handleSend"
        >
          <template #trailing>
            <UButton
              type="submit"
              color="success"
              variant="solid"
              size="xs"
              icon="i-lucide-send"
              :loading="isSending"
              :disabled="!inputMessage.trim() || isSending"
              class="-mr-1.5 w-8 h-8 rounded-full flex items-center justify-center p-0 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
            />
          </template>
        </UInput>
      </form>
    </footer>
  </div>
</template>

<script lang="ts" setup>
const globalStore = useGlobalStore()
const authStore = useAuthStore()

const lang = ref<'en' | 'fil'>('en')

const { messages, inputMessage, isSending, sendMessage, clearHistory } = useChat()

const chatContainerRef = ref<HTMLElement | null>(null)

const currentRole = computed(() => {
  if (globalStore.user?.role) return globalStore.user.role
  if (authStore.user?.role) return authStore.user.role
  return 'guest'
})

const suggestedPrompts = computed(() => {
  const role = currentRole.value
  const isFil = lang.value === 'fil'

  if (role === 'admin' || role === 'superadmin') {
    return isFil
      ? [
          { label: 'Buod ng Koleksyon sa Lungsod', query: 'Bigyan ako ng buod ng kabuuang koleksyon at ulat sa aking nakatalagang lungsod.' },
          { label: 'Katayuan ng mga Koleksyon', query: 'Ano-ano ang mga nakabinbin at kasalukuyang ruta ng koleksyon?' },
          { label: 'Aktibong Ulat ng Basura', query: 'Ilang aktibong ulat ng basura ang naisumite?' },
          { label: 'Sakop ng Tsuper at Trak', query: 'Ilang aktibong tsuper at trak ang kasalukuyang nakatalaga?' }
        ]
      : [
          { label: 'City Collections Summary', query: 'Give me a summary of total collections and reports in my assigned city.' },
          { label: 'Pending Collections Status', query: 'What are the pending and ongoing collection routes?' },
          { label: 'Active Garbage Reports', query: 'How many active garbage reports are reported?' },
          { label: 'Driver & Truck Coverage', query: 'How many active drivers and trucks are currently assigned?' }
        ]
  }
  if (role === 'driver') {
    return isFil
      ? [
          { label: 'Aking mga Nakatalagang Ruta', query: 'Ano-ano ang aking mga nakatalagang ruta ng koleksyon at sakop na barangay?' },
          { label: 'Iskedyul ng Ruta Ngayong Araw', query: 'Ipakita ang mga detalye ng iskedyul para sa aking mga koleksyon ngayong araw.' },
          { label: 'Mga Lugar ng Basura', query: 'Mayroon bang mga naiulat na basura sa aking ruta?' },
          { label: 'Pag-update ng Status ng Hakot', query: 'Paano ko mamarkahan ang mga koleksyon o ulat bilang nahakot na?' }
        ]
      : [
          { label: 'My Assigned Routes', query: 'What are my assigned collection routes and covered barangays?' },
          { label: 'Route Schedule Today', query: 'Show me the schedule details for my collections today.' },
          { label: 'Uncollected Trash Areas', query: 'Are there any flagged garbage reports along my route?' },
          { label: 'How to update pickup status', query: 'How do I mark collections or reports as collected?' }
        ]
  }
  return isFil
    ? [
        { label: 'Susunod na Iskedyul ng Hakot', query: 'Kailan ang susunod na nakaiskedyul na hakot ng basura sa aming barangay?' },
        { label: 'Mag-ulat ng Basura', query: 'Paano ko irereport ang aking basura na handa nang hakutin?' },
        { label: 'Gabay sa Pagreresiklo', query: 'Ano-anong uri ng basura ang nabubulok at pwede pang i-resiklo?' },
        { label: 'Trak ng Basura sa Malapit', query: 'Paano ko malalaman kung malapit na ang trak ng basura sa aming lugar?' }
      ]
    : [
        { label: 'Next Collection Schedule', query: 'When is the next waste collection scheduled for my barangay?' },
        { label: 'Report Uncollected Trash', query: 'How do I flag my trash as ready for pickup?' },
        { label: 'Segregation & Recycling Guide', query: 'What types of waste are recyclable vs biodegradable?' },
        { label: 'Contacting My Local Driver', query: 'How can I check if the garbage truck is near my area?' }
      ]
})

function handleSend() {
  if (inputMessage.value.trim() && !isSending.value) {
    sendMessage()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}

const isAllowedRole = computed(() => {
  const role = currentRole.value
  return role === 'user' || role === 'admin' || role === 'superadmin'
})

onMounted(() => {
  if (!isAllowedRole.value) {
    navigateTo('/')
  }
})

watch(currentRole, (newRole) => {
  if (newRole === 'driver' || newRole === 'guest') {
    navigateTo('/')
  }
})

watch(messages, () => {
  scrollToBottom()
}, { deep: true, immediate: true })
</script>
