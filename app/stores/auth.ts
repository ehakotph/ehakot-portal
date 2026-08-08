import type { LoginResponse, User } from '~/types/auth.model'

export const useAuthStore = defineStore('auth', () => {
  const globalStore = useGlobalStore();
  const { user: globalUser } = storeToRefs(globalStore);
  const token = ref<string | null>(null)
  const user = ref<Partial<User> | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isGuest = computed(() => !token.value)

  //@ts-ignore
  async function birthdateLogin(email: string, birthdate: string) {
    const { $api } = useNuxtApp()

    const response: LoginResponse = await $api()('/auth/birthdate-login', {
      method: 'POST',
      body: {
        email,
        birthdate
      }
    })

    token.value = response.token
    user.value = response.user
    globalUser.value = response.user as User
  }

  async function login(email: string, password: string) {
    const { $api } = useNuxtApp()

    const response: LoginResponse = await $api()('/auth/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    })

    token.value = response.token
    user.value = response.user
    globalUser.value = response.user as User
  }

  async function getCurrentUser() {
    if (!token.value) return

    const { $api } = useNuxtApp()

    const response: LoginResponse = await $api()('/auth/user', {
      method: 'GET'
    })

    user.value = response.user
  }


  async function register(email: string, birthdate: string) {
    const { $api } = useNuxtApp()

    const response: LoginResponse = await $api()('/auth/register', {
      method: 'POST',
      body: {
        email,
        birthdate
      }
    })

    token.value = response.token
    user.value = response.user
    globalUser.value = response.user as User
  }

  function logout() {
    token.value = null
    user.value = null
    globalUser.value = null
    useRouter().push('/sign-in')
  }

  return {
    token,
    user,
    isLoggedIn,
    isGuest,
    birthdateLogin,
    login,
    register,
    getCurrentUser,
    logout
  }
})
