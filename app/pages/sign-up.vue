<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full px-4 py-10 sm:px-6">
    <div class="w-full max-w-md">
      <h1 class="font-bold text-3xl sm:text-4xl md:text-5xl text-center mb-6 sm:mb-8">
        Register Account for E-Hakot
      </h1>

      <UForm :state="signUpForm" class="space-y-4" @submit="onSignUpSubmit">
        <UFormField label="Email" name="email">
          <UInput v-model="signUpForm.email" type="email" placeholder="you@example.com" class="w-full" />
        </UFormField>

        <UFormField label="Birthday" name="birthday">
          <UInput v-model="signUpForm.birthday" type="date" class="w-full" />
        </UFormField>

        <UButton type="submit" label="Register" block />
      </UForm>

      <div class="flex flex-wrap gap-x-1 items-center justify-center mt-6 text-sm sm:text-base text-center">
        Already have an account?
        <UButton label="Sign-In" variant="link" @click="useRouter().push('/sign-in')" />
        or
        <UButton label="Continue as Guest" variant="link" @click="useRouter().push('/')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'auth' })

const signUpForm = reactive({
  email: '',
  birthday: ''
})

const onSignUpSubmit = async() => {
  try {
    await useAuthStore().register(signUpForm.email, signUpForm.birthday)

    navigateTo('/')
  } catch (error) {
    console.error('Birthdate sign up failed:', error)
  }
}
</script>