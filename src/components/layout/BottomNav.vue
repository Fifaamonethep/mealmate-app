<template>
  <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800/50 pb-safe z-40">
    <div class="flex justify-around items-end h-16 px-2 pb-2 relative">
      
      <router-link to="/meals" class="nav-btn flex flex-col items-center justify-center w-14 h-12 rounded-xl text-gray-500 hover:text-primary-500 transition-all active:scale-90 active:bg-primary-50 dark:active:bg-primary-900/30" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold">
        <Receipt class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ $t('nav.addMeal') || 'Meals' }}</span>
      </router-link>

      <router-link to="/groups" class="nav-btn flex flex-col items-center justify-center w-14 h-12 rounded-xl text-gray-500 hover:text-primary-500 transition-all active:scale-90 active:bg-primary-50 dark:active:bg-primary-900/30" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold">
        <Users class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ $t('nav.groups') }}</span>
      </router-link>

      <!-- Center Prominent Dashboard -->
      <router-link to="/" class="relative -top-5 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-primary-500 text-white shadow-[0_8px_20px_rgba(168,85,247,0.4)] hover:bg-primary-600 transition-all active:scale-90 active:translate-y-2 border-4 border-white dark:border-[#0f172a] group" active-class="bg-primary-600 ring-4 ring-primary-500/30">
        <LayoutGrid class="w-6 h-6 group-hover:animate-bounce-short" />
      </router-link>

      <router-link to="/debts" class="nav-btn flex flex-col items-center justify-center w-14 h-12 rounded-xl text-gray-500 hover:text-primary-500 transition-all active:scale-90 active:bg-primary-50 dark:active:bg-primary-900/30" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold">
        <CreditCard class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ $t('nav.debts') }}</span>
      </router-link>

      <router-link to="/friends" class="nav-btn flex flex-col items-center justify-center w-14 h-12 rounded-xl text-gray-500 hover:text-primary-500 transition-all active:scale-90 active:bg-primary-50 dark:active:bg-primary-900/30" active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold">
        <User class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">{{ $t('nav.friends') }}</span>
      </router-link>
      
    </div>
  </div>
</template>

<script setup>
import { LayoutGrid, Receipt, CreditCard, Users, User } from 'lucide-vue-next'
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-btn.router-link-active {
  transform: translateY(-2px);
}

@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce-short {
  animation: bounce-short 0.4s ease-in-out;
}
</style>
