/**
 * Creates custom HTTP client builders pre-configured with interceptors.
 * @returns {Function} Factory function accepting a baseURL and returning a custom $fetch client instance
 */
export default function useCustomFetch() {
  const authStore = useAuthStore()
  const route = useRoute()

  return (baseURL: string) => {
    return $fetch.create({
      baseURL,
      credentials: 'include',
      // Intercept outgoing requests to inject active authorization tokens and SSR request headers
      async onRequest({ options }) {
        // If rendering on server (Nuxt SSR), forward request cookies to the upstream services
        if (import.meta.server) {
          const reqHeaders = useRequestHeaders(['cookie'])
          options.headers = { ...(options.headers as Headers), ...reqHeaders }
        }

        const token = authStore.token
        const headers = new Headers(options.headers)

        // If a client JWT auth token is resolved, attach it as a Bearer authorization header
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }

        options.headers = headers
      },
      // Centralized response error handling
      async onResponseError({ response }) {
        if (response.status === 401) {
          // Automatically clear active sessions and redirect user to home on unauthenticated responses
          if (route.path !== '/sign-in' && authStore.token !== null) {
            console.warn('Unauthorized (401) detected. Logging out...')
            authStore.logout()
            navigateTo('/sign-in')
          }
        }
      }
    })
  }
}
