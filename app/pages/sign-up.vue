<template>
  <div class="signup-page flex flex-col items-center justify-center min-h-screen w-full px-4 py-10 sm:px-6">
    <!-- Glassmorphic Card -->
    <div class="signup-card w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <!-- Logo & Branding -->
      <div class="flex flex-col items-center mb-6">
        <img src="/icon.png" alt="E-Hakot" class="w-28 object-contain" />
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Create an account
        </h1>
        <p class="mt-1.5 text-sm text-slate-400">
          Register to start using E-Hakot
        </p>
      </div>

      <!-- Gradient Accent Line -->
      <div class="mb-6 h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      <!-- Registration Form -->
      <UForm :state="signUpForm" class="space-y-5" @submit="onSignUpSubmit">
        <UFormField label="Email" name="email">
          <UInput
            v-model="signUpForm.email"
            type="email"
            placeholder="you@example.com"
            icon="i-lucide-mail"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Birthday" name="birthday">
          <UInput
            v-model="signUpForm.birthday"
            type="date"
            icon="i-lucide-calendar"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UButton
          type="submit"
          label="Register"
          icon="i-lucide-user-plus"
          size="lg"
          block
          :loading="loading"
          class="mt-2"
        />
      </UForm>

      <!-- Footer Links -->
      <div class="mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />
      <div class="flex flex-wrap gap-x-1 items-center justify-center mt-4 text-sm text-slate-400 text-center">
        Already have an account?
        <UButton label="Sign-In" variant="link" @click="useRouter().push('/sign-in')" />
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

const signUpForm = reactive({
  email: '',
  birthday: ''
})

const loading = ref(false)

const onSignUpSubmit = async () => {
  loading.value = true
  try {
    await useAuthStore().register(signUpForm.email, signUpForm.birthday)

    navigateTo('/')
  } catch (error) {
    console.error('Birthdate sign up failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-page {
  animation: fadeIn 0.6s ease-out;
}

.signup-card {
  animation: slideUp 0.5s ease-out;
  transition: box-shadow 0.3s ease;
}

.signup-card:hover {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 40px -8px rgba(16, 185, 129, 0.08);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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