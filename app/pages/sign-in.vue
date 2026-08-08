<template>
  <div class="signin-page flex flex-col items-center justify-center min-h-screen w-full px-4 py-10 sm:px-6">
    <!-- Glassmorphic Card -->
    <div class="signin-card w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <!-- Logo & Branding -->
      <div class="flex flex-col items-center mb-6">
        <!-- <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/20"> -->
          <img src="/icon.png" alt="E-Hakot" class="w-28 object-contain" />
        <!-- </div> -->
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p class="mt-1.5 text-sm text-slate-400">
          Sign in to your E-Hakot account
        </p>
      </div>

      <!-- Gradient Accent Line -->
      <div class="mb-6 h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      <!-- Tabs -->
      <UTabs :items="tabs" class="w-full" :ui="{
        list: 'rounded-2xl',
        indicator: 'rounded-2xl'
      }">
        <template #user>
          <UForm :state="userForm" class="space-y-5 mt-5" @submit="onUserSubmit">
            <UFormField label="Email" name="email">
              <UInput
                v-model="userForm.email"
                type="email"
                placeholder="you@example.com"
                icon="i-lucide-mail"
                class="w-full"
                size="lg"
              />
            </UFormField>

            <UFormField label="Birthday" name="birthday">
              <UInput
                v-model="userForm.birthday"
                type="date"
                icon="i-lucide-calendar"
                class="w-full"
                size="lg"
              />
            </UFormField>

            <UButton
              type="submit"
              label="Sign In"
              icon="i-lucide-log-in"
              size="lg"
              block
              :loading="loadingUser"
              class="mt-2 rounded-full py-2.5"
            />
          </UForm>
        </template>

        <template #admin>
          <UForm :state="adminForm" class="space-y-5 mt-5" @submit="onAdminSubmit">
            <UFormField label="Email" name="email">
              <UInput
                v-model="adminForm.email"
                type="email"
                placeholder="admin@example.com"
                icon="i-lucide-mail"
                class="w-full"
                size="lg"
              />
            </UFormField>

            <UFormField label="Password" name="password">
              <UInput
                v-model="adminForm.password"
                type="password"
                placeholder="••••••••"
                icon="i-lucide-lock"
                class="w-full"
                size="lg"
              />
            </UFormField>

            <UButton
              type="submit"
              label="Sign In as Employee"
              icon="i-lucide-shield-check"
              size="lg"
              block
              :loading="loadingAdmin"
              class="mt-2 rounded-full py-2.5"
            />
          </UForm>
        </template>
      </UTabs>

      <!-- Footer Links -->
      <div class="mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />
      <div class="flex flex-wrap gap-x-1 items-center justify-center mt-4 text-sm text-slate-400 text-center">
        Don't have an account?
        <UButton label="Register" variant="link" @click="useRouter().push('/sign-up')" />
        or
        <UButton label="Continue as Guest" variant="link" @click="useRouter().push('/')" />
      </div>
    </div>

    <!-- Footer Attribution -->
    <p class="mt-6 text-xs text-slate-500/60">
      &copy; {{ new Date().getFullYear() }} E-Hakot &middot; Smart Garbage Collection
    </p>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'auth' })

const tabs = [
  { label: 'User', icon: 'i-lucide-user', slot: 'user' as const },
  { label: 'Employee', icon: 'i-lucide-briefcase', slot: 'admin' as const }
]

const userForm = reactive({
  email: '',
  birthday: ''
})

const adminForm = reactive({
  email: '',
  password: ''
})

const loadingUser = ref(false)
const loadingAdmin = ref(false)

const authStore = useAuthStore()

async function onUserSubmit() {
  loadingUser.value = true
  try {
    await authStore.birthdateLogin(userForm.email, userForm.birthday)

    navigateTo('/')
  } catch (error) {
    console.error('Birthdate login failed:', error)
  } finally {
    loadingUser.value = false
  }
}

async function onAdminSubmit() {
  loadingAdmin.value = true
  try {
    await authStore.login(adminForm.email, adminForm.password)

    navigateTo('/')
  } catch (error) {
    console.error('Birthdate login failed:', error)
  } finally {
    loadingAdmin.value = false
  }
}
</script>

<style scoped>
.signin-page {
  animation: fadeIn 0.6s ease-out;
}

.signin-card {
  animation: slideUp 0.5s ease-out;
  transition: box-shadow 0.3s ease;
}

.signin-card:hover {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 40px -8px rgba(16, 185, 129, 0.08);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
