<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage your payment settings and QR codes.</p>
      </div>
      <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
        <User class="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
    </div>

    <div v-if="authStore.user" class="space-y-6">
      
      <!-- General Info -->
      <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-6 rounded-3xl shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">General Information</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input v-model="profile.fullName" type="text" disabled class="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Default Currency</label>
            <select v-model="profile.currency" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white">
              <option value="THB">THB (บาทไทย)</option>
              <option value="LAK">LAK (กีบลาว)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Payment QR Code -->
      <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-6 rounded-3xl shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Receive Payments (Bank QR Code)</h3>
        
        <div class="flex flex-col items-center sm:flex-row sm:space-x-8">
          
          <div class="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/50">
            <img v-if="profile.qrCodeUrl" :src="profile.qrCodeUrl" alt="My QR Code" class="w-full h-full object-cover">
            <div v-else class="text-center p-4">
              <QrCode class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span class="text-xs text-gray-500">No QR Code uploaded</span>
            </div>
          </div>

          <div class="mt-6 sm:mt-0 flex-1 w-full">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload your PromptPay or LAOQR code so friends can scan and pay you directly when settling debts.
            </p>
            
            <label class="flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors w-full sm:w-auto">
              <UploadCloud class="w-5 h-5 mr-2 text-primary-500" />
              Upload New QR Image
              <input type="file" class="hidden" accept="image/*" @change="handleUploadQR" />
            </label>
            <p v-if="isUploading" class="text-sm text-primary-500 mt-2 font-medium">Uploading...</p>
          </div>

        </div>
      </div>

      <div class="flex justify-end">
        <button @click="saveProfile" :disabled="isSaving" class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
          <Save class="w-5 h-5 mr-2" />
          {{ isSaving ? 'Saving...' : 'Save Profile' }}
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

const profile = ref({
  fullName: '',
  currency: 'THB',
  qrCodeUrl: null
})

const isUploading = ref(false)
const isSaving = ref(false)

onMounted(async () => {
  if (authStore.user) {
    profile.value.fullName = authStore.user.fullName
    // Fetch extended profile data (currency, qr)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('currency, qr_code_url')
        .eq('id', authStore.user.id)
        .single()
      
      if (data) {
        if (data.currency) profile.value.currency = data.currency
        if (data.qr_code_url) profile.value.qrCodeUrl = data.qr_code_url
      }
    } catch (err) {
      console.log("No extended profile data yet or columns missing")
    }
  }
})

const handleUploadQR = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  try {
    // 1. Upload to Supabase Storage (Bucket name: qrcodes)
    const fileExt = file.name.split('.').pop()
    const fileName = `${authStore.user.id}_qr.${fileExt}`
    
    // We assume the user has created a bucket called 'qrcodes'
    const { error: uploadError, data } = await supabase.storage
      .from('qrcodes')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('qrcodes')
      .getPublicUrl(fileName)

    profile.value.qrCodeUrl = publicUrlData.publicUrl
    alert("QR Code Uploaded Successfully!")

  } catch (error) {
    alert("Error uploading QR: You might need to create a public 'qrcodes' bucket in Supabase first. " + error.message)
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
        qr_code_url: profile.value.qrCodeUrl
      })
      .eq('id', authStore.user.id)

    if (error) {
      // Handle missing columns gracefully
      if (error.message.includes('column "currency" of relation "profiles" does not exist')) {
         alert("SQL Setup Required: Please run the SQL command in Supabase to add 'currency' and 'qr_code_url' columns to your profiles table.")
      } else {
         throw error
      }
    } else {
      alert("Profile Saved!")
    }
  } catch (error) {
    alert("Error saving profile: " + error.message)
  } finally {
    isSaving.value = false
  }
}
</script>
