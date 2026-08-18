<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center justify-between mb-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('profile.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('profile.subtitle') }}</p>
      </div>
      <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
        <User class="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
    </div>

    <div v-if="authStore.user" class="space-y-6">
      
      <!-- General Info -->
      <div class="card p-6 animate-slide-up">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ $t('profile.generalInfo') }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.fullName') }}</label>
            <input v-model="profile.fullName" type="text" disabled class="input-field opacity-60 cursor-not-allowed">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.currency') }}</label>
            <select v-model="profile.currency" class="input-field">
              <option value="THB">THB (บาทไทย)</option>
              <option value="LAK">LAK (ກີບລາວ)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Payment QR Code -->
      <div class="card p-6 animate-slide-up stagger-2">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ $t('profile.paymentQR') }}</h3>
        
        <div class="flex flex-col items-center sm:flex-row sm:space-x-8">
          <div class="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
            <img v-if="profile.qrCodeUrl" :src="profile.qrCodeUrl" alt="QR" class="w-full h-full object-cover">
            <div v-else class="text-center p-4">
              <QrCode class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span class="text-xs text-gray-500">{{ $t('profile.noQR') }}</span>
            </div>
          </div>

          <div class="mt-6 sm:mt-0 flex-1 w-full">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ $t('profile.qrDescription') }}</p>
            <label class="btn-secondary flex justify-center items-center cursor-pointer w-full sm:w-auto">
              <UploadCloud class="w-5 h-5 mr-2 text-green-500" />
              {{ $t('profile.uploadQR') }}
              <input type="file" class="hidden" accept="image/*" @change="handleUploadQR" />
            </label>
            <p v-if="isUploading" class="text-sm text-green-500 mt-2 font-medium">{{ $t('common.uploading') }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end animate-slide-up stagger-3">
        <button @click="saveProfile" :disabled="isSaving" class="btn-primary flex items-center">
          <Save class="w-5 h-5 mr-2" />
          {{ isSaving ? $t('profile.saving') : $t('profile.saveProfile') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { User, QrCode, UploadCloud, Save } from 'lucide-vue-next'

const authStore = useAuthStore()

const profile = ref({ fullName: '', currency: 'THB', qrCodeUrl: null })
const isUploading = ref(false)
const isSaving = ref(false)

onMounted(async () => {
  if (authStore.user) {
    profile.value.fullName = authStore.user.fullName
    try {
      const { data } = await supabase
        .from('profiles')
        .select('currency, qr_code_url')
        .eq('id', authStore.user.id)
        .single()
      if (data) {
        if (data.currency) profile.value.currency = data.currency
        if (data.qr_code_url) profile.value.qrCodeUrl = data.qr_code_url
      }
    } catch (err) {
      console.log("No extended profile data yet")
    }
  }
})

const handleUploadQR = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  isUploading.value = true
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${authStore.user.id}_qr.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('qrcodes').upload(fileName, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: publicUrlData } = supabase.storage.from('qrcodes').getPublicUrl(fileName)
    profile.value.qrCodeUrl = publicUrlData.publicUrl
    alert("QR Code Uploaded!")
  } catch (error) {
    alert("Upload error: " + error.message)
  } finally {
    isUploading.value = false
  }
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ currency: profile.value.currency, qr_code_url: profile.value.qrCodeUrl })
      .eq('id', authStore.user.id)
    if (error) throw error
    alert("Profile Saved!")
  } catch (error) {
    alert("Error: " + error.message)
  } finally {
    isSaving.value = false
  }
}
</script>
