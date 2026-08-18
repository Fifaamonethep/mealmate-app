<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex items-center justify-between mb-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('groups.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('groups.subtitle') }}</p>
      </div>
      <button class="btn-primary p-3 rounded-2xl">
        <Plus class="w-6 h-6" />
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="(group, index) in groups" :key="group.id" 
        class="card p-6 hover:scale-[1.02] cursor-pointer group animate-slide-up"
        :style="{ animationDelay: `${index * 0.08}s` }">
        <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-primary-500/20">
          <Users class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ group.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ group.description || $t('groups.noDescription') }}</p>
      </div>

      <div v-if="groups.length === 0" class="col-span-full text-center py-12 animate-fade-in">
        <Users class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p class="text-gray-500">{{ $t('groups.noGroups') }}</p>
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
    const { data, error } = await supabase.from('groups').select('*')
    if (error) throw error
    groups.value = data || []
  } catch (error) {
    console.error("Error fetching groups:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { fetchGroups() })
</script>
