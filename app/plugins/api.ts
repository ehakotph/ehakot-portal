import useCustomFetch from '~/composables/useCustomFetch'
import type { FetchOptions } from 'ofetch';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const createCustomFetch = useCustomFetch()

  // Clean up base URL from public runtime configuration
  const apiUrl = ((config.public.baseURL as string) || '').trim()
  const baseURL = apiUrl.replace(/\/+$/, '')

  // Instantiate targeted service fetch clients with appropriate subpaths
  const apiBase = createCustomFetch(`${baseURL}`)
  const api = (version: string = 'v1') => createCustomFetch(`${baseURL}/${version}`)

  return {
    provide: {
      apiBase,
      api
    }
  }
})
