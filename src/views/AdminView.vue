<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-2xl mb-8">
      <div class="flex items-center">
        <ShieldAlert class="w-6 h-6 text-red-500 mr-3" />
        <h2 class="text-lg font-bold text-red-700 dark:text-red-400">{{ $t('admin.warningTitle') }}</h2>
      </div>
      <p class="mt-2 text-sm text-red-600 dark:text-red-300 ml-9">{{ $t('admin.warningDesc') }}</p>
    </div>

    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('admin.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('admin.subtitle') }}</p>
      </div>
    </div>

    <!-- Slips Queue -->
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ $t('admin.pendingVerifs') }}</h3>
    
    <!-- Notification Toast -->
    <transition name="toast">
      <div v-if="toastMessage" class="fixed top-20 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl shadow-xl z-50 font-bold flex items-center space-x-2">
        <Info class="w-5 h-5" />
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('admin.tableTx') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('admin.tableAmount') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('admin.tableStatus') }}</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('admin.tableActions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            
            <tr v-for="slip in pendingSlips" :key="slip.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    <!-- Real slip image now shows when clicked (could implement modal, for now just link) -->
                    <a :href="slip.image" target="_blank" class="hover:opacity-80">
                      <img :src="slip.image" class="w-full h-full object-cover" />
                    </a>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ slip.from }} ➔ {{ slip.to }}</p>
                    <p class="text-xs text-gray-500">Tx ID: #{{ slip.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-black text-gray-900 dark:text-white">{{ slip.amount.toFixed(2) }} ฿</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full',
                  slip.status === 'Needs Review' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' : 
                  slip.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                ]">
                  {{ slip.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2" v-if="slip.status === 'Needs Review'">
                  <button @click="handleAction(slip, 'Rejected')" class="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Reject Slip">
                    <X class="w-4 h-4" />
                  </button>
                  <button @click="handleAction(slip, 'Confirmed')" class="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg transition-colors" title="Force Confirm">
                    <Check class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="pendingSlips.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                {{ $t('admin.noSlips') }}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShieldAlert, Check, X, Info } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const toastMessage = ref('')
const pendingSlips = ref([])
const isLoading = ref(true)

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => toastMessage.value = '', 3000)
}

const fetchSlips = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('slips')
      .select(`
        id,
        amount,
        image_url,
        status,
        created_at,
        from:profiles!slips_from_user_id_fkey(full_name),
        to:profiles!slips_to_user_id_fkey(full_name)
      `)
      .eq('status', 'Needs Review')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    pendingSlips.value = data.map(s => ({
      id: s.id,
      from: s.from?.full_name || 'Unknown',
      to: s.to?.full_name || 'Unknown',
      amount: s.amount,
      image: s.image_url,
      status: s.status,
      timestamp: new Date(s.created_at).toLocaleString()
    }))
  } catch (err) {
    console.error("Error fetching slips:", err)
    showToast("Error loading slips.")
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSlips()
})

const handleAction = async (slip, newStatus) => {
  const previousStatus = slip.status
  
  // Optimistic UI Update
  slip.status = newStatus

  try {
    const { error } = await supabase
      .from('slips')
      .update({ status: newStatus })
      .eq('id', slip.id)

    if (error) throw error

    showToast(`Slip ${newStatus === 'Confirmed' ? 'confirmed ✅' : 'rejected ❌'} successfully!`)

    // Remove from queue after brief display
    setTimeout(() => {
      pendingSlips.value = pendingSlips.value.filter(s => s.id !== slip.id)
    }, 1000)

  } catch (error) {
    // Rollback UI on Failure
    slip.status = previousStatus
    showToast(`Failed to update slip. Rolling back.`)
    console.error("Optimistic update failed:", error)
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
