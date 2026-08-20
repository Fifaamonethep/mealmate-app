<template>
  <div class="h-[100dvh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden fixed inset-0">
    <div class="max-w-md w-full space-y-4 card p-6 sm:p-8 animate-scale-in max-h-screen">
      
      <div class="text-center" data-aos="fade-down">
        <div class="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
          <AppLogo customClass="w-full h-full object-contain drop-shadow-md" />
        </div>
        <h2 class="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{{ $t('auth.createAccount') }}</h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ step === 1 ? $t('auth.createSubtitle') : $t('auth.enterOtpSubtitle') }}
        </p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 animate-slide-down">
        {{ errorMsg }}
      </div>
      
      <div v-if="successMsg" class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800 animate-slide-down">
        {{ successMsg }}
      </div>

      <form v-if="step === 1" class="mt-4 space-y-4" @submit.prevent="handleSignup" data-aos="fade-up" data-aos-delay="100">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.fullName') }}</label>
            <input v-model="fullName" type="text" required class="input-field">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.email') }}</label>
            <input v-model="email" type="email" required class="input-field" list="email-domains-signup">
            <datalist id="email-domains-signup">
              <option v-for="suggestion in emailSuggestions" :key="suggestion" :value="suggestion"></option>
            </datalist>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.password') }}</label>
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
            <UserPlus v-else class="w-5 h-5 mr-2" />
            {{ isLoading ? $t('auth.creatingAccount') : $t('auth.signUp') }}
          </button>
        </div>
      </form>

      <!-- Step 2: OTP Input -->
      <form v-else class="mt-4 space-y-4" @submit.prevent="handleVerifyOtp" data-aos="fade-up">
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">{{ $t('auth.enterOtp') }}</label>
            <button type="button" @click="step = 1; otp = ['', '', '', '', '', '']" class="text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors active:scale-95">
              {{ $t('auth.changeEmail') }}
            </button>
          </div>
          
          <div class="flex justify-center gap-2" dir="ltr">
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

        <div class="mt-4 text-center">
          <button type="button" @click="handleResendOtp" :disabled="countdown > 0 || isLoading" class="text-sm font-bold transition-colors" :class="countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-500 active:scale-95'">
            Resend OTP <span v-if="countdown > 0">({{ countdown }}s)</span>
          </button>
        </div>
      </form>

      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400" data-aos="fade-up" data-aos-delay="200">
        {{ $t('auth.hasAccount') }}
        <router-link to="/login" class="font-bold text-primary-600 hover:text-primary-500 transition-colors">{{ $t('auth.signIn2') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { UserPlus, Loader2, Eye, EyeOff, LogIn } from 'lucide-vue-next'
import AppLogo from '@/components/common/AppLogo.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const step = ref(1)
const fullName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const domains = ['@gmail.com', '@email.com', '@gmail.com.la', '@yahoo.com', '@hotmail.com', '@outlook.com']
const emailSuggestions = computed(() => {
  if (!email.value || !email.value.includes('@')) return []
  const prefix = email.value.split('@')[0]
  return domains.map(d => prefix + d)
})

const otp = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const countdown = ref(0)
let timer = null

const startCountdown = () => {
  countdown.value = 30
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleSignup = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await authStore.signUp(email.value, password.value, fullName.value)
    successMsg.value = t('auth.otpSent')
    step.value = 2
    startCountdown()
    nextTick(() => {
      if (otpRefs.value[0]) otpRefs.value[0].focus()
    })
  } catch (error) {
    if (error.message?.includes('already registered')) {
      errorMsg.value = "This email already signed"
    } else {
      errorMsg.value = error.message
    }
  } finally {
    isLoading.value = false
  }
}

const handleResendOtp = async () => {
  if (countdown.value > 0) return
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await authStore.resendOtp(email.value, 'signup')
    successMsg.value = "OTP Resent! Please check your email."
    startCountdown()
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
    // For signup with password, the OTP type is 'signup'
    await authStore.verifyOtp(email.value, token, 'signup')
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

  // Auto-submit if all 6 digits are entered
  if (otp.value.join('').length === 6) {
    handleVerifyOtp()
  }
}

const handleOtpKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    otpRefs.value[index - 1].focus()
  }
}
</script>
