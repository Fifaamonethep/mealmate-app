<template>
  <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 pb-safe z-40">
    <div class="flex justify-around items-center h-16 px-2">
      <router-link to="/" class="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors" exact-active-class="text-primary-600 dark:text-primary-400 font-bold">
        <Home class="w-6 h-6 mb-1" />
        <span class="text-[10px]">{{ $t('nav.home') || 'Home' }}</span>
      </router-link>
      
      <router-link to="/groups" class="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors" active-class="text-primary-600 dark:text-primary-400 font-bold">
        <Users class="w-6 h-6 mb-1" />
        <span class="text-[10px]">{{ $t('nav.groups') || 'Groups' }}</span>
      </router-link>

      <!-- Centered FAB -->
      <div class="relative w-16 h-full flex justify-center">
        <router-link to="/add-meal" class="absolute -top-6 bg-primary-500 hover:bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.5)] transform transition-transform hover:scale-105 active:scale-95 border-4 border-[#F8FAFC] dark:border-[#0B1120]">
          <Plus class="w-7 h-7" />
        </router-link>
      </div>

      <router-link to="/debts" class="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors" active-class="text-primary-600 dark:text-primary-400 font-bold">
        <Wallet class="w-6 h-6 mb-1" />
        <span class="text-[10px]">{{ $t('nav.debts') || 'Debts' }}</span>
      </router-link>

      <router-link to="/profile" class="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors" active-class="text-primary-600 dark:text-primary-400 font-bold">
        <User class="w-6 h-6 mb-1" />
        <span class="text-[10px]">{{ $t('nav.profile') || 'Profile' }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Home, Users, Wallet, User, Plus } from 'lucide-vue-next'
</script>

<style scoped>
/* Safe area for iOS devices */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
