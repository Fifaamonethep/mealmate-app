<template>
  <transition name="poster">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="relative w-full max-w-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-700/50">
        
        <!-- Header Image / Banner -->
        <div class="h-32 bg-primary-500 relative overflow-hidden flex items-center justify-center">
          <div class="absolute inset-0 bg-[url('@/assets/mealmate_logo.png')] opacity-10 bg-contain bg-no-repeat bg-center blur-sm"></div>
          <h2 class="relative text-3xl font-black text-white drop-shadow-md z-10">{{ $t('auth.summaryTitle') || 'Debt Summary' }}</h2>
          <button @click="closeModal" class="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 flex-grow overflow-y-auto max-h-[60vh] custom-scrollbar space-y-8">
          
          <!-- Loading State -->
          <div v-if="debtsStore.isLoading" class="flex justify-center py-8">
            <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Others Owe Me -->
            <div>
              <h3 class="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <ArrowDownLeft class="w-5 h-5 text-green-500 mr-2" />
                {{ $t('auth.othersOweYou') || 'Owes You' }}
              </h3>
              
              <div v-if="othersOwe.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                Nobody owes you anything! 🎉
              </div>
              
              <div v-else class="space-y-3">
                <div v-for="(tx, idx) in othersOwe" :key="'owe-'+idx" class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-green-600 dark:text-green-400">
                      {{ tx.from.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 dark:text-white">{{ tx.from }}</p>
                      <p class="text-[10px] text-gray-500 uppercase font-bold">{{ tx.amount.toLocaleString() }} ฿</p>
                    </div>
                  </div>
                  <button @click="remindDebtor(tx.from)" class="px-3 py-1.5 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg transition-colors flex items-center active:scale-95">
                    <Bell class="w-3 h-3 mr-1" /> Remind
                  </button>
                </div>
              </div>
            </div>

            <!-- I Owe Others -->
            <div>
              <h3 class="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <ArrowUpRight class="w-5 h-5 text-red-500 mr-2" />
                {{ $t('auth.youOwe') || 'You Owe' }}
              </h3>
              
              <div v-if="iOwe.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                You're debt free! 💸
              </div>
              
              <div v-else class="space-y-3">
                <div v-for="(tx, idx) in iOwe" :key="'iowe-'+idx" class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center font-bold text-red-600 dark:text-red-400">
                      {{ tx.to.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 dark:text-white">{{ tx.to }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-black text-red-500">{{ tx.amount.toLocaleString() }} ฿</p>
                  </div>
                </div>
              </div>
            </div>
          </template>

        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-center">
          <button @click="closeModal" class="btn-primary w-full py-3 shadow-md">
            {{ $t('auth.gotIt') || 'Got it, let\'s go!' }}
          </button>
        </div>
        
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDebtsStore } from '@/stores/debts'
import { useAuthStore } from '@/stores/authStore'
import { X, ArrowDownLeft, ArrowUpRight, Bell, Loader2 } from 'lucide-vue-next'

const isOpen = ref(false)
const debtsStore = useDebtsStore()
const authStore = useAuthStore()

onMounted(async () => {
  // Check if we need to show the poster
  let showPoster = false
  try {
    showPoster = sessionStorage.getItem('show_summary_poster') === 'true'
  } catch(e) {}

  if (showPoster) {
    isOpen.value = true
    await debtsStore.fetchSettlements()
  }
})

const transactions = computed(() => {
  if (!authStore.user) return []
  return debtsStore.optimizedTransactions.filter(tx => 
    tx.fromId === authStore.user.id || tx.toId === authStore.user.id
  )
})

const iOwe = computed(() => transactions.value.filter(tx => tx.fromId === authStore.user.id && tx.status !== 'COMPLETED'))
const othersOwe = computed(() => transactions.value.filter(tx => tx.toId === authStore.user.id && tx.status !== 'COMPLETED'))

const closeModal = () => {
  isOpen.value = false
  try {
    sessionStorage.removeItem('show_summary_poster')
  } catch(e) {}
}

const remindDebtor = (name) => {
  // Can be extended to copy a message or open LINE/Messenger
  alert(`Hey ${name}! Don't forget to pay me back for the meal! 🙏`)
}
</script>

<style scoped>
.poster-enter-active,
.poster-leave-active {
  transition: opacity 0.4s ease;
}
.poster-enter-active .relative,
.poster-leave-active .relative {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.poster-enter-from,
.poster-leave-to {
  opacity: 0;
}
.poster-enter-from .relative {
  transform: scale(0.9) translateY(40px);
}
.poster-leave-to .relative {
  transform: scale(0.95) translateY(20px);
}
</style>
