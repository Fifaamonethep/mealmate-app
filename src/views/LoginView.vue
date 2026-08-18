<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 card p-8 animate-scale-in">
      
      <div class="text-center" data-aos="fade-down">
        <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 animate-float overflow-hidden border border-gray-100 dark:border-gray-800 p-1">
          <img src="@/assets/mealmate_logo.png" alt="MealMate Logo" class="w-full h-full object-cover rounded-xl" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">{{ $t('auth.welcome') }}</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ loginMethod === 'forgot_password' && step === 3 ? 'Enter your new password' : (loginMethod === 'password' ? $t('auth.signInSubtitle') : (step === 1 ? $t('auth.signInSubtitle') : $t('auth.enterOtpSubtitle'))) }}
        </p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 animate-slide-down">
        {{ errorMsg }}
      </div>
      
      <div v-if="successMsg" class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800 animate-slide-down">
        {{ successMsg }}
      </div>

      <!-- Login Method Tabs -->
      <div v-if="loginMethod !== 'forgot_password'" class="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-2xl animate-slide-down">
        <button @click="loginMethod = 'otp'" 
          :class="['flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-bold transition-all', 
            loginMethod === 'otp' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
          <Mail class="w-4 h-4 mr-2" /> Magic Link
        </button>
        <button @click="loginMethod = 'password'" 
          :class="['flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-bold transition-all', 
            loginMethod === 'password' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
          <Key class="w-4 h-4 mr-2" /> Password
        </button>
      </div>

      <!-- Step 1: Email Input (OTP) -->
      <form v-if="loginMethod === 'otp' && step === 1" class="mt-8 space-y-6" @submit.prevent="handleSendOtp" data-aos="fade-up" data-aos-delay="100">
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

      <!-- Step 2: OTP Input (For Magic Link and Forgot Password) -->
      <form v-else-if="(loginMethod === 'otp' || loginMethod === 'forgot_password') && step === 2" class="mt-8 space-y-6" @submit.prevent="handleVerifyOtp" data-aos="fade-up">
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">{{ $t('auth.enterOtp') }}</label>
            <button type="button" @click="step = 1; loginMethod = loginMethod === 'forgot_password' ? 'password' : 'otp'; otp = ['', '', '', '', '', '']" class="text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors active:scale-95">
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

      <!-- Step 3: Set New Password -->
      <form v-else-if="loginMethod === 'forgot_password' && step === 3" class="mt-8 space-y-6" @submit.prevent="handleUpdatePassword" data-aos="fade-up">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" required class="input-field pr-12" placeholder="Enter new password">
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
            <Key v-else class="w-5 h-5 mr-2" />
            Update Password
          </button>
        </div>
      </form>

      <!-- Password Login Form -->
      <form v-else-if="loginMethod === 'password'" class="mt-8 space-y-6" @submit.prevent="handlePasswordLogin" data-aos="fade-up" data-aos-delay="100">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.email') }}</label>
            <input v-model="email" type="email" required class="input-field" placeholder="you@example.com">
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

      <div v-if="(loginMethod === 'otp' && step === 1) || loginMethod === 'password'" class="mt-6" data-aos="fade-up" data-aos-delay="200">
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

      <p v-if="(loginMethod === 'otp' && step === 1) || loginMethod === 'password'" class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400" data-aos="fade-up" data-aos-delay="300">
        {{ $t('auth.noAccount') }}
        <router-link to="/signup" class="font-bold text-primary-600 hover:text-primary-500 transition-colors">{{ $t('auth.signUp') }}</router-link>
      </p>
      
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { LogIn, Loader2, Mail, Key, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const loginMethod = ref('otp')
const step = ref(1)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

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
    if (loginMethod.value === 'forgot_password') {
      await authStore.verifyOtp(email.value, token, 'recovery')
      successMsg.value = 'OTP verified! Please enter your new password.'
      step.value = 3
      password.value = ''
    } else {
      await authStore.verifyOtp(email.value, token, 'email')
      if (authStore.needsOnboarding) {
        router.push('/onboarding')
      } else {
        sessionStorage.setItem('show_summary_poster', 'true')
        router.push('/')
      }
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handlePasswordLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authStore.loginWithPassword(email.value, password.value)
    if (authStore.needsOnboarding) {
      router.push('/onboarding')
    } else {
      sessionStorage.setItem('show_summary_poster', 'true')
      router.push('/')
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMsg.value = t('auth.enterEmailReset')
    return
  }
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await authStore.resetPassword(email.value)
    successMsg.value = t('auth.otpSent')
    loginMethod.value = 'forgot_password'
    step.value = 2
    otp.value = ['', '', '', '', '', '']
    nextTick(() => {
      if (otpRefs.value[0]) otpRefs.value[0].focus()
    })
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!password.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authStore.updatePassword(password.value)
    sessionStorage.setItem('show_summary_poster', 'true')
    router.push('/')
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
