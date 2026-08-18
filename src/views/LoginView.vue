<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 card p-8 animate-scale-in">
      
      <div class="text-center" data-aos="fade-down">
        <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 animate-float overflow-hidden border border-gray-100 dark:border-gray-800 p-1">
          <img src="@/assets/mealmate_logo.png" alt="MealMate Logo" class="w-full h-full object-cover rounded-xl" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">{{ $t('auth.welcome') }}</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ step === 1 ? $t('auth.signInSubtitle') : $t('auth.enterOtpSubtitle') }}
        </p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 animate-slide-down">
        {{ errorMsg }}
      </div>
      
      <div v-if="successMsg" class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800 animate-slide-down">
        {{ successMsg }}
      </div>

      <!-- Step 1: Email Input -->
      <form v-if="step === 1" class="mt-8 space-y-6" @submit.prevent="handleSendOtp" data-aos="fade-up" data-aos-delay="100">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.email') }}</label>
            <input v-model="email" type="email" required class="input-field" placeholder="you@example.com">
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="btn-primary w-full flex justify-center items-center">
            <Loader2 v-if="isLoading" class="w-5 h-5 mr-2 animate-spin" />
            <Mail v-else class="w-5 h-5 mr-2" />
            {{ isLoading ? $t('auth.sending') : $t('auth.sendOtp') }}
          </button>
        </div>
      </form>

      <!-- Step 2: OTP Input -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleVerifyOtp" data-aos="fade-up">
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">{{ $t('auth.enterOtp') }}</label>
            <button type="button" @click="step = 1; otp = ['', '', '', '', '', '']" class="text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors active:scale-95">
              {{ $t('auth.changeEmail') }}
            </button>
          </div>
          
          <div class="flex justify-between gap-2" dir="ltr">
            <input 
              v-for="(digit, index) in 6" :key="index"
              :ref="el => otpRefs[index] = el"
              v-model="otp[index]"
              @input="handleOtpInput(index, $event)"
              @keydown="handleOtpKeydown(index, $event)"
              type="text" 
              inputmode="numeric" 
              maxlength="1"
              class="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary-500 focus:ring-0 transition-all duration-200 outline-none"
              :class="{ 'scale-[1.05] border-primary-500 shadow-sm text-primary-600 dark:text-primary-400': otp[index] }"
            >
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading || otp.join('').length !== 6" class="btn-primary w-full flex justify-center items-center">
            <Loader2 v-if="isLoading" class="w-5 h-5 mr-2 animate-spin" />
            <LogIn v-else class="w-5 h-5 mr-2" />
            {{ isLoading ? $t('auth.verifying') : $t('auth.verifyOtpBtn') }}
          </button>
        </div>
      </form>

      <div v-if="step === 1" class="mt-6" data-aos="fade-up" data-aos-delay="200">
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
      
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { LogIn, Loader2, Mail } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const step = ref(1)
const email = ref('')
const otp = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSendOtp = async () => {
  if (!email.value) return
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await authStore.loginWithOtp(email.value)
    successMsg.value = t('auth.otpSent')
    step.value = 2
    nextTick(() => {
      if (otpRefs.value[0]) otpRefs.value[0].focus()
    })
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleVerifyOtp = async () => {
  const token = otp.value.join('')
  if (token.length !== 6) return
  
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authStore.verifyOtp(email.value, token)
    if (authStore.needsOnboarding) {
      router.push('/onboarding')
    } else {
      // Set flag to show summary poster
      sessionStorage.setItem('show_summary_poster', 'true')
      router.push('/')
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleOtpInput = (index, event) => {
  const value = event.target.value
  if (!/^\d*$/.test(value)) {
    otp.value[index] = ''
    return
  }
  
  if (value && index < 5) {
    otpRefs.value[index + 1].focus()
  }
}

const handleOtpKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    otpRefs.value[index - 1].focus()
  }
}

const handleGoogle = async () => {
  try {
    await authStore.loginWithGoogle()
  } catch (error) {
    errorMsg.value = error.message
  }
}
</script>
