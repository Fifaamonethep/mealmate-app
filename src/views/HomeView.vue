<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24 relative overflow-hidden min-h-screen">
    
    <SummaryPosterModal />

    <!-- Background Decorative Elements -->
    <div class="fixed bottom-0 left-0 right-0 h-64 z-[-1] opacity-20 pointer-events-none overflow-hidden">
      <div class="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[120%] h-64 bg-gradient-to-t from-red-500/30 via-yellow-500/20 to-transparent rounded-[100%] blur-3xl"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between animate-fade-in">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-primary-200 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center flex-shrink-0">
          <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" class="w-full h-full object-cover">
          <span v-else class="text-primary-700 dark:text-primary-400 font-bold text-lg">{{ authStore.user?.fullName?.charAt(0) || 'U' }}</span>
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('home.welcomeBack') }} 👋</p>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">{{ authStore.user?.fullName || 'User' }}</h1>
        </div>
      </div>
      <router-link to="/add-meal" class="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl px-5 py-2.5 font-bold shadow-lg shadow-primary-500/20 transition-transform active:scale-95 flex items-center text-sm">
        <Plus class="w-4 h-4 mr-1.5" /> Meals
      </router-link>
    </div>

    <!-- Net Balance Card -->
    <div class="bg-gray-50 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm animate-slide-up relative overflow-hidden">
      
      <!-- Top Row -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Wallet class="w-4 h-4" />
          <span>{{ $t('home.dashboard') }}</span>
        </div>
        <Sparkles class="w-5 h-5 text-yellow-500" />
      </div>

      <!-- Big Amount -->
      <h2 :class="['text-4xl font-black tracking-tight mb-6', debtsStore.myNetBalance >= 0 ? 'text-green-500' : 'text-red-500']">
        {{ debtsStore.myNetBalance > 0 ? '+' : '' }}{{ debtsStore.myNetBalance.toLocaleString() }} LAK
      </h2>

      <!-- Sub Cards -->
      <div class="flex space-x-4">
        <!-- I Owe -->
        <div class="flex-1 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 transition-transform hover:scale-[1.02]">
          <div class="flex items-center text-red-500 mb-1">
            <ArrowDownLeft class="w-4 h-4 mr-1.5" />
            <span class="text-xs font-bold uppercase tracking-wider">{{ $t('home.youOwe') }}</span>
          </div>
          <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ debtsStore.iOweTotal.toLocaleString() }} LAK</p>
        </div>
        
        <!-- Owed to Me -->
        <div class="flex-1 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-4 transition-transform hover:scale-[1.02]">
          <div class="flex items-center text-green-500 mb-1">
            <ArrowUpRight class="w-4 h-4 mr-1.5" />
            <span class="text-xs font-bold uppercase tracking-wider">{{ $t('home.youAreOwed') }}</span>
          </div>
          <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ debtsStore.owedToMeTotal.toLocaleString() }} LAK</p>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="mt-6 bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm animate-slide-up stagger-1">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center">
        <Sparkles class="w-4 h-4 mr-2 text-yellow-500" /> Balance Overview
      </h3>
      <apexchart type="bar" height="200" :options="chartOptions" :series="chartSeries"></apexchart>
    </div>

    <!-- Recent Activity Section -->
    <div class="animate-slide-up stagger-2 pt-2 mt-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center">
          <Utensils class="w-4 h-4 mr-2 text-gray-400" /> {{ $t('home.recentActivity') }}
        </h3>
        <router-link to="/meals" class="text-xs font-bold text-primary-500 flex items-center hover:text-primary-600 transition-colors">
          View All <ArrowRight class="w-3 h-3 ml-1" />
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="recentMeals.length === 0" class="text-center py-8 text-gray-500">
        No recent activity yet.
      </div>

      <!-- Meal Cards -->
      <div v-for="meal in recentMeals" :key="meal.id" class="mb-4 bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow">
        
        <!-- Receipt Image Box -->
        <div class="w-full h-32 sm:h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 overflow-hidden relative border border-gray-200 dark:border-gray-700">
          <img v-if="meal.receipt_url" :src="meal.receipt_url" class="w-full h-full object-cover opacity-80" alt="Receipt">
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
             <Receipt class="w-8 h-8 opacity-50" />
          </div>

          <!-- Group Pill Overlay -->
          <div v-if="meal.group_name" class="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg border border-white/10">
            <div class="w-5 h-5 rounded-full overflow-hidden bg-gray-700">
               <Users class="w-3 h-3 m-1 text-gray-300" />
            </div>
            <span class="text-xs font-bold">{{ meal.group_name }}</span>
          </div>
        </div>

        <!-- Meal Details -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-primary-500 mb-1">{{ meal.title }}</h3>
            <p class="text-2xl font-black text-green-600 dark:text-green-500 tracking-tight">{{ meal.total_cost.toLocaleString() }} {{ meal.currency }}</p>
          </div>
          <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700">
            {{ meal.split_method }}
          </span>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/50">
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-white dark:border-gray-800">
               <img v-if="meal.payer_avatar" :src="meal.payer_avatar" class="w-full h-full object-cover">
               <User v-else class="w-4 h-4 text-gray-400 m-1" />
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
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useDebtsStore } from '../stores/debts'
import { supabase } from '../lib/supabase'
import { Wallet, Sparkles, ArrowDownLeft, ArrowUpRight, Plus, Utensils, ArrowRight, Calendar, User, Receipt, Users } from 'lucide-vue-next'
import SummaryPosterModal from '@/components/layout/SummaryPosterModal.vue'
import { useAppStore } from '../stores/appStore'

const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const appStore = useAppStore()
const recentMeals = ref([])

onMounted(async () => {
  debtsStore.fetchSettlements()
  
  try {
    const { data: realMeals } = await supabase
      .from('meals')
      .select('*, profiles:payer_id(full_name, avatar_url), groups(name)')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (realMeals) {
       recentMeals.value = realMeals.map(m => ({
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
    }
  } catch (e) {
     console.error(e)
  }
})

// Chart Configuration
import { computed } from 'vue'
const chartOptions = computed(() => {
  const isDark = appStore.isDark
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors: ['#10b981', '#ef4444'], // Green for Owed, Red for Owe
    plotOptions: {
      bar: { borderRadius: 4, horizontal: true }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Balance (LAK)'],
      labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280' } }
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280' } }
    },
    grid: { borderColor: isDark ? '#374151' : '#e5e7eb' },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  }
})

const chartSeries = computed(() => [
  { name: 'Owed to Me', data: [debtsStore.owedToMeTotal] },
  { name: 'I Owe', data: [debtsStore.iOweTotal] }
])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
}
</script>
