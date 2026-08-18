<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Debt Settlement</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Optimized transactions securely calculated by our server.</p>
      </div>
      <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
        <Wallet class="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="debtsStore.isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
      <p class="mt-4 text-gray-500 font-medium">Crunching the numbers securely...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="debtsStore.error" class="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl border border-red-200 dark:border-red-800">
      <p class="font-bold text-center">Error: {{ debtsStore.error }}</p>
    </div>

    <div v-else class="space-y-4">
      <div v-if="transactions.length === 0" class="text-center py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 font-medium">All debts are settled!</p>
      </div>

      <transition-group name="list" tag="div" class="space-y-4">
        <div v-for="(tx, index) in transactions" :key="index"
             class="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-md hover:shadow-xl dark:shadow-none rounded-3xl p-6 transition-all duration-300 ease-in-out">
          
          <div class="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div class="flex items-center justify-between relative z-10">
            <!-- Payer -->
            <div class="flex flex-col items-center sm:flex-row sm:space-x-4">
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <span class="text-red-600 dark:text-red-400 font-bold text-lg">{{ tx.from.charAt(0) }}</span>
              </div>
              <div class="mt-3 sm:mt-0 text-center sm:text-left">
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Pays</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ tx.from }}</p>
              </div>
            </div>

            <!-- Transfer Arrow -->
            <div class="flex flex-col items-center px-4">
              <div class="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mb-1 shadow-sm">
                <ArrowRight class="w-5 h-5 text-gray-500 dark:text-gray-300" />
              </div>
            </div>

            <!-- Receiver -->
            <div class="flex flex-col items-center sm:flex-row-reverse sm:space-x-4 sm:space-x-reverse">
              <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span class="text-green-600 dark:text-green-400 font-bold text-lg">{{ tx.to.charAt(0) }}</span>
              </div>
              <div class="mt-3 sm:mt-0 text-center sm:text-right">
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Receives</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ tx.to }}</p>
              </div>
            </div>
          </div>

          <!-- Amount & Actions -->
          <div class="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center relative z-10">
            <div class="flex items-center space-x-2">
              <Banknote class="w-5 h-5 text-primary-500" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</span>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Payment Status Badge -->
              <span v-if="tx.status === 'SLIP_SENT'" class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold rounded-full flex items-center">
                <Clock class="w-3 h-3 mr-1" /> Pending Review
              </span>

              <!-- Amount Badge -->
              <div class="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl">
                <span class="text-xl font-black text-primary-600 dark:text-primary-400 tracking-tight">{{ tx.amount.toLocaleString() }} ฿</span>
              </div>

              <!-- Pay Now Button (Only show if current user is the debtor and hasn't paid yet) -->
              <button 
                v-if="isCurrentUser(tx.from) && tx.status !== 'SLIP_SENT'" 
                @click="openPaymentModal(tx)" 
                class="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center">
                <QrCode class="w-4 h-4 mr-2" /> Pay Now
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Payment Modal Overlay -->
    <transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closePaymentModal"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Settle Debt</h3>
            <button @click="closePaymentModal" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 flex-grow overflow-y-auto">
            <div class="text-center mb-6">
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Transfer exactly</p>
              <p class="text-4xl font-black text-primary-600 dark:text-primary-400">{{ selectedTx?.amount.toFixed(2) }} ฿</p>
              <p class="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">to {{ selectedTx?.to }}</p>
            </div>

            <!-- Mock or Real QR Code -->
            <div class="flex justify-center mb-8">
              <div class="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 inline-block">
                <img :src="selectedTx?.qrCodeUrl" alt="QR Code" class="w-40 h-40 object-cover">
              </div>
            </div>

            <!-- Upload Slip Area -->
            <div>
              <p class="text-sm font-bold text-gray-900 dark:text-white mb-2">Upload Transfer Slip</p>
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud v-if="!isUploading && !uploadSuccess" class="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary-500 transition-colors" />
                  <Loader2 v-else-if="isUploading" class="w-8 h-8 text-primary-500 animate-spin mb-2" />
                  <CheckCircle2 v-else class="w-8 h-8 text-green-500 mb-2" />
                  
                  <p v-if="!isUploading && !uploadSuccess" class="text-sm text-gray-500 dark:text-gray-400 font-medium">Click or drag slip image here</p>
                  <p v-else-if="isUploading" class="text-sm text-primary-600 font-medium">Uploading securely...</p>
                  <p v-else class="text-sm text-green-600 font-medium">Slip uploaded successfully!</p>
                </div>
                <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
              </label>
            </div>
          </div>
          
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDebtsStore } from '../stores/debts'
import { useAuthStore } from '../stores/authStore'
import { Wallet, ArrowRight, Banknote, QrCode, X, UploadCloud, Loader2, CheckCircle2, Clock } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const debtsStore = useDebtsStore()
const authStore = useAuthStore()

const transactions = computed(() => {
  return debtsStore.optimizedTransactions
})

onMounted(() => {
  debtsStore.fetchSettlements()
})

// Modal State
const isModalOpen = ref(false)
const selectedTx = ref(null)
const isUploading = ref(false)
const uploadSuccess = ref(false)

// Logic to identify if current user is the debtor
const isCurrentUser = (name) => {
  return authStore.user?.fullName?.toLowerCase() === name.toLowerCase()
}

const openPaymentModal = async (tx) => {
  selectedTx.value = tx
  uploadSuccess.value = false
  isModalOpen.value = true
  
  // Fetch Creditor's QR Code
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('qr_code_url')
      .eq('full_name', tx.to)
      .single()
      
    if (profiles && profiles.qr_code_url) {
      selectedTx.value.qrCodeUrl = profiles.qr_code_url
    } else {
      selectedTx.value.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay-${tx.to}-${tx.amount}`
    }
  } catch (err) {
    console.error("Error fetching QR:", err)
    selectedTx.value.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay-${tx.to}-${tx.amount}`
  }
}

const closePaymentModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedTx.value = null
    isUploading.value = false
    uploadSuccess.value = false
  }, 300)
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  try {
    // We now have fromId and toId from the new API response format!
    const fromId = selectedTx.value.fromId
    const toId = selectedTx.value.toId

    // 1. Upload the image to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${fromId}_to_${toId}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('slips') // make sure the 'slips' bucket exists in your Supabase
      .upload(fileName, file)
      
    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from('slips').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    // 2. Insert into slips table
    const { error } = await supabase.from('slips').insert([{
      from_user_id: fromId,
      to_user_id: toId,
      amount: selectedTx.value.amount,
      image_url: publicUrl,
      status: 'Needs Review'
    }])

    if (error) throw error

    uploadSuccess.value = true
    setTimeout(() => {
      if (selectedTx.value) {
         selectedTx.value.status = 'SLIP_SENT'
      }
      closePaymentModal()
    }, 1000)
  } catch (err) {
    alert("Error uploading slip: " + err.message)
    isUploading.value = false
  }
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

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
