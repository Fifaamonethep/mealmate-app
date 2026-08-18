<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center mb-8">
      <router-link to="/" class="mr-4 p-2 bg-white/50 dark:bg-gray-800/50 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm">
        <ArrowLeft class="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </router-link>
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Add New Expense</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Log a new meal to split with friends.</p>
      </div>
    </div>

    <!-- AI Scanner Banner -->
    <div @click="handleScan" class="mb-8 relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-6 shadow-lg shadow-primary-500/30 text-white cursor-pointer group hover:scale-[1.02] transition-transform active:scale-95">
      <div class="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Scan class="w-48 h-48 -mr-10 -mt-10" />
      </div>
      <div class="relative z-10 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold mb-1 flex items-center"><Sparkles class="w-5 h-5 mr-2" /> AI Smart Scan</h2>
          <p class="text-primary-100 text-sm">Upload receipt to auto-fill amount.</p>
        </div>
        <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
          <Camera class="w-6 h-6 text-white" v-if="!isScanning" />
          <Loader2 class="w-6 h-6 text-white animate-spin" v-else />
        </div>
      </div>
    </div>

    <form @submit.prevent="saveMeal" class="space-y-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-3xl p-6 shadow-sm">
      
      <!-- Basic Details -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Meal Title</label>
          <input v-model="form.title" type="text" placeholder="e.g. Friday Sushi" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" required>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Total Amount (฿)</label>
          <input v-model.number="form.totalAmount" type="number" step="0.01" placeholder="0.00" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white text-2xl font-bold" required>
        </div>
      </div>

      <!-- Toggles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        
        <!-- Payer Toggle -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Payer Type</label>
          <div class="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
            <button type="button" @click="form.payerType = 'single'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.payerType === 'single' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">Single</button>
            <button type="button" @click="form.payerType = 'multi'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.payerType === 'multi' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">Multi-Payer</button>
          </div>
        </div>

        <!-- Split Toggle -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Split Method</label>
          <div class="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
            <button type="button" @click="form.splitMethod = 'equal'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.splitMethod === 'equal' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">Equal</button>
            <button type="button" @click="form.splitMethod = 'custom'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.splitMethod === 'custom' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">Custom</button>
          </div>
        </div>

      </div>

      <div class="pt-6">
        <button type="submit" :disabled="isSaving" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-transform active:scale-95 text-lg flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed">
          <Loader2 v-if="isSaving" class="w-5 h-5 mr-2 animate-spin" />
          <Utensils v-else class="w-5 h-5 mr-2" />
          {{ isSaving ? 'Saving...' : 'Create Meal' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, Camera, Sparkles, Scan, Loader2, Utensils } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { parseReceiptOCR } from '../utils/ocrHandler.js'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isScanning = ref(false)
const isSaving = ref(false)
const form = ref({
  title: '',
  totalAmount: null,
  payerType: 'single', // single, multi
  splitMethod: 'equal' // equal, custom
})

const handleScan = async () => {
  if (isScanning.value) return;
  isScanning.value = true;
  try {
    const data = await parseReceiptOCR(new File([""], "receipt.jpg"), { cropped: false })
    form.value.totalAmount = data.total
  } catch (error) {
    if (error.message === 'OCR_FAILED_SUGGEST_CROP') {
      alert("AI Failed to parse the receipt after multiple retries. Please crop the image to the total amount and try again.")
    } else {
      alert("Error: " + error.message)
    }
  } finally {
    isScanning.value = false;
  }
}

const saveMeal = async () => {
  if (!authStore.user?.id) {
    alert("Please select a user from the Home page first!")
    return
  }
  
  isSaving.value = true
  try {
    // MVP Logic: Fetch all users, assume equal split among everyone for Demo
    const { data: users } = await supabase.from('profiles').select('id')
    const splitAmount = form.value.totalAmount / users.length
    
    // Group ID we created in SQL
    const groupId = '99999999-9999-9999-9999-999999999999'

    const expenseRecords = users.map(u => ({
      group_id: groupId,
      user_id: u.id,
      title: form.value.title,
      paid: u.id === authStore.user.id ? form.value.totalAmount : 0,
      actual_cost: splitAmount
    }))

    const { error } = await supabase.from('expenses').insert(expenseRecords)
    if (error) throw error

    alert("Meal saved to Live Database! Debts have been updated.")
    router.push('/debts')
  } catch (err) {
    alert("Error saving meal: " + err.message)
  } finally {
    isSaving.value = false
  }
}
</script>
