<template>
  <div class="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fade-in">
    <div class="bg-white dark:bg-[#111827] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-[2rem] shadow-2xl flex flex-col relative animate-slide-up">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#111827] flex-shrink-0 sm:rounded-t-[2rem]">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <div class="w-6 h-6 rounded-full border-2 border-primary-500 text-primary-500 flex items-center justify-center mr-2">
            <Plus class="w-4 h-4" />
          </div>
          Create Meal & Split Expense
        </h3>
        <button @click="router.back()" class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        
        <!-- Meal Title -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Meal Title *</label>
          <input v-model="form.title" type="text" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800" placeholder="E.g. Dinner, Pizza...">
        </div>

        <!-- Total Price -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Price * *</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 dark:text-gray-400">₭</span>
            <input v-model.number="form.totalAmount" type="number" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 pl-10 font-bold text-lg" placeholder="0">
          </div>
        </div>

        <!-- Currency -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Currency</label>
          <select v-model="form.currency" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
            <option value="LAK">LAK (Lao Kip)</option>
            <option value="THB">THB (Thai Baht)</option>
            <option value="USD">USD (US Dollar)</option>
          </select>
        </div>

        <!-- Select Group -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Select Group (Optional)</label>
            <router-link to="/groups" class="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center">
              <Plus class="w-3 h-3 mr-0.5" /> + Create Group
            </router-link>
          </div>
          <select v-model="form.groupId" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 text-sm">
            <option value="">-- All Groups --</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
        </div>

        <!-- Who paid upfront? -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Who paid upfront for the bill?</label>
          <div class="flex bg-gray-100 dark:bg-[#0f172a] rounded-2xl p-1 border border-gray-200 dark:border-gray-800">
            <button @click="form.payerType = 'single'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.payerType === 'single' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">1 Person paid all</button>
            <button @click="form.payerType = 'multi'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.payerType === 'multi' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">Multiple people paid</button>
          </div>
          <select v-if="form.payerType === 'single'" v-model="form.payerId" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 mt-3 text-sm">
            <option :value="authStore.user?.id">{{ authStore.user?.fullName }} (You)</option>
            <!-- Add other members if group is selected -->
          </select>
        </div>

        <!-- Meal Receipt / Bill Photo -->
        <div>
          <label class="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Camera class="w-4 h-4 mr-2 text-primary-500" /> Meal Receipt / Bill Photo
          </label>
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-4 border border-gray-200 dark:border-gray-800 flex items-center space-x-4">
            <div class="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden flex-shrink-0 relative group">
              <img v-if="receiptImage" :src="receiptImage" class="w-full h-full object-cover">
              <Image v-else class="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <label class="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors mb-1">
                <Camera class="w-4 h-4 mr-2" /> Take / Upload Receipt
                <input type="file" class="hidden" accept="image/*" @change="onReceiptSelect">
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Snap or upload receipt/bill photo to attach to meal</p>
            </div>
          </div>
        </div>

        <!-- Participants -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
              <Users class="w-4 h-4 mr-2 text-primary-500" /> Participants ({{ participants.length }})
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
            <button @click="addGuest" class="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl font-bold text-sm whitespace-nowrap transition-transform active:scale-95">+ Add Guest</button>
          </div>
          <p v-if="form.groupId" class="text-xs text-gray-500 mt-2 italic">Note: Group members will also be automatically included in the split.</p>
        </div>

        <!-- Split Method -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Split Method</label>
          <div class="flex bg-gray-100 dark:bg-[#0f172a] rounded-2xl p-1 border border-gray-200 dark:border-gray-800 mb-4">
            <button @click="form.splitMethod = 'equal'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.splitMethod === 'equal' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">Equal Split</button>
            <button @click="form.splitMethod = 'custom'" :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all', form.splitMethod === 'custom' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400']">Custom Split</button>
          </div>
          
          <div class="flex justify-between items-center mb-6">
            <span class="text-sm text-gray-500 dark:text-gray-400">Each pays:</span>
            <span class="text-lg font-bold text-green-600 dark:text-green-400">{{ ((form.totalAmount || 0) / Math.max(1, participants.length)).toLocaleString() }} {{ form.currency }}</span>
          </div>

          <!-- Settlement Result -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-4 border border-gray-200 dark:border-gray-800">
            <p class="text-xs font-bold text-gray-500 dark:text-primary-400 mb-3">Automatic Debt Settlement Result:</p>
            <div v-for="p in participants" :key="p.name" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-800 dark:text-white font-bold text-xs">
                  {{ p.name?.charAt(0) || 'U' }}
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ p.name }} <span v-if="p.isGuest" class="text-xs text-gray-400">(Guest)</span></span>
              </div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Owes {{ ((form.totalAmount || 0) / Math.max(1, participants.length)).toLocaleString() }}</span>
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
          Create & Split Meal
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Plus, X, Camera, Users, Receipt, Loader2, Image } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const isSaving = ref(false)
const groups = ref([])
const receiptImage = ref(null)

const form = ref({
  title: '',
  totalAmount: null,
  currency: 'LAK',
  groupId: '',
  payerType: 'single',
  payerId: authStore.user?.id || '',
  splitMethod: 'equal'
})

onMounted(async () => {
  try {
    const { data } = await supabase.from('groups').select('id, name')
    groups.value = data || []
  } catch (err) {
    console.error("Failed to load groups", err)
  }
})

const receiptFile = ref(null)
const newGuestName = ref('')
const participants = ref([
  { id: authStore.user?.id, name: authStore.user?.fullName, isGuest: false }
])

const addGuest = () => {
  if (newGuestName.value.trim()) {
    participants.value.push({
      id: null,
      name: newGuestName.value.trim(),
      isGuest: true
    })
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

    // 1. Upload receipt if exists
    if (receiptFile.value) {
      const fileExt = receiptFile.value.name.split('.').pop()
      const fileName = `${Date.now()}_${authStore.user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile.value)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName)
      receiptUrl = data.publicUrl
    }

    // 2. Insert Meal
    const { data: mealData, error: mealError } = await supabase.from('meals').insert({
      title: form.value.title,
      total_cost: form.value.totalAmount,
      currency: form.value.currency,
      group_id: form.value.groupId || null,
      payer_id: form.value.payerId,
      payer_type: form.value.payerType,
      split_method: form.value.splitMethod,
      receipt_url: receiptUrl,
      created_by: authStore.user.id
    }).select().single()

    if (mealError) throw mealError

    // 3. Prepare Participants
    let finalParticipants = [...participants.value.filter(p => p.isGuest)] // Keep manually added guests
    
    if (form.value.groupId) {
      // Fetch group members
      const { data: members } = await supabase.from('group_members').select('user_id, profiles(full_name)').eq('group_id', form.value.groupId)
      if (members && members.length > 0) {
        members.forEach(m => {
          if (!finalParticipants.some(p => p.id === m.user_id)) {
            finalParticipants.push({ id: m.user_id, name: m.profiles?.full_name, isGuest: false })
          }
        })
      } else {
        if (!finalParticipants.some(p => p.id === authStore.user.id)) finalParticipants.push({ id: authStore.user.id, name: authStore.user.fullName, isGuest: false })
      }
    } else {
      finalParticipants = [...participants.value] // Solo meal + guests
    }

    const splitAmount = form.value.totalAmount / Math.max(1, finalParticipants.length)

    const pRecords = finalParticipants.map(p => ({
      meal_id: mealData.id,
      user_id: p.id,
      guest_name: p.isGuest ? p.name : null,
      amount_owed: splitAmount
    }))

    const { error: partError } = await supabase.from('meal_participants').insert(pRecords)
    if (partError) throw partError

    alert("Meal Created successfully!")
    router.push('/meals')
  } catch (err) {
    alert("Error saving meal: " + err.message)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
</style>
