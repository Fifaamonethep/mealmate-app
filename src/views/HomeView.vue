<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">Welcome back, <span class="font-bold text-primary-600 dark:text-primary-400">{{ authStore.user.fullName }}</span>!</p>
      </div>
    </div>

    <!-- Balance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <!-- Owed Card -->
      <div class="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 shadow-lg shadow-green-500/20 text-white group">
        <div class="absolute -right-6 -top-6 bg-white/20 w-32 h-32 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="text-green-50 font-medium tracking-wide uppercase text-sm">You are owed</span>
            <div class="p-2 bg-white/20 rounded-xl"><ArrowUpRight class="w-5 h-5 text-white" /></div>
          </div>
          <h2 class="text-4xl font-black">1,500 <span class="text-2xl font-bold opacity-80">฿</span></h2>
        </div>
      </div>

      <!-- Owe Card -->
      <div class="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 shadow-lg shadow-red-500/20 text-white group">
        <div class="absolute -right-6 -top-6 bg-white/20 w-32 h-32 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="text-red-50 font-medium tracking-wide uppercase text-sm">You owe</span>
            <div class="p-2 bg-white/20 rounded-xl"><ArrowDownRight class="w-5 h-5 text-white" /></div>
          </div>
          <h2 class="text-4xl font-black">300 <span class="text-2xl font-bold opacity-80">฿</span></h2>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
      <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl p-2 shadow-sm">
        
        <!-- Activity Item 1 -->
        <div class="flex items-center justify-between p-4 hover:bg-white/40 dark:hover:bg-gray-700/40 rounded-2xl transition-colors cursor-default">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
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
        <div class="flex items-center justify-between p-4 hover:bg-white/40 dark:hover:bg-gray-700/40 rounded-2xl transition-colors cursor-default">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
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
import { ArrowUpRight, ArrowDownRight, Utensils, Wallet, ArrowRight, Receipt, Users, Calculator, ShieldCheck } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const features = [
  {
    name: 'Smart Scanning',
    description: 'Upload your receipt and our AI will automatically extract items, prices, and totals.',
    icon: Receipt,
  },
  {
    name: 'Group Tracking',
    description: 'Create trips or events and easily add friends to split the bill with.',
    icon: Users,
  },
  {
    name: 'Fair Splitting',
    description: 'Choose between equal splits or itemized custom splits for accurate sharing.',
    icon: Calculator,
  },
  {
    name: 'Secure Settlements',
    description: 'Our backend uses a greedy algorithm to minimize the number of transfers needed.',
    icon: ShieldCheck,
  },
]
</script>
