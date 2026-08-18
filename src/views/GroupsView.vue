<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Groups</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Your shared trips and events.</p>
      </div>
      <button class="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-2xl shadow-lg shadow-primary-500/30 transition-transform active:scale-95">
        <Plus class="w-6 h-6" />
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="group in groups" :key="group.id" class="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer group">
        <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Users class="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ group.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ group.description || 'No description' }}</p>
      </div>

      <div v-if="groups.length === 0" class="col-span-full text-center py-12">
        <p class="text-gray-500">You don't have any groups yet.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Users, Plus, Loader2 } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const groups = ref([])
const isLoading = ref(true)

const fetchGroups = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
    if (error) throw error
    groups.value = data
  } catch (error) {
    console.error("Error fetching groups:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchGroups()
})
</script>
