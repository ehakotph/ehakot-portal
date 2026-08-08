import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {

  async function test() {
    console.log('test :>> ');
  }

  return { test }
})
