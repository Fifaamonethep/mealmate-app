<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-fade-in">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('home.dashboard') }}</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">{{ $t('home.welcomeBack') }} <span class="font-bold text-primary-600 dark:text-primary-400">{{ authStore.user?.fullName || 'User' }}</span>!</p>
      </div>
    </div>

    <!-- Quick Guide (Onboarding) -->
    <div v-if="showGuide" class="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-6 relative animate-fade-in">
      <button @click="showGuide = false" class="absolute top-4 right-4 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200">
        <X class="w-5 h-5" />
      </button>
      <div class="flex items-center space-x-3 mb-4">
        <Info class="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 class="text-lg font-bold text-blue-900 dark:text-blue-100">Quick Guide: How to use MealMate</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div class="flex items-start space-x-2">
          <PlusCircle class="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
          <p><strong>The + Button (Bottom Right):</strong> This is your main action menu. Click it to quickly Add an Expense, Add a Friend, or Create a Group.</p>
        </div>
        <div class="flex items-start space-x-2">
          <Users class="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
          <p><strong>Groups & Friends:</strong> Before splitting a bill, add your friends in the <strong>Friends</strong> tab, then create a <strong>Group</strong> for your trip or dinner.</p>
        </div>
        <div class="flex items-start space-x-2">
          <Wallet class="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
          <p><strong>Debts Tab:</strong> Check who you owe and who owes you. You can upload payment slips here to settle debts!</p>
        </div>
        <div class="flex items-start space-x-2">
          <UserIcon class="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
          <p><strong>Profile:</strong> Update your name, change your password, set your Avatar, and upload your personal QR code for receiving money.</p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <!-- Owed Card -->
      <div class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-6 shadow-lg shadow-green-500/20 text-white group animate-slide-up">
        <div class="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute -left-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="text-green-50 font-medium tracking-wide uppercase text-sm">{{ $t('home.youAreOwed') }}</span>
            <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><ArrowUpRight class="w-5 h-5 text-white" /></div>
          </div>
          <h2 class="text-4xl font-black">1,500 <span class="text-2xl font-bold opacity-80">฿</span></h2>
        </div>
      </div>

      <!-- Owe Card -->
      <div class="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-6 shadow-lg shadow-red-500/20 text-white group animate-slide-up stagger-2">
        <div class="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute -left-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="text-red-50 font-medium tracking-wide uppercase text-sm">{{ $t('home.youOwe') }}</span>
            <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><ArrowDownRight class="w-5 h-5 text-white" /></div>
          </div>
          <h2 class="text-4xl font-black">300 <span class="text-2xl font-bold opacity-80">฿</span></h2>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="animate-slide-up stagger-3">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">{{ $t('home.recentActivity') }}</h3>
      <div class="card p-2">
        
        <!-- Activity Item 1 -->
        <div class="flex items-center justify-between p-4 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 rounded-2xl transition-all duration-200 cursor-default group">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Utensils class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white">Friday Sushi Dinner</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Added by Alice • 2 hours ago</p>
            </div>
          </div>
          <div class="text-right">
            <span class="font-bold text-red-500">- 300 ฿</span>
          </div>
        </div>

        <!-- Activity Item 2 -->
        <div class="flex items-center justify-between p-4 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 rounded-2xl transition-all duration-200 cursor-default group">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white">Charlie paid you</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Debt Settled • 1 day ago</p>
            </div>
          </div>
          <div class="text-right">
            <span class="font-bold text-green-500">+ 500 ฿</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowUpRight, ArrowDownRight, Utensils, Wallet, X, Info, PlusCircle, Users, User as UserIcon } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const showGuide = ref(true)
</script>
