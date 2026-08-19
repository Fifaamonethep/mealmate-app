<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
    
    <!-- Header -->
    <div class="flex items-center space-x-3 mb-2">
      <CreditCard class="w-6 h-6 text-primary-500" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Debt & Payment Management</h1>
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Track debts, review transfer slips, and confirm repayments from friends
    </p>

    <!-- Share Button -->
    <button class="flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50 rounded-2xl text-sm font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
      <Share2 class="w-4 h-4 mr-2" />
      Copy Share Message
    </button>

    <!-- Tabs: I Owe vs Others Owe Me -->
    <div class="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-2xl animate-slide-up">
      <button @click="debtType = 'i_owe'" 
        :class="['flex-1 flex items-center justify-center py-4 rounded-xl text-sm font-bold transition-all', 
          debtType === 'i_owe' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
        <ArrowUpRight class="w-4 h-4 mr-2" />
        I Owe Others
      </button>
      <button @click="debtType = 'others_owe'" 
        :class="['flex-1 flex items-center justify-center py-4 rounded-xl text-sm font-bold transition-all', 
          debtType === 'others_owe' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
        <ArrowDownLeft class="w-4 h-4 mr-2" />
        Others Owe Me
      </button>
    </div>

    <!-- Status Filters -->
    <div class="flex items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar animate-slide-up stagger-2">
      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0">
        <Filter class="w-4 h-4 mr-1" />
        Filter status:
      </div>
      <button v-for="status in ['All', 'Pending', 'Waiting for Approval', 'Paid']" :key="status"
        @click="filterStatus = status"
        :class="['px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border', 
          filterStatus === status ? 'bg-primary-500 text-white border-primary-500' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800']">
        {{ status }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="debtsStore.isLoading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
    </div>

    <!-- Error State -->
    <div v-else-if="debtsStore.error" class="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl border border-red-200 dark:border-red-800">
      <p class="font-bold text-center">Error: {{ debtsStore.error }}</p>
    </div>

    <!-- Debts List -->
    <div v-else class="animate-fade-in">
      
      <!-- Empty State -->
      <div v-if="filteredTransactions.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center border border-gray-200 dark:border-gray-800 rounded-[2rem] bg-white/50 dark:bg-gray-900/30">
        <CreditCard class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">No debts match the current filter!</p>
      </div>

      <!-- Transactions List -->
      <transition-group name="list" tag="div" class="space-y-4">
        <div v-for="(tx, index) in filteredTransactions" :key="index"
             class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
          
          <div class="flex items-center justify-between">
            <!-- Counterparty Info -->
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0">
                <!-- Fallback to initials if no avatar -->
                <span class="text-gray-600 dark:text-gray-400 font-bold text-lg">{{ getCounterpartyName(tx).charAt(0) }}</span>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {{ debtType === 'i_owe' ? 'You owe' : 'Owes you' }}
                </p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ getCounterpartyName(tx) }}</p>
              </div>
            </div>

            <!-- Amount & Status Badge -->
            <div class="text-right">
              <p :class="['text-xl font-black tracking-tight mb-1', debtType === 'i_owe' ? 'text-red-500' : 'text-green-500']">
                {{ debtType === 'i_owe' ? '-' : '+' }}{{ tx.amount.toLocaleString() }} LAK
              </p>
              
              <span v-if="tx.status === 'SLIP_SENT'" class="inline-flex items-center px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                <Clock class="w-3 h-3 mr-1" /> Waiting for Approval
              </span>
              <span v-else-if="tx.status === 'COMPLETED'" class="inline-flex items-center px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                <Check class="w-3 h-3 mr-1" /> Paid
              </span>
              <span v-else class="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Pending
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
            <!-- I Owe (normal user) -->
            <button v-if="debtType === 'i_owe' && !tx.toIsGuest && tx.status !== 'SLIP_SENT' && tx.status !== 'COMPLETED'" 
              @click="openPaymentModal(tx)" 
              class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-transform active:scale-95 flex items-center">
              <QrCode class="w-4 h-4 mr-2" /> Mark as Paid
            </button>
            
            <!-- Others Owe Me (normal user) -->
            <button v-if="debtType === 'others_owe' && !tx.fromIsGuest && tx.status === 'SLIP_SENT'" 
              @click="debtsStore.verifyPayment(tx.paymentId)"
              class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-transform active:scale-95 flex items-center">
              <CheckCircle2 class="w-4 h-4 mr-2" /> Confirm Payment
            </button>

            <!-- Others Owe Me (Guest) -->
            <button v-if="debtType === 'others_owe' && tx.fromIsGuest && tx.status !== 'COMPLETED'" 
              @click="handleGuestPayment(tx)"
              class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-transform active:scale-95 flex items-center">
              <Check class="w-4 h-4 mr-2" /> Mark as Paid (Cash)
            </button>
          </div>

        </div>
      </transition-group>
    </div>

    <!-- Payment Modal Overlay -->
    <transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closePaymentModal"></div>
        
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
          
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Settle Debt</h3>
            <button @click="closePaymentModal" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div class="p-6 flex-grow overflow-y-auto">
            <div class="text-center mb-6">
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Transfer exactly</p>
              <p class="text-4xl font-black text-primary-600 dark:text-primary-400">{{ selectedTx?.amount.toLocaleString() }} LAK</p>
              <p class="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">to {{ selectedTx?.to }}</p>
            </div>

            <div class="flex justify-center mb-8">
              <div class="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 inline-block">
                <QrcodeVue v-if="qrCodeData" :value="qrCodeData" :size="200" level="H" />
                <div v-else class="w-[200px] h-[200px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl font-bold text-sm">No QR Data</div>
              </div>
            </div>

            <div>
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-300 dark:border-primary-800 rounded-2xl cursor-pointer bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud v-if="!isUploading && !uploadSuccess" class="w-8 h-8 text-primary-400 mb-2 group-hover:text-primary-500 transition-colors" />
                  <Loader2 v-else-if="isUploading" class="w-8 h-8 text-primary-500 animate-spin mb-2" />
                  <CheckCircle2 v-else class="w-8 h-8 text-green-500 mb-2" />
                  
                  <p v-if="!isUploading && !uploadSuccess" class="text-sm text-primary-600 dark:text-primary-400 font-bold">Upload Transfer Slip</p>
                  <p v-else-if="isUploading" class="text-sm text-primary-600 font-bold">Uploading securely...</p>
                  <p v-else class="text-sm text-green-600 font-bold">Slip uploaded!</p>
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
import { CreditCard, Share2, ArrowUpRight, ArrowDownLeft, Filter, QrCode, X, UploadCloud, Loader2, CheckCircle2, Clock, Check } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import QrcodeVue from 'qrcode.vue'
import { generateLaoQR } from '../utils/laoQr'

const debtsStore = useDebtsStore()
const authStore = useAuthStore()

const debtType = ref('i_owe') // 'i_owe' or 'others_owe'
const filterStatus = ref('All') // 'All', 'Unpaid', 'Slip Sent', 'Completed'

const getCounterpartyName = (tx) => {
  return debtType.value === 'i_owe' ? tx.to : tx.from
}

const transactions = computed(() => {
  if (!authStore.user) return []
  return debtsStore.optimizedTransactions.filter(tx => 
    tx.fromId === authStore.user.id || tx.toId === authStore.user.id
  )
})

const filteredTransactions = computed(() => {
  let list = transactions.value

  // Filter by Debt Type
  if (debtType.value === 'i_owe') {
    list = list.filter(tx => tx.fromId === authStore.user?.id)
  } else {
    list = list.filter(tx => tx.toId === authStore.user?.id)
  }

  // Filter by Status
  if (filterStatus.value !== 'All') {
    if (filterStatus.value === 'Pending') {
       list = list.filter(tx => !tx.status || tx.status === 'UNPAID' || tx.status === 'PENDING')
    } else if (filterStatus.value === 'Waiting for Approval') {
       list = list.filter(tx => tx.status === 'SLIP_SENT')
    } else if (filterStatus.value === 'Paid') {
       list = list.filter(tx => tx.status === 'COMPLETED')
    }
  }

  return list
})

onMounted(() => {
  debtsStore.fetchSettlements()
})

// Modal State
const isModalOpen = ref(false)
const selectedTx = ref(null)
const isUploading = ref(false)
const uploadSuccess = ref(false)
const qrCodeData = ref('')

const openPaymentModal = async (tx) => {
  selectedTx.value = tx
  uploadSuccess.value = false
  isModalOpen.value = true
  qrCodeData.value = ''
  
  // Fetch Creditor's info (Phone number for LAO QR)
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('phone_number, qr_code_url')
      .eq('full_name', tx.to)
      .single()
      
    if (profiles && profiles.phone_number) {
      qrCodeData.value = generateLaoQR(profiles.phone_number, tx.amount)
    } else if (profiles && profiles.qr_code_url) {
      qrCodeData.value = profiles.qr_code_url
    } else {
      qrCodeData.value = `pay-${tx.to}-${tx.amount}` // Fallback generic string
    }
  } catch (err) {
    console.error("Error fetching QR/Phone:", err)
    qrCodeData.value = `pay-${tx.to}-${tx.amount}`
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

const handleGuestPayment = async (tx) => {
  if (confirm(`Mark ${tx.amount} LAK as paid by ${tx.fromRawGuestName}? (Cash / Outside App)`)) {
    await debtsStore.settleGuestDebt(tx.fromRawGuestName, tx.amount)
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  try {
    const fromId = selectedTx.value.fromId
    const toId = selectedTx.value.toId

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${fromId}_to_${toId}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('slips')
      .upload(fileName, file)
      
    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from('slips').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    const { error } = await supabase.from('payments').insert([{
      from_user_id: fromId,
      to_user_id: toId,
      amount: selectedTx.value.amount,
      receipt_url: publicUrl,
      status: 'PENDING'
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
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
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
