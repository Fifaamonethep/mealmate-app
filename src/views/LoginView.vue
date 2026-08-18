<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 card p-8 animate-scale-in">
      
      <div class="text-center" data-aos="fade-down">
        <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 animate-float overflow-hidden border border-gray-100 dark:border-gray-800 p-1">
          <img src="@/assets/mealmate_logo.png" alt="MealMate Logo" class="w-full h-full object-cover rounded-xl" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">{{ $t('auth.welcome') }}</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('auth.signInSubtitle') }}</p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 animate-slide-down">
        {{ errorMsg }}
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin" data-aos="fade-up" data-aos-delay="100">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.email') }}</label>
            <input v-model="email" type="email" required class="input-field">
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">{{ $t('auth.password') }}</label>
              <button type="button" @click="handleForgotPassword" class="text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors active:scale-95">Forgot Password?</button>
            </div>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" required class="input-field pr-12">
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="btn-primary w-full flex justify-center items-center">
            <Loader2 v-if="isLoading" class="w-5 h-5 mr-2 animate-spin" />
            <LogIn v-else class="w-5 h-5 mr-2" />
            {{ isLoading ? $t('auth.signingIn') : $t('auth.signIn') }}
          </button>
        </div>
      </form>

      <div class="mt-6" data-aos="fade-up" data-aos-delay="200">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white/70 dark:bg-gray-800/70 text-gray-500 rounded-full">{{ $t('auth.orContinueWith') }}</span>
          </div>
        </div>

        <div class="mt-6">
          <button @click="handleGoogle" type="button" class="btn-secondary w-full flex justify-center items-center">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Google
          </button>
        </div>
      </div>

      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400" data-aos="fade-up" data-aos-delay="300">
        {{ $t('auth.noAccount') }}
        <router-link to="/signup" class="font-bold text-primary-600 hover:text-primary-500 transition-colors">{{ $t('auth.signUp') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authStore.loginWithPassword(email.value, password.value)
    router.push('/')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleGoogle = async () => {
  try {
    await authStore.loginWithGoogle()
  } catch (error) {
    errorMsg.value = error.message
  }
}

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMsg.value = t('auth.enterEmailReset')
    return
  }
  try {
    await authStore.resetPassword(email.value)
    alert(t('auth.resetEmailSent'))
  } catch (error) {
    errorMsg.value = error.message
  }
}
</script>
