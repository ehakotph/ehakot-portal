export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const useChat = () => {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()
  const globalStore = useGlobalStore()
  const toast = useToast()

  const messages = ref<ChatMessage[]>([])
  const inputMessage = ref('')
  const isSending = ref(false)

  const sendMessage = async (customText?: string) => {
    const textToSend = (customText ?? inputMessage.value).trim()
    if (!textToSend || isSending.value) return

    messages.value.push({ role: 'user', content: textToSend })
    if (!customText) {
      inputMessage.value = ''
    }

    isSending.value = true

    try {
      if (!authStore.token && globalStore.user?.email && globalStore.user?.birthdate) {
        try {
          const userEmail = globalStore.user.email
          const userBirthdate = globalStore.user.birthdate
          if (userEmail && userBirthdate) {
            const bdateStr = new Date(userBirthdate).toISOString().split('T')[0]!
            await authStore.birthdateLogin(userEmail, bdateStr)
          }
        } catch (authErr) {
          console.warn('Auto-login attempt prior to chat failed:', authErr)
        }
      }

      const api = $api()
      const response: { text: string } = await api('/chat', {
        method: 'POST',
        body: {
          messages: messages.value.map((m) => ({
            role: m.role,
            content: m.content
          }))
        }
      })

      const replyText = response?.text || 'I apologize, but I could not process your request at this moment.'
      messages.value.push({ role: 'assistant', content: replyText })
    } catch (error: any) {
      console.error('Failed to send chat message:', error)
      toast.add({
        title: 'Chat Assistant Error',
        description: error?.data?.message || 'Failed to send message to eHakot AI. Please try again.',
        color: 'error'
      })
      messages.value.push({
        role: 'assistant',
        content: 'Sorry, I ran into a connection error. Please make sure you are logged in and try again.'
      })
    } finally {
      isSending.value = false
    }
  }

  const clearHistory = () => {
    messages.value = []
  }

  return {
    messages,
    inputMessage,
    isSending,
    sendMessage,
    clearHistory
  }
}
