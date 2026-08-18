<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center justify-between mb-8 animate-fade-in">
      <!-- Profile Header / Avatar -->
      <div class="flex items-center space-x-6">
        <div class="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 dark:bg-gray-700">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" class="w-full h-full object-cover">
          <User v-else class="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          <label class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <Camera class="w-6 h-6 text-white" />
            <input type="file" class="hidden" accept="image/*" @change="handleUploadAvatar" />
          </label>
        </div>
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('profile.title') || 'My Profile' }}</h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ profile.fullName }}</p>
        </div>
      </div>
    </div>

    <div v-if="authStore.user" class="space-y-6">
      
      <!-- General Info -->
      <div class="card p-6 animate-slide-up">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ $t('profile.generalInfo') }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.fullName') || 'Full Name' }}</label>
            <input v-model="profile.fullName" type="text" class="input-field">
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
          {{ isSaving ? ($t('profile.saving') || 'Saving...') : ($t('profile.saveProfile') || 'Save Profile') }}
        </button>
      </div>

      <!-- Security / Password -->
      <div class="card p-6 animate-slide-up stagger-4 mt-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Security</h3>
        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input v-model="newPassword" type="password" required minlength="6" class="input-field" placeholder="Enter new password">
          </div>
          <button type="submit" :disabled="isUpdatingPassword" class="btn-secondary w-full flex items-center justify-center">
            <Lock class="w-4 h-4 mr-2" />
            {{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { User, QrCode, UploadCloud, Save, Camera, Lock } from 'lucide-vue-next'

const authStore = useAuthStore()

const profile = ref({ fullName: '', currency: 'THB', qrCodeUrl: null, avatarUrl: null })
const isUploading = ref(false)
const isSaving = ref(false)
const newPassword = ref('')
const isUpdatingPassword = ref(false)

onMounted(async () => {
  if (authStore.user) {
    profile.value.fullName = authStore.user.fullName
    profile.value.avatarUrl = authStore.user.avatarUrl
    try {
      const { data } = await supabase
        .from('profiles')
        .select('currency, qr_code_url, avatar_url, full_name')
        .eq('id', authStore.user.id)
        .single()
      if (data) {
        if (data.currency) profile.value.currency = data.currency
        if (data.qr_code_url) profile.value.qrCodeUrl = data.qr_code_url
        if (data.avatar_url) profile.value.avatarUrl = data.avatar_url
        if (data.full_name) profile.value.fullName = data.full_name
      }
    } catch (err) {
      console.log("No extended profile data yet")
    }
  }
})

const handleUploadAvatar = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${authStore.user.id}/avatar_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (uploadError) throw uploadError
    
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    profile.value.avatarUrl = publicUrlData.publicUrl

    await supabase.from('profiles').update({ avatar_url: profile.value.avatarUrl }).eq('id', authStore.user.id)
    authStore.user.avatarUrl = profile.value.avatarUrl
    
  } catch (error) {
    alert("Avatar upload error: " + error.message)
  }
}

const updatePassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) return
  isUpdatingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    if (error) throw error
    alert("Password updated successfully! You can use this new password on next login.")
    newPassword.value = ''
  } catch (error) {
    alert("Error updating password: " + error.message)
  } finally {
    isUpdatingPassword.value = false
  }
}

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
      .update({ 
        currency: profile.value.currency, 
        qr_code_url: profile.value.qrCodeUrl,
        full_name: profile.value.fullName
      })
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
