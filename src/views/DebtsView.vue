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
              <QrCode class="w-4 h-4 mr-2" /> Pay / Upload Proof
            </button>
            
            <!-- Others Owe Me (normal user) -->
            <button v-if="debtType === 'others_owe' && !tx.fromIsGuest && tx.status === 'SLIP_SENT'" 
              @click="openReviewModal(tx)"
              class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-bold shadow-sm transition-transform active:scale-95 flex items-center">
              <Eye class="w-4 h-4 mr-2" /> Review Payment
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

    <!-- Send Payment Modal (I Owe) -->
    <transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closePaymentModal"></div>
        
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Settle Debt</h3>
            <button @click="closePaymentModal" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto custom-scrollbar flex-grow">
            <div class="text-center mb-6">
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Transfer exactly</p>
              <p class="text-4xl font-black text-primary-600 dark:text-primary-400">{{ selectedTx?.amount.toLocaleString() }} LAK</p>
              <p class="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">to {{ selectedTx?.to }}</p>
            </div>

            <!-- QR Code Section -->
            <div class="flex flex-col items-center mb-6">
              <div class="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 inline-block">
                <div v-if="qrCodeData" class="flex flex-col items-center">
                  <img v-if="qrCodeData.startsWith('http')" :src="qrCodeData" class="w-[200px] h-[200px] object-contain rounded-xl shadow-sm mb-4" alt="Payment QR" crossorigin="anonymous" />
                  <QrcodeVue v-else :value="qrCodeData" :size="200" level="H" id="payment-qr-canvas" class="mb-4" />
                  
                  <button @click.prevent="downloadQR" class="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-2 rounded-full text-xs font-bold shadow-lg flex items-center hover:scale-105 transition-transform whitespace-nowrap">
                    <Download class="w-4 h-4 mr-2" /> Save QR
                  </button>
                </div>
                <div v-else class="w-[200px] h-[200px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl font-bold text-sm">No QR Data</div>
              </div>
            </div>

            <!-- Text Note (Optional) -->
            <div class="mb-4">
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Note / Transaction Ref (Optional)</label>
              <input v-model="paymentNote" type="text" placeholder="e.g. Paid via PromptPay, forgot slip..." class="input-field rounded-xl w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm">
            </div>

            <!-- Slip Upload -->
            <div class="mb-6">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-300 dark:border-primary-800 rounded-2xl cursor-pointer bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group relative overflow-hidden">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud v-if="!paymentSlipFile" class="w-8 h-8 text-primary-400 mb-2 group-hover:text-primary-500 transition-colors" />
                  <Image v-else class="w-8 h-8 text-primary-500 mb-2" />
                  
                  <p v-if="!paymentSlipFile" class="text-sm text-primary-600 dark:text-primary-400 font-bold">Upload Transfer Slip</p>
                  <p v-else class="text-sm text-primary-600 font-bold">Image selected: {{ paymentSlipFile.name }}</p>
                  <p v-if="!paymentSlipFile" class="text-xs text-primary-400 mt-1">(Optional if Note is provided)</p>
                </div>
                <input type="file" class="hidden" @change="handleFileSelect" accept="image/*" />
              </label>
            </div>

            <button @click="submitPayment" :disabled="isUploading || (!paymentSlipFile && !paymentNote.trim())" class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center">
              <Loader2 v-if="isUploading" class="w-5 h-5 mr-2 animate-spin" />
              <CheckCircle2 v-else-if="uploadSuccess" class="w-5 h-5 mr-2" />
              {{ isUploading ? 'Submitting...' : uploadSuccess ? 'Submitted!' : 'Submit Payment' }}
            </button>

          </div>
        </div>
      </div>
    </transition>

    <!-- Review Payment Modal (Others Owe Me) -->
    <transition name="modal">
      <div v-if="isReviewModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeReviewModal"></div>
        
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
          
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Review Payment</h3>
            <button @click="closeReviewModal" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div class="p-6">
            <div class="mb-4 text-center">
              <p class="text-sm text-gray-500">Amount Sent</p>
              <p class="text-3xl font-black text-green-500">{{ selectedTx?.amount.toLocaleString() }} LAK</p>
              <p class="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">from {{ selectedTx?.from }}</p>
            </div>

            <div v-if="selectedTx?.note" class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
              <p class="text-xs font-bold text-gray-500 mb-1">Note / Reference:</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedTx.note }}</p>
            </div>

            <div v-if="selectedTx?.receiptUrl" class="mb-6">
              <p class="text-xs font-bold text-gray-500 mb-2">Attached Slip:</p>
              <div class="bg-gray-100 dark:bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
                <a :href="selectedTx.receiptUrl" target="_blank" class="w-full h-full">
                  <img :src="selectedTx.receiptUrl" class="w-full h-full object-contain hover:scale-105 transition-transform" />
                </a>
              </div>
            </div>
            <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-yellow-200 dark:border-yellow-800">
              <AlertCircle class="w-4 h-4 inline-block mr-1 -mt-1"/> No slip attached
            </div>

            <div class="flex space-x-3">
              <button @click="rejectPayment" class="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold transition-colors">
                Reject
              </button>
              <button @click="confirmPayment" class="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-[0_8px_30px_rgba(34,197,94,0.3)]">
                Confirm
              </button>
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
import { CreditCard, Share2, ArrowUpRight, ArrowDownLeft, Filter, QrCode, X, UploadCloud, Loader2, CheckCircle2, Clock, Check, Download, Eye, Image, AlertCircle } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import QrcodeVue from 'qrcode.vue'
import { generateLaoQR, injectAmountIntoEMVCo } from '../utils/laoQr'

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
       list = list.filter(tx => !tx.status || tx.status === 'UNPAID' || tx.status === 'PENDING' || tx.status === 'REJECTED')
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

// Modals State
const isModalOpen = ref(false)
const isReviewModalOpen = ref(false)
const selectedTx = ref(null)
const isUploading = ref(false)
const uploadSuccess = ref(false)
const qrCodeData = ref('')
const paymentSlipFile = ref(null)
const paymentNote = ref('')

// Open Modal to PAY (Debtor)
const openPaymentModal = async (tx) => {
  selectedTx.value = tx
  uploadSuccess.value = false
  isModalOpen.value = true
  qrCodeData.value = ''
  paymentSlipFile.value = null
  paymentNote.value = ''
  
  // Fetch Creditor's info (Phone number for LAO QR)
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('phone_number, qr_code_url')
      .eq('full_name', tx.to)
      .single()
      
    if (profiles && profiles.qr_code_url) {
      if (profiles.qr_code_url.startsWith('000201')) {
         qrCodeData.value = injectAmountIntoEMVCo(profiles.qr_code_url, tx.amount)
      } else {
         qrCodeData.value = profiles.qr_code_url
      }
    } else if (profiles && profiles.phone_number) {
      qrCodeData.value = generateLaoQR(profiles.phone_number, tx.amount)
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
    paymentSlipFile.value = null
    paymentNote.value = ''
  }, 300)
}

// Open Modal to REVIEW (Creditor)
const openReviewModal = (tx) => {
  selectedTx.value = tx
  isReviewModalOpen.value = true
}

const closeReviewModal = () => {
  isReviewModalOpen.value = false
  setTimeout(() => {
    selectedTx.value = null
  }, 300)
}

const downloadQR = async () => {
  if (!qrCodeData.value) return;
  const fileName = `Payment_QR_${selectedTx.value?.to || 'User'}.png`;

  if (qrCodeData.value.startsWith('http')) {
    try {
      const resp = await fetch(qrCodeData.value);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download image. Try taking a screenshot.');
    }
  } else {
    const canvas = document.getElementById('payment-qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    }
  }
}

const handleGuestPayment = async (tx) => {
  if (confirm(`Mark ${tx.amount} LAK as paid by ${tx.fromRawGuestName}? (Cash / Outside App)`)) {
    await debtsStore.settleGuestDebt(tx.fromRawGuestName, tx.amount)
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    paymentSlipFile.value = file
  }
}

const submitPayment = async () => {
  isUploading.value = true
  try {
    const fromId = selectedTx.value.fromId
    const toId = selectedTx.value.toId
    let publicUrl = null

    // 1. Upload Slip if selected
    if (paymentSlipFile.value) {
      const fileExt = paymentSlipFile.value.name.split('.').pop()
      const fileName = `${Date.now()}_${fromId}_to_${toId}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, paymentSlipFile.value)
        
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
      publicUrl = publicUrlData.publicUrl
    }

    // 2. Insert into Payments
    const { error } = await supabase.from('payments').insert([{
      from_user_id: fromId,
      to_user_id: toId,
      amount: selectedTx.value.amount,
      receipt_url: publicUrl,
      note: paymentNote.value.trim() || null,
      status: 'PENDING'
    }])

    if (error) throw error

    // 3. Send Notification to Creditor
    const { useNotificationsStore } = await import('../stores/notificationsStore')
    const notifStore = useNotificationsStore()
    await notifStore.sendNotification(
      toId,
      'PAYMENT_SENT',
      `<b>${authStore.user?.user_metadata?.full_name || authStore.user?.email || 'Someone'}</b> submitted a payment of ${selectedTx.value.amount.toLocaleString()} LAK.`,
    )

    uploadSuccess.value = true
    setTimeout(() => {
      if (selectedTx.value) {
         selectedTx.value.status = 'SLIP_SENT'
      }
      closePaymentModal()
    }, 1000)
  } catch (err) {
    alert("Error submitting payment: " + err.message)
    isUploading.value = false
  }
}

const confirmPayment = async () => {
  if (!selectedTx.value?.paymentId) return
  await debtsStore.verifyPayment(selectedTx.value.paymentId)
  closeReviewModal()
}

const rejectPayment = async () => {
  if (!selectedTx.value?.paymentId) return
  if (confirm("Are you sure you want to reject this payment?")) {
    await debtsStore.rejectPayment(selectedTx.value.paymentId)
    closeReviewModal()
  }
}

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
  width: 4px;
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
