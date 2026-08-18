<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 card p-8 animate-scale-in">
      
      <div class="text-center" data-aos="fade-down">
        <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 animate-float overflow-hidden border border-gray-100 dark:border-gray-800 p-1">
          <img src="@/assets/mealmate_logo.png" alt="MealMate Logo" class="w-full h-full object-cover rounded-xl" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">{{ $t('auth.createAccount') }}</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('auth.createSubtitle') }}</p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 animate-slide-down">
        {{ errorMsg }}
      </div>
      
      <div v-if="successMsg" class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800 animate-slide-down">
        {{ successMsg }}
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSignup" data-aos="fade-up" data-aos-delay="100">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.fullName') }}</label>
            <input v-model="fullName" type="text" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.email') }}</label>
            <input v-model="email" type="email" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.password') }}</label>
            <input v-model="password" type="password" required class="input-field">
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="btn-primary w-full flex justify-center items-center">
            <Loader2 v-if="isLoading" class="w-5 h-5 mr-2 animate-spin" />
            <UserPlus v-else class="w-5 h-5 mr-2" />
            {{ isLoading ? $t('auth.creatingAccount') : $t('auth.signUp') }}
          </button>
        </div>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400" data-aos="fade-up" data-aos-delay="200">
        {{ $t('auth.hasAccount') }}
        <router-link to="/login" class="font-bold text-primary-600 hover:text-primary-500 transition-colors">{{ $t('auth.signIn2') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { Utensils, UserPlus, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSignup = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await authStore.signUp(email.value, password.value, fullName.value)
    successMsg.value = 'Registration successful! Redirecting...'
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>
