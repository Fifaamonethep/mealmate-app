<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
    
    <!-- Header -->
    <div class="flex items-center space-x-3 mb-2">
      <Utensils class="w-6 h-6 text-primary-500" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Meal List</h1>
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
      List of created meals and splitting methods
    </p>

    <!-- New Meal Button -->
    <router-link to="/add-meal" class="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl py-4 flex items-center justify-center text-lg font-bold shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-transform active:scale-95">
      <Plus class="w-5 h-5 mr-2" />
      + New Meal
    </router-link>

    <!-- Filters Card -->
    <div class="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm animate-slide-up space-y-4">
      
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search meals..." class="input-field rounded-2xl w-full pl-10 bg-gray-50 dark:bg-[#1e293b]/50 border-gray-200 dark:border-gray-800 text-sm">
      </div>

      <!-- Group Select -->
      <select class="input-field rounded-2xl w-full bg-gray-50 dark:bg-[#1e293b]/50 border-gray-200 dark:border-gray-800 text-sm">
        <option value="">-- All Groups --</option>
      </select>

      <!-- Date Filter -->
      <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <div class="flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0">
          <Calendar class="w-4 h-4 mr-1" />
          Filter by date:
        </div>
        <div class="flex items-center space-x-2 flex-1">
          <span class="text-xs text-gray-500">From:</span>
          <input type="text" placeholder="dd/mm/yyyy" class="input-field rounded-xl w-full bg-gray-50 dark:bg-[#1e293b]/50 border-gray-200 dark:border-gray-800 text-xs py-2">
        </div>
        <div class="flex items-center space-x-2 flex-1">
          <span class="text-xs text-gray-500">To:</span>
          <input type="text" placeholder="dd/mm/yyyy" class="input-field rounded-xl w-full bg-gray-50 dark:bg-[#1e293b]/50 border-gray-200 dark:border-gray-800 text-xs py-2">
        </div>
      </div>

    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
    </div>

    <!-- Meals List -->
    <div v-else class="space-y-4 animate-slide-up stagger-2">
      
      <!-- Empty State -->
      <div v-if="meals.length === 0" class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem]">
        <Utensils class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">No meals found.</p>
      </div>

      <!-- Meal Card -->
      <div v-for="meal in meals" :key="meal.id" class="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow">
        
        <!-- Receipt Image Box -->
        <div class="w-full h-32 sm:h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 overflow-hidden relative border border-gray-200 dark:border-gray-700">
          <img v-if="meal.receipt_url" :src="meal.receipt_url" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
             <Receipt class="w-8 h-8 mb-2 opacity-50" />
             <span class="text-xs font-bold uppercase tracking-widest opacity-50">No Receipt</span>
          </div>

          <!-- Group Pill Overlay -->
          <div v-if="meal.group_name" class="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg border border-white/10">
            <div class="w-5 h-5 rounded-full overflow-hidden bg-gray-700">
               <!-- Mock group avatar -->
               <Users class="w-3 h-3 m-1 text-gray-300" />
            </div>
            <span class="text-xs font-bold">{{ meal.group_name }}</span>
          </div>
        </div>

        <!-- Meal Details -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-primary-500 mb-1">{{ meal.title || 'Untitled Meal' }}</h3>
            <p class="text-2xl font-black text-green-600 dark:text-green-500 tracking-tight">{{ meal.total_cost?.toLocaleString() || 0 }} {{ meal.currency || 'LAK' }}</p>
          </div>
          <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700">
            {{ meal.split_method || 'Equal Split' }}
          </span>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/50">
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-white dark:border-gray-800">
               <img v-if="meal.payer_avatar" :src="meal.payer_avatar" class="w-full h-full object-cover">
               <User v-else class="w-3 h-3 text-gray-400 m-1.5" />
            </div>
            <span class="font-medium">Paid By <span class="font-bold text-gray-900 dark:text-gray-200">{{ meal.payer_name || 'Admin' }}</span></span>
          </div>
          <div class="flex items-center text-xs text-gray-500 dark:text-gray-500 font-medium">
            <Calendar class="w-3 h-3 mr-1" />
            {{ formatDate(meal.created_at) }}
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Utensils, Plus, Search, Calendar, Receipt, Users, User, Loader2 } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const isLoading = ref(true)
const meals = ref([])

onMounted(async () => {
  isLoading.value = true
  try {
    // For now, mock data if no meals table, or try to fetch expenses.
    // Our DB has 'expenses' but we usually group them by meal.
    // Let's just create a dummy layout with one mocked item matching the screenshot 
    // to show it works, then load real expenses if any.
    
    const { data: realMeals, error } = await supabase
      .from('meals')
      .select('*, profiles:payer_id(full_name, avatar_url), groups(name)')
      .order('created_at', { ascending: false })
    
    if (error) throw error

    if (realMeals && realMeals.length > 0) {
      meals.value = realMeals.map(m => ({
        id: m.id,
        title: m.title,
        total_cost: parseFloat(m.total_cost),
        currency: m.currency,
        split_method: m.split_method === 'equal' ? 'Equal Split' : 'Custom Split',
        group_name: m.groups?.name,
        payer_name: m.profiles?.full_name,
        payer_avatar: m.profiles?.avatar_url,
        created_at: m.created_at,
        receipt_url: m.receipt_url
      }))
    } else {
      meals.value = []
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
}
</script>
