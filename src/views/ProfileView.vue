<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
    
    <!-- Header Section -->
    <div class="mb-4">
      <div class="flex items-center space-x-3 mb-2">
        <User class="w-6 h-6 text-primary-500" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Update profile details, password, and Bank QR Code for friend repayments
      </p>
    </div>

    <!-- Avatar & Basic Info Card -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 animate-fade-in">
      <div class="flex flex-col items-center space-y-4">
        <!-- Avatar -->
        <div class="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" class="w-full h-full object-cover">
          <User v-else class="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <!-- Upload Button -->
        <label class="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
          <Camera class="w-4 h-4" />
          <span>Choose from gallery</span>
          <input type="file" class="hidden" accept="image/*" @change="onFileSelect" />
        </label>
      </div>
      
      <div class="flex flex-col items-center sm:items-start mt-2">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ profile.fullName || 'New User' }}</h2>
        <div class="flex items-center space-x-2 mt-1">
          <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-medium">
            @{{ authStore.user?.username || 'user' }}
          </span>
          <button @click="copyUsername" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Copy class="w-4 h-4" />
          </button>
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
      
      <!-- Main Form Area -->
      <div class="space-y-4 animate-slide-up">
        
        <!-- Form Fields -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Display Name *</label>
          <input v-model="profile.fullName" type="text" class="input-field rounded-2xl w-full">
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <input v-model="profile.phone" type="tel" class="input-field rounded-2xl w-full" placeholder="Optional">
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input :value="userEmail" type="email" disabled class="input-field rounded-2xl w-full opacity-70 cursor-not-allowed">
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Default Currency</label>
          <select v-model="profile.currency" class="input-field rounded-2xl w-full">
            <option value="THB">THB (Thai Baht)</option>
            <option value="LAK">LAK (Lao Kip)</option>
            <option value="USD">USD (US Dollar)</option>
          </select>
        </div>

        <!-- Payment QR Code inside main form flow -->
        <div class="mt-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-6">
          <label class="relative w-32 h-32 flex-shrink-0 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-primary-500 transition-colors">
            <img v-if="profile.qrCodeUrl && profile.qrCodeUrl.startsWith('http')" :src="profile.qrCodeUrl" class="w-full h-full object-cover">
            <div v-else-if="profile.qrCodeUrl && profile.qrCodeUrl.startsWith('000201')" class="w-full h-full flex flex-col items-center justify-center bg-green-50/80 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold text-xs p-2 text-center">
              <CheckCircle2 class="w-6 h-6 mb-1" />
              Dynamic QR Ready
            </div>
            <QrCode v-else class="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <div v-if="isUploadingQR" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
              <Loader2 class="w-6 h-6 text-primary-500 animate-spin" />
            </div>
            <input type="file" class="hidden" accept="image/*" @change="handleUploadQR" />
          </label>
          <div class="flex-1 text-center sm:text-left">
            <h4 class="font-bold text-gray-900 dark:text-white mb-2">Your Payment QR Code</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              This QR code will be displayed to friends when they click Pay Debt to repay you.
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button @click="saveProfile" :disabled="isSaving" class="btn-primary rounded-xl px-8 flex items-center">
            <Save class="w-4 h-4 mr-2" />
            {{ isSaving ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>

      </div>

      <!-- Password Change Section -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-6 animate-slide-up stagger-2">
        <div class="flex items-center space-x-2 mb-6">
          <Key class="w-5 h-5 text-yellow-500" />
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input type="password" class="input-field rounded-2xl w-full" placeholder="Not required for active sessions" disabled>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input v-model="newPassword" type="password" required minlength="6" class="input-field rounded-2xl w-full" placeholder="Enter new password">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input v-model="confirmPassword" type="password" required minlength="6" class="input-field rounded-2xl w-full" placeholder="Re-enter new password">
          </div>
          <div class="flex justify-end pt-2">
            <button type="submit" :disabled="isUpdatingPassword || (newPassword !== confirmPassword)" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl transition-colors flex items-center disabled:opacity-50">
              <Lock class="w-4 h-4 mr-2" />
              Change Password
            </button>
          </div>
          <p v-if="newPassword && confirmPassword && newPassword !== confirmPassword" class="text-red-500 text-xs text-right mt-1">Passwords do not match</p>
        </form>
      </div>

      <!-- Logout Section -->
      <div class="animate-slide-up stagger-3 pt-4">
        <button @click="handleLogout" class="w-full flex items-center justify-center py-4 rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
          <LogOut class="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { User, QrCode, Save, Camera, Lock, X, Loader2, Copy, Key, LogOut, CheckCircle2 } from 'lucide-vue-next'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import jsQR from 'jsqr'

const router = useRouter()
const authStore = useAuthStore()

const profile = ref({ fullName: '', phone: '', currency: 'THB', qrCodeUrl: null, avatarUrl: null })
const isUploadingQR = ref(false)
const isSaving = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const isUpdatingPassword = ref(false)

const userEmail = computed(() => {
  return authStore.user?.email || 'user@example.com'
})

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
    
    // Fetch email correctly
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.email) {
       authStore.user.email = userData.user.email
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('currency, qr_code_url, avatar_url, full_name, phone_number')
        .eq('id', authStore.user.id)
        .single()
      if (data) {
        if (data.currency) profile.value.currency = data.currency
        if (data.qr_code_url) profile.value.qrCodeUrl = data.qr_code_url
        if (data.avatar_url) profile.value.avatarUrl = data.avatar_url
        if (data.full_name) profile.value.fullName = data.full_name
        if (data.phone_number) profile.value.phone = data.phone_number
      }
    } catch (err) {
      console.log("No extended profile data yet")
    }
  }
})

const copyUsername = () => {
  if (authStore.user?.username) {
    navigator.clipboard.writeText(`@${authStore.user.username}`)
    // Optional: show a small toast here
  }
}

const onFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  selectedFileExt.value = file.name.split('.').pop()
  
  const reader = new FileReader()
  reader.onload = (e) => {
    imageToCrop.value = e.target.result
    isCropperOpen.value = true
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const handleUploadCropped = async () => {
  if (!cropperRef.value) return
  isUploadingAvatar.value = true

  try {
    const { canvas } = cropperRef.value.getResult()
    if (!canvas) throw new Error("Could not get cropped image")

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
  if (!newPassword.value || newPassword.value.length < 6 || newPassword.value !== confirmPassword.value) return
  isUpdatingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    if (error) throw error
    alert("Password updated successfully!")
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    alert("Error updating password: " + error.message)
  } finally {
    isUpdatingPassword.value = false
  }
}

const handleUploadQR = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  isUploadingQR.value = true
  
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data && code.data.startsWith('000201')) {
           profile.value.qrCodeUrl = code.data;
           alert("Successfully extracted your QR Code data! It will now support dynamic amounts.");
           isUploadingQR.value = false;
        } else {
           uploadQRFile(file);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } catch (err) {
    uploadQRFile(file);
  }
}

const uploadQRFile = async (file) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${authStore.user.id}_qr.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('qrcodes').upload(fileName, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: publicUrlData } = supabase.storage.from('qrcodes').getPublicUrl(fileName)
    profile.value.qrCodeUrl = publicUrlData.publicUrl
  } catch (error) {
    alert("Upload error: " + error.message)
  } finally {
    isUploadingQR.value = false
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
        full_name: profile.value.fullName,
        phone_number: profile.value.phone
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

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    alert("Error logging out")
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
