<template>
  <div class="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fade-in">
    <div class="bg-white dark:bg-[#111827] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-[2rem] shadow-2xl flex flex-col relative animate-slide-up">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#111827] flex-shrink-0 sm:rounded-t-[2rem]">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <div class="w-6 h-6 rounded-full border-2 border-primary-500 text-primary-500 flex items-center justify-center mr-2">
            <Plus class="w-4 h-4" />
          </div>
          {{ isEditing ? 'Edit Meal & Split Expense' : 'Create Meal & Split Expense' }}
        </h3>
        <button @click="router.back()" class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        
        <!-- Meal Title & Location & Date -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Meal Title / Name *</label>
            <input v-model="form.title" type="text" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800" placeholder="E.g. Dinner, Pizza, Grab...">
          </div>
          
          <div class="flex space-x-4">
            <div class="flex-1">
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <MapPin class="w-3 h-3 mr-1 text-primary-500" /> Location
              </label>
              <input v-model="form.location" type="text" class="input-field rounded-xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 text-sm" placeholder="Restaurant name...">
            </div>
            <div class="flex-1">
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Calendar class="w-3 h-3 mr-1 text-primary-500" /> Date
              </label>
              <input v-model="form.date" type="date" class="input-field rounded-xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 text-sm">
            </div>
          </div>
        </div>

        <!-- Total Price & Currency -->
        <div class="flex space-x-4">
          <div class="flex-[2]">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Price *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 dark:text-gray-400">{{ currencySymbol }}</span>
              <input v-model="displayAmount" @input="onAmountInput" type="text" inputmode="decimal" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 pl-10 font-bold text-lg" placeholder="0">
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Currency</label>
            <select v-model="form.currency" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 font-bold">
              <option value="LAK">LAK</option>
              <option value="THB">THB</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <!-- Select Group -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Select Group (Optional)</label>
            <router-link to="/groups" class="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center">
              <Plus class="w-3 h-3 mr-0.5" /> Create Group
            </router-link>
          </div>
          <select v-model="form.groupId" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 text-sm">
            <option value="">-- No Group (Individual) --</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
        </div>

        <!-- Who paid upfront? -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Who paid upfront for the bill?</label>
          <div class="flex bg-gray-100 dark:bg-[#0f172a] rounded-2xl p-1 border border-gray-200 dark:border-gray-800">
            <button @click="form.payerType = 'single'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.payerType === 'single' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">1 Person paid all</button>
            <button @click="form.payerType = 'multi'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.payerType === 'multi' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">Multiple people</button>
          </div>
          
          <!-- Single Payer -->
          <select v-if="form.payerType === 'single'" v-model="form.payerId" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 mt-3 text-sm">
            <option :value="authStore.user?.id">{{ authStore.user?.fullName }} (You)</option>
            <option v-for="member in groupMembers" :key="member.id" :value="member.id" v-show="member.id !== authStore.user?.id">
              {{ member.name }}
            </option>
          </select>

          <!-- Multi Payer -->
          <div v-else class="mt-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
             <div class="flex justify-between items-center mb-3">
               <span class="text-xs font-bold text-gray-500">Enter amounts paid:</span>
               <span :class="['text-xs font-bold', remainingMultiPayerAmount === 0 ? 'text-green-500' : 'text-red-500']">
                 Missing: {{ remainingMultiPayerAmount.toLocaleString() }}
               </span>
             </div>
             
             <div v-for="payer in potentialPayers" :key="payer.id" class="flex justify-between items-center mb-2 last:mb-0">
               <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ payer.name }}</span>
               <input v-model.number="payer.amount_paid" type="number" placeholder="0" class="w-24 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-right font-bold focus:ring-2 focus:ring-primary-500 outline-none">
             </div>
          </div>
        </div>

        <!-- Participants -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <Users class="w-4 h-4 mr-2 text-primary-500" /> Who's sharing the cost? ({{ participants.length }})
            </label>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-3">
            <div v-for="(p, index) in participants" :key="index" class="flex items-center p-2 pr-4 bg-gray-100 dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800">
              <div class="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center mr-2 text-primary-800 dark:text-white font-bold text-xs">
                {{ p.name?.charAt(0) || 'U' }}
              </div>
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ p.name }} <span v-if="p.isGuest" class="text-xs text-gray-400 font-normal">(Guest)</span></span>
              <button v-if="p.id !== authStore.user?.id" @click="removeParticipant(index)" class="ml-3 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"><X class="w-3 h-3"/></button>
            </div>
          </div>

          <div class="flex space-x-2">
            <input v-model="newGuestName" @keyup.enter="addGuest" type="text" placeholder="Type a guest name (e.g. Mom, Boss)" class="input-field rounded-xl w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm">
            <button @click="addGuest" class="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl font-bold text-sm whitespace-nowrap transition-transform active:scale-95">+ Add</button>
          </div>
        </div>

        <!-- Split Method -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">How to split the cost?</label>
          <div class="flex bg-gray-100 dark:bg-[#0f172a] rounded-2xl p-1 border border-gray-200 dark:border-gray-800 mb-4">
            <button @click="form.splitMethod = 'equal'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.splitMethod === 'equal' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">Equal Split</button>
            <button @click="form.splitMethod = 'custom'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.splitMethod === 'custom' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">Custom Amounts</button>
          </div>
          
          <!-- Split Breakdown -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-4 border border-gray-200 dark:border-gray-800">
            <div class="flex justify-between items-center mb-3">
              <p class="text-xs font-bold text-gray-500 dark:text-primary-400">Breakdown:</p>
              <p v-if="form.splitMethod === 'custom'" :class="['text-xs font-bold', remainingCustomAmount === 0 ? 'text-green-500' : 'text-red-500']">
                Remaining: {{ remainingCustomAmount.toLocaleString() }}
              </p>
            </div>
            
            <div v-for="(p, index) in participants" :key="index" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ p.name }}</span>
              </div>
              
              <span v-if="form.splitMethod === 'equal'" class="text-sm font-bold text-gray-500 dark:text-gray-400">
                Owes {{ ((form.totalAmount || 0) / Math.max(1, participants.length)).toLocaleString('en-US', {maximumFractionDigits:2}) }}
              </span>
              <div v-else class="flex items-center space-x-2">
                <input v-model.number="p.amount_owed" type="number" class="w-24 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-right font-bold focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0">
              </div>
            </div>
          </div>
        </div>

        <!-- Meal Receipt / Bill Photo -->
        <div>
          <label class="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Camera class="w-4 h-4 mr-2 text-primary-500" /> Attach Receipt Photo (Optional)
          </label>
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-4 border border-gray-200 dark:border-gray-800 flex items-center space-x-4">
            <div class="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden flex-shrink-0 relative group">
              <img v-if="receiptImage" :src="receiptImage" class="w-full h-full object-cover">
              <Image v-else class="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <label class="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors mb-1 shadow-sm">
                <Camera class="w-4 h-4 mr-2" /> Upload Receipt
                <input type="file" class="hidden" accept="image/*" @change="onReceiptSelect">
              </label>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end items-center space-x-4 bg-white dark:bg-[#111827] flex-shrink-0 sm:rounded-b-[2rem]">
        <button @click="router.back()" class="text-gray-500 dark:text-gray-400 font-bold hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Cancel</button>
        <button @click="saveMeal" :disabled="isSaving || !form.title || !form.totalAmount" class="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-transform active:scale-95 flex items-center disabled:opacity-50">
          <Loader2 v-if="isSaving" class="w-5 h-5 mr-2 animate-spin" />
          <Receipt v-else class="w-5 h-5 mr-2" />
          {{ isEditing ? 'Update & Split' : 'Save & Split' }}
        </button>
      </div>

    </div>

    <!-- Modals -->
    <transition name="fade">
      <div v-if="showSuccessModal" class="absolute inset-0 z-[200] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center rounded-[2rem]">
        <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Check class="w-10 h-10 text-green-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
        <p class="text-gray-500 font-medium">Meal saved successfully.</p>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="errorMessage" class="absolute inset-0 z-[200] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center rounded-[2rem] p-6 text-center">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <X class="w-10 h-10 text-red-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
        <p class="text-red-500 font-medium mb-6">{{ errorMessage }}</p>
        <button @click="errorMessage = ''" class="px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold">Try Again</button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useNotificationsStore } from '../stores/notificationsStore'
import { supabase } from '../lib/supabase'
import { Plus, X, Camera, Users, Receipt, Loader2, Image, MapPin, Calendar, Check } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notifStore = useNotificationsStore()

const isSaving = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref('')
const groups = ref([])
const receiptImage = ref(null)
const isEditing = ref(false)
const editMealId = ref(null)

const form = ref({
  title: '',
  date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  location: '',
  totalAmount: null,
  currency: 'LAK',
  groupId: '',
  payerType: 'single',
  payerId: authStore.user?.id || '',
  splitMethod: 'equal'
})

const currencySymbol = computed(() => {
  switch (form.value.currency) {
    case 'THB': return '฿'
    case 'USD': return '$'
    case 'LAK': default: return '₭'
  }
})

const displayAmount = ref('')

const onAmountInput = (e) => {
  let val = e.target.value.replace(/[^\d.]/g, '')
  const parts = val.split('.')
  if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('')
  
  const parsed = parseFloat(val)
  form.value.totalAmount = isNaN(parsed) ? null : parsed

  if (val === '') { displayAmount.value = ''; return; }
  
  const intPart = parseInt(parts[0], 10)
  let formatted = isNaN(intPart) ? '' : intPart.toLocaleString('en-US')
  if (parts.length > 1) formatted += '.' + parts[1]
  
  displayAmount.value = formatted
}

watch(() => form.value.totalAmount, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    const currentParsed = parseFloat(displayAmount.value.replace(/,/g, ''))
    if (currentParsed !== newVal && !displayAmount.value.endsWith('.')) {
      displayAmount.value = newVal.toLocaleString('en-US')
    }
  } else {
    displayAmount.value = ''
  }
}, { immediate: true })

const groupMembers = ref([])
const potentialPayers = ref([
  { id: authStore.user?.id, name: authStore.user?.fullName + ' (You)', amount_paid: 0 }
])

const participants = ref([
  { id: authStore.user?.id, name: authStore.user?.fullName, isGuest: false, amount_owed: 0 }
])

onMounted(async () => {
  try {
    const { data } = await supabase.from('groups').select('id, name')
    groups.value = data || []
    
    if (route.query.editMealId) {
      isEditing.value = true
      editMealId.value = route.query.editMealId
      
      const { data: mealData, error: mealErr } = await supabase.from('meals').select('*').eq('id', editMealId.value).single()
      if (mealErr) throw mealErr

      // Privacy Check: Only participants, payers, creator, or admin can view/edit
      const { data: partsData } = await supabase.from('meal_participants').select('*, profiles:user_id(full_name)').eq('meal_id', editMealId.value)
      const { data: payersData } = await supabase.from('meal_payers').select('*, profiles(full_name)').eq('meal_id', editMealId.value)
      
      const isCreator = mealData.created_by === authStore.user?.id
      const isAdmin = authStore.user?.role === 'admin'
      const isParticipant = partsData && partsData.some(p => p.user_id === authStore.user?.id)
      const isPayer = payersData && payersData.some(p => p.user_id === authStore.user?.id)
      
      if (!isCreator && !isAdmin && !isParticipant && !isPayer) {
         errorMessage.value = "You don't have permission to view or edit this meal because you were not part of it."
         setTimeout(() => router.back(), 3000)
         return
      }

      form.value.title = mealData.title
      form.value.date = mealData.date || new Date().toISOString().split('T')[0]
      form.value.location = mealData.location || ''
      form.value.totalAmount = parseFloat(mealData.total_cost)
      form.value.currency = mealData.currency
      form.value.groupId = mealData.group_id || ''
      form.value.payerId = mealData.payer_id || authStore.user?.id
      form.value.payerType = mealData.payer_type || 'single'
      form.value.splitMethod = mealData.split_method
      if (mealData.receipt_url) receiptImage.value = mealData.receipt_url

      // Load old meal_payers (V2)
      if (payersData && payersData.length > 0) {
         form.value.payerType = payersData.length > 1 ? 'multi' : 'single'
         if (form.value.payerType === 'single') {
            form.value.payerId = payersData[0].user_id
         }
      }

      if (partsData && partsData.length > 0) {
        participants.value = partsData.map(p => ({
          id: p.user_id,
          name: p.user_id ? p.profiles?.full_name : p.guest_name,
          isGuest: !p.user_id,
          amount_owed: parseFloat(p.amount_owed)
        }))
      }
    } else if (route.query.groupId) {
      form.value.groupId = route.query.groupId
    }
  } catch (err) {
    console.error("Failed to load data", err)
  }
})

watch(() => form.value.groupId, async (newGroupId, oldGroupId) => {
  if (isEditing.value && oldGroupId === undefined) return // Skip wiping participants on initial load
  
  participants.value = participants.value.filter(p => p.isGuest || p.id === authStore.user?.id)
  groupMembers.value = []
  
  potentialPayers.value = [
    { id: authStore.user?.id, name: authStore.user?.fullName + ' (You)', amount_paid: 0 }
  ]

  if (newGroupId) {
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, profiles(full_name)')
      .eq('group_id', newGroupId)
      
    if (members && members.length > 0) {
      members.forEach(m => {
        const memberObj = { id: m.user_id, name: m.profiles?.full_name, isGuest: false, amount_owed: 0 }
        groupMembers.value.push(memberObj)
        if (!participants.value.some(p => p.id === m.user_id)) participants.value.push(memberObj)
        if (!potentialPayers.value.some(p => p.id === m.user_id)) {
           potentialPayers.value.push({ id: m.user_id, name: m.profiles?.full_name, amount_paid: 0 })
        }
      })
    }
  }
})

const remainingCustomAmount = computed(() => {
  const total = form.value.totalAmount || 0;
  const currentSum = participants.value.reduce((sum, p) => sum + (p.amount_owed || 0), 0);
  return total - currentSum;
})

const remainingMultiPayerAmount = computed(() => {
  const total = form.value.totalAmount || 0;
  const currentSum = potentialPayers.value.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  return total - currentSum;
})

const receiptFile = ref(null)
const newGuestName = ref('')

const addGuest = () => {
  if (newGuestName.value.trim()) {
    participants.value.push({ id: null, name: newGuestName.value.trim(), isGuest: true, amount_owed: 0 })
    newGuestName.value = ''
  }
}

const removeParticipant = (index) => {
  participants.value.splice(index, 1)
}

const onReceiptSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    receiptFile.value = file
    receiptImage.value = URL.createObjectURL(file)
  }
}

const saveMeal = async () => {
  if (!authStore.user?.id) return
  isSaving.value = true
  
  try {
    let receiptUrl = null

    // 1. Upload receipt
    if (receiptFile.value) {
      const fileExt = receiptFile.value.name.split('.').pop()
      const fileName = `${Date.now()}_${authStore.user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile.value)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName)
      receiptUrl = data.publicUrl
    }

    // 2. Insert or Update Meal
    const mealPayload = {
      title: form.value.title,
      date: form.value.date,
      location: form.value.location,
      total_cost: form.value.totalAmount,
      currency: form.value.currency,
      group_id: form.value.groupId || null,
      payer_id: form.value.payerType === 'single' ? form.value.payerId : null,
      payer_type: form.value.payerType,
      split_method: form.value.splitMethod,
      created_by: authStore.user.id
    }
    if (receiptUrl) mealPayload.receipt_url = receiptUrl

    let mealId = null
    if (isEditing.value) {
      const { data: updateData, error: updateError } = await supabase.from('meals').update(mealPayload).eq('id', editMealId.value).select().single()
      if (updateError) throw updateError
      mealId = updateData.id
      await supabase.from('meal_participants').delete().eq('meal_id', mealId)
      await supabase.from('meal_payers').delete().eq('meal_id', mealId)
    } else {
      const { data: insertData, error: insertError } = await supabase.from('meals').insert(mealPayload).select().single()
      if (insertError) throw insertError
      mealId = insertData.id
    }

    // 3. Handle Payers (V2 Logic)
    let payersToInsert = []
    if (form.value.payerType === 'single') {
       payersToInsert.push({ meal_id: mealId, user_id: form.value.payerId, amount_paid: form.value.totalAmount })
    } else {
       if (remainingMultiPayerAmount.value !== 0) {
          throw new Error(`The amounts paid upfront do not equal the total cost. Missing: ${remainingMultiPayerAmount.value}`)
       }
       payersToInsert = potentialPayers.value
          .filter(p => p.amount_paid > 0)
          .map(p => ({ meal_id: mealId, user_id: p.id, amount_paid: p.amount_paid }))
    }
    const { error: payerErr } = await supabase.from('meal_payers').insert(payersToInsert)
    if (payerErr) throw payerErr

    // 4. Handle Participants
    let finalParticipants = [...participants.value]
    if (form.value.splitMethod === 'custom') {
      if (Math.abs(remainingCustomAmount.value) > 0.01) {
        throw new Error(`Custom split amounts must equal the total price. Missing: ${remainingCustomAmount.value}`)
      }
    }
    const equalSplitAmount = form.value.totalAmount / Math.max(1, finalParticipants.length)
    const pRecords = finalParticipants.map(p => ({
      meal_id: mealId,
      user_id: p.id,
      guest_name: p.isGuest ? p.name : null,
      amount_owed: form.value.splitMethod === 'custom' ? (p.amount_owed || 0) : equalSplitAmount
    }))

    const { error: partError } = await supabase.from('meal_participants').insert(pRecords)
    if (partError) throw partError

    // Send notifications
    for (const p of pRecords) {
      if (p.user_id && p.user_id !== authStore.user.id) {
        await notifStore.sendNotification(
          p.user_id,
          'MEAL_ADDED',
          `<b>${authStore.user?.user_metadata?.full_name || authStore.user?.fullName || 'Someone'}</b> ${isEditing.value ? 'updated' : 'added'} the meal <b>${form.value.title}</b>. You owe <b>${parseFloat(p.amount_owed).toLocaleString()} ${form.value.currency}</b>.`,
          mealId
        )
      }
    }

    showSuccessModal.value = true
    setTimeout(() => { router.back() }, 1500)
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 10px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
