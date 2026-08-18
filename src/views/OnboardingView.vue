<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 card p-8 animate-scale-in">
      
      <div class="text-center" data-aos="fade-down">
        <div class="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
          <User class="w-10 h-10 text-primary-500" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">{{ $t('auth.whatsYourName') }}</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ $t('auth.nameSubtitle') }}
        </p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 animate-slide-down">
        {{ errorMsg }}
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSaveName" data-aos="fade-up" data-aos-delay="100">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.fullName') }}</label>
            <input v-model="fullName" type="text" required class="input-field" placeholder="John Doe" autofocus>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading || !fullName.trim()" class="btn-primary w-full flex justify-center items-center">
            <Loader2 v-if="isLoading" class="w-5 h-5 mr-2 animate-spin" />
            <ArrowRight v-else class="w-5 h-5 mr-2" />
            {{ isLoading ? $t('auth.saving') : $t('auth.continue') }}
          </button>
        </div>
      </form>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { User, Loader2, ArrowRight } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const fullName = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleSaveName = async () => {
  if (!fullName.value.trim() || !authStore.user?.id) return
  
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.value.trim() })
      .eq('id', authStore.user.id)
      
    if (error) throw error
    
    // Update local store
    authStore.user.fullName = fullName.value.trim()
    authStore.needsOnboarding = false
    
    // Set flag for summary poster
    sessionStorage.setItem('show_summary_poster', 'true')
    
    router.push('/')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>
