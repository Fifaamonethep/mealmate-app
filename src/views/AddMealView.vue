<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center mb-8">
      <button @click="router.back()" class="mr-4 p-2 bg-white/50 dark:bg-gray-800/50 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm">
        <ArrowLeft class="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('addMeal.title') }}</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ $t('addMeal.subtitle') }}</p>
      </div>
    </div>

    <!-- AI Scanner Banner -->
    <div @click="handleScan" class="mb-8 relative overflow-hidden bg-gradient-to-r from-primary-600 to-emerald-600 rounded-3xl p-6 shadow-lg shadow-primary-500/30 text-white cursor-pointer group hover:scale-[1.02] transition-transform active:scale-95">
      <div class="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Scan class="w-48 h-48 -mr-10 -mt-10" />
      </div>
      <div class="relative z-10 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold mb-1 flex items-center"><Sparkles class="w-5 h-5 mr-2" /> {{ $t('addMeal.aiScan') }}</h2>
          <p class="text-primary-100 text-sm">{{ $t('addMeal.aiScanDesc') }}</p>
        </div>
        <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
          <Camera class="w-6 h-6 text-white" v-if="!isScanning" />
          <Loader2 class="w-6 h-6 text-white animate-spin" v-else />
        </div>
      </div>
    </div>

    <form @submit.prevent="saveMeal" class="space-y-6 card p-6">
      
      <!-- Basic Details -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('addMeal.mealTitle') }}</label>
          <input v-model="form.title" type="text" :placeholder="$t('addMeal.titlePlaceholder')" class="input-field" required>
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('addMeal.totalAmount') }}</label>
          <input v-model.number="form.totalAmount" type="number" step="0.01" placeholder="0.00" class="input-field text-2xl font-bold" required>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('addMeal.selectGroup') }}</label>
          <select v-model="form.groupId" class="input-field" required>
            <option value="" disabled>{{ $t('addMeal.groupPlaceholder') }}</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
          <p v-if="groups.length === 0" class="text-xs text-red-500 mt-1">{{ $t('addMeal.noGroupsError') }}</p>
        </div>
      </div>

      <!-- Toggles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        
        <!-- Payer Toggle -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{{ $t('addMeal.payerType') }}</label>
          <div class="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
            <button type="button" @click="form.payerType = 'single'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.payerType === 'single' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">{{ $t('addMeal.payerSingle') }}</button>
            <button type="button" @click="form.payerType = 'multi'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.payerType === 'multi' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">{{ $t('addMeal.payerMulti') }}</button>
          </div>
        </div>

        <!-- Split Toggle -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{{ $t('addMeal.splitMethod') }}</label>
          <div class="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
            <button type="button" @click="form.splitMethod = 'equal'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.splitMethod === 'equal' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">{{ $t('addMeal.splitEqual') }}</button>
            <button type="button" @click="form.splitMethod = 'custom'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-all', form.splitMethod === 'custom' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">{{ $t('addMeal.splitCustom') }}</button>
          </div>
        </div>

      </div>

      <div class="pt-6">
        <button type="submit" :disabled="isSaving || !form.groupId" class="btn-primary w-full flex justify-center items-center text-lg py-4">
          <Loader2 v-if="isSaving" class="w-5 h-5 mr-2 animate-spin" />
          <Utensils v-else class="w-5 h-5 mr-2" />
          {{ isSaving ? $t('addMeal.saving') : $t('addMeal.createMeal') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, Camera, Sparkles, Scan, Loader2, Utensils } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { parseReceiptOCR } from '../utils/ocrHandler.js'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const isScanning = ref(false)
const isSaving = ref(false)
const groups = ref([])

const form = ref({
  title: '',
  totalAmount: null,
  groupId: '',
  payerType: 'single',
  splitMethod: 'equal'
})

onMounted(async () => {
  try {
    const { data } = await supabase.from('groups').select('id, name')
    groups.value = data || []
    if (groups.value.length > 0) {
      form.value.groupId = groups.value[0].id
    }
  } catch (err) {
    console.error("Failed to load groups", err)
  }
})

const handleScan = async () => {
  if (isScanning.value) return;
  isScanning.value = true;
  try {
    const data = await parseReceiptOCR(new File([""], "receipt.jpg"), { cropped: false })
    form.value.totalAmount = data.total
  } catch (error) {
    if (error.message === 'OCR_FAILED_SUGGEST_CROP') {
      alert(t('addMeal.ocrCropWarning'))
    } else {
      alert("Error: " + error.message)
    }
  } finally {
    isScanning.value = false;
  }
}

const saveMeal = async () => {
  if (!authStore.user?.id) {
    alert(t('addMeal.userRequired'))
    return
  }
  
  isSaving.value = true
  try {
    // MVP Logic: Fetch all users in this group. 
    // For now, since we don't have a group_members table, we'll split among ALL users to keep the demo working.
    // In a real app, we would query group_members where group_id = form.value.groupId.
    const { data: users } = await supabase.from('profiles').select('id')
    const splitAmount = form.value.totalAmount / users.length
    
    const expenseRecords = users.map(u => ({
      group_id: form.value.groupId,
      user_id: u.id,
      title: form.value.title,
      paid: u.id === authStore.user.id ? form.value.totalAmount : 0,
      actual_cost: splitAmount
    }))

    const { error } = await supabase.from('expenses').insert(expenseRecords)
    if (error) throw error

    alert(t('addMeal.success'))
    router.push('/debts')
  } catch (err) {
    alert("Error saving meal: " + err.message)
  } finally {
    isSaving.value = false
  }
}
</script>
