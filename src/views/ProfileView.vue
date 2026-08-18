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
            <input type="file" class="hidden" accept="image/*" @change="onFileSelect" />
          </label>
        </div>
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('profile.title') || 'My Profile' }}</h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ profile.fullName }}</p>
        </div>
      </div>
    </div>

    <!-- Cropper Modal -->
    <transition name="modal">
      <div v-if="isCropperOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="isCropperOpen = false"></div>
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Crop Avatar</h3>
            <button @click="isCropperOpen = false" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div class="p-4 bg-gray-900">
            <cropper
              class="h-64 w-full"
              ref="cropperRef"
              :src="imageToCrop"
              :stencil-props="{ aspectRatio: 1 }"
              image-restriction="stencil"
            />
          </div>
          <div class="p-4 flex justify-end space-x-3 bg-white dark:bg-gray-800">
            <button @click="isCropperOpen = false" class="px-4 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
            <button @click="handleUploadCropped" :disabled="isUploadingAvatar" class="btn-primary flex items-center px-6 py-2">
              <Loader2 v-if="isUploadingAvatar" class="w-4 h-4 mr-2 animate-spin" />
              {{ isUploadingAvatar ? 'Saving...' : 'Save Avatar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

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
import { User, QrCode, UploadCloud, Save, Camera, Lock, X, Loader2 } from 'lucide-vue-next'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const authStore = useAuthStore()

const profile = ref({ fullName: '', currency: 'THB', qrCodeUrl: null, avatarUrl: null })
const isUploading = ref(false)
const isSaving = ref(false)
const newPassword = ref('')
const isUpdatingPassword = ref(false)

// Cropper State
const isCropperOpen = ref(false)
const imageToCrop = ref(null)
const cropperRef = ref(null)
const isUploadingAvatar = ref(false)
const selectedFileExt = ref('png')

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

const onFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  selectedFileExt.value = file.name.split('.').pop()
  
  // Read file as URL to pass to cropper
  const reader = new FileReader()
  reader.onload = (e) => {
    imageToCrop.value = e.target.result
    isCropperOpen.value = true
  }
  reader.readAsDataURL(file)
  event.target.value = '' // reset input
}

const handleUploadCropped = async () => {
  if (!cropperRef.value) return
  isUploadingAvatar.value = true

  try {
    const { canvas } = cropperRef.value.getResult()
    if (!canvas) throw new Error("Could not get cropped image")

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) throw new Error("Could not create blob")
      
      const fileName = `${authStore.user.id}/avatar_${Date.now()}.${selectedFileExt.value}`
      const file = new File([blob], fileName, { type: blob.type })

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      profile.value.avatarUrl = publicUrlData.publicUrl

      await supabase.from('profiles').update({ avatar_url: profile.value.avatarUrl }).eq('id', authStore.user.id)
      authStore.user.avatarUrl = profile.value.avatarUrl
      
      isCropperOpen.value = false
      isUploadingAvatar.value = false
    }, 'image/jpeg', 0.9)

  } catch (error) {
    alert("Avatar upload error: " + error.message)
    isUploadingAvatar.value = false
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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(20px);
}
</style>
