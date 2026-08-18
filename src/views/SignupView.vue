<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-8 rounded-[2rem] shadow-2xl">
      
      <div class="text-center">
        <Utensils class="mx-auto h-12 w-12 text-primary-500" />
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Join MealMate and split bills easily</p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium border border-red-200">
        {{ errorMsg }}
      </div>
      
      <div v-if="successMsg" class="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-medium border border-green-200">
        {{ successMsg }}
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input v-model="fullName" type="text" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input v-model="email" type="email" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input v-model="password" type="password" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white">
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            <Loader2 v-if="isLoading" class="w-5 h-5 mr-2 animate-spin" />
            <UserPlus v-else class="w-5 h-5 mr-2" />
            {{ isLoading ? 'Creating account...' : 'Sign up' }}
          </button>
        </div>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?
        <router-link to="/login" class="font-bold text-primary-600 hover:text-primary-500">Sign in</router-link>
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
    successMsg.value = 'Registration successful! You can now log in.'
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
