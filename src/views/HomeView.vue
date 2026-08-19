<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24 relative overflow-hidden min-h-screen">
    
    <SummaryPosterModal />

    <!-- Background Decorative Elements -->
    <div class="fixed bottom-0 left-0 right-0 h-64 z-[-1] opacity-20 pointer-events-none overflow-hidden">
      <div class="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[120%] h-64 bg-gradient-to-t from-red-500/30 via-yellow-500/20 to-transparent rounded-[100%] blur-3xl"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between animate-fade-in relative z-10">
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
      
      <div class="flex items-center space-x-3">


        <!-- Meals Button -->
        <router-link to="/add-meal" class="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl px-5 py-2.5 font-bold shadow-lg shadow-primary-500/20 transition-transform active:scale-95 flex items-center text-sm relative z-10">
          <Plus class="w-4 h-4 mr-1.5" /> {{ $t('nav.addMeal', 'Meals') }}
        </router-link>
      </div>
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

    <!-- Dashboard Summary Charts -->
    <DashboardSummary />

    <!-- Activity Feed Section (Timeline) -->
    <div class="animate-slide-up stagger-2 pt-2 mt-4 relative z-0">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center">
          <Activity class="w-4 h-4 mr-2 text-primary-500" /> {{ $t('home.recentActivity', 'Activity Feed') }}
        </h3>
        <router-link to="/meals" class="text-xs font-bold text-primary-500 flex items-center hover:text-primary-600 transition-colors">
          {{ $t('common.viewAll', 'View All') }} <ArrowRight class="w-3 h-3 ml-1" />
        </router-link>
      </div>

      <!-- Activity Timeline -->
      <div class="relative pl-5 mt-6">
        <!-- Vertical Line -->
        <div class="absolute left-[38px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 rounded-full z-0"></div>

        <div v-for="(activity, index) in activities" :key="activity.id" class="relative z-10 mb-8 last:mb-0 animate-fade-in" :style="{ animationDelay: `${index * 100}ms` }">
          <div class="flex items-start">
            <!-- Timeline Node (Avatar) -->
            <div class="w-11 h-11 rounded-full border-[3px] border-gray-50 dark:border-[#111827] bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center relative z-10">
              <img v-if="activity.avatar" :src="activity.avatar" class="w-full h-full object-cover">
              <span v-else class="text-xl">{{ activity.initial }}</span>
            </div>
            
            <!-- Content -->
            <div class="ml-4 flex-1 pt-1">
              <div class="bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm relative group hover:shadow-md transition-all">
                <!-- Arrow pointing left -->
                <div class="absolute w-3 h-3 bg-white border-l border-t border-gray-100 dark:bg-[#0f172a] dark:border-gray-800 transform -rotate-45 -left-[7px] top-[14px]"></div>
                
                <p class="text-sm text-gray-800 dark:text-gray-200 leading-relaxed" v-html="activity.text"></p>
                <div class="mt-3 flex items-center justify-between">
                  <span v-if="activity.amount" :class="['px-2.5 py-1 rounded-lg text-xs font-bold border', 
                    activity.type === 'expense' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400' 
                    : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400']">
                    {{ activity.amount }}
                  </span>
                  <div v-else></div> <!-- spacer if no amount -->
                  <span class="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center">
                    <Clock class="w-3 h-3 mr-1" /> {{ activity.time }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useDebtsStore } from '../stores/debts'
import { useNotificationsStore } from '../stores/notificationsStore'
import { supabase } from '../lib/supabase'
import { Wallet, Sparkles, ArrowDownLeft, ArrowUpRight, Plus, Utensils, ArrowRight, Calendar, User, Receipt, Users, Clock, Activity, Bell } from 'lucide-vue-next'
import SummaryPosterModal from '@/components/layout/SummaryPosterModal.vue'
import DashboardSummary from '@/components/dashboard/DashboardSummary.vue'
import { useAppStore } from '../stores/appStore'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const debtsStore = useDebtsStore()
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()
const { t } = useI18n()

// --- Activity Feed State (Real Data) ---
const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return t('home.justNow', 'Just now')
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('home.minsAgo', 'mins ago')}`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('home.hoursAgo', 'hours ago')}`
  return `${Math.floor(diffInSeconds / 86400)} ${t('home.daysAgo', 'days ago')}`
}

const activities = computed(() => {
  if (!notificationsStore.notifications || notificationsStore.notifications.length === 0) {
    return []
  }
  
  return notificationsStore.notifications.slice(0, 5).map(n => {
    let typeClass = 'expense'
    if (n.type === 'PAYMENT_VERIFIED' || n.type === 'PAYMENT_SENT') typeClass = 'settle'
    
    return {
      id: n.id,
      initial: '🔔', // Generic icon for now, could be dynamic
      avatar: '',
      text: n.message,
      amount: '', // No exact amount in notification model natively, but could be parsed
      type: typeClass,
      time: formatTimeAgo(n.created_at)
    }
  })
})

onMounted(() => {
  debtsStore.fetchSettlements()
  // Notifications are fetched in Navbar, so they should be available globally
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
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
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
