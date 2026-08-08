<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full px-4 py-10 sm:px-6">
    <div class="w-full max-w-md">
      <h1 class="font-bold text-3xl sm:text-4xl md:text-5xl text-center mb-6 sm:mb-8">
        Sign-In to E-Hakot
      </h1>

      <UTabs :items="tabs" class="w-full">
        <template #user>
          <UForm :state="userForm" class="space-y-4 mt-4" @submit="onUserSubmit">
            <UFormField label="Email" name="email">
              <UInput v-model="userForm.email" type="email" placeholder="you@example.com" class="w-full" />
            </UFormField>

            <UFormField label="Birthday" name="birthday">
              <UInput v-model="userForm.birthday" type="date" class="w-full" />
            </UFormField>

            <UButton type="submit" label="Sign In" block />
          </UForm>
        </template>

        <template #admin>
          <UForm :state="adminForm" class="space-y-4 mt-4" @submit="onAdminSubmit">
            <UFormField label="Email" name="email">
              <UInput v-model="adminForm.email" type="email" placeholder="admin@example.com" class="w-full" />
            </UFormField>

            <UFormField label="Password" name="password">
              <UInput v-model="adminForm.password" type="password" placeholder="••••••••" class="w-full" />
            </UFormField>

            <UButton type="submit" label="Sign In as Admin" block />
          </UForm>
        </template>
      </UTabs>

      <div class="flex flex-wrap gap-x-1 items-center justify-center mt-6 text-sm sm:text-base text-center">
        Don't have an account?
        <UButton label="Register" variant="link" @click="useRouter().push('/sign-up')" />
        or
        <UButton label="Continue as Guest" variant="link" @click="useRouter().push('/')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'auth' })

const tabs = [
  { label: 'User', slot: 'user' as const },
  { label: 'Admin', slot: 'admin' as const }
]

const userForm = reactive({
  email: '',
  birthday: ''
})

const adminForm = reactive({
  email: '',
  password: ''
})

const authStore = useAuthStore()

async function onUserSubmit() {
  try {
    await authStore.birthdateLogin(userForm.email, userForm.birthday)

    navigateTo('/')
  } catch (error) {
    console.error('Birthdate login failed:', error)
  }
}

async function onAdminSubmit() {
  try {
    await authStore.login(adminForm.email, adminForm.password)

    navigateTo('/')
  } catch (error) {
    console.error('Birthdate login failed:', error)
  }
}
</script>
