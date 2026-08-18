<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('friends.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('friends.subtitle') }}</p>
      </div>
      <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
        <Users class="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
    </div>

    <!-- Search -->
    <div class="mb-8 animate-slide-up">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" :placeholder="$t('friends.searchPlaceholder')" class="input-field pl-12">
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="(user, index) in filteredFriends" :key="user.id" 
        class="flex items-center justify-between p-4 card hover:scale-[1.01] animate-slide-up"
        :style="{ animationDelay: `${index * 0.05}s` }">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md shadow-primary-500/20">
             <span class="text-white font-bold text-lg">{{ user.full_name?.charAt(0) || '?' }}</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white">{{ user.full_name || 'Unknown User' }}</h3>
            <p class="text-sm text-gray-500">{{ $t('friends.joined') }}</p>
          </div>
        </div>
      </div>

      <div v-if="filteredFriends.length === 0" class="text-center py-12 animate-fade-in">
        <Users class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p class="text-gray-500">{{ $t('friends.noUsers') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, Search, Loader2 } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const friends = ref([])
const searchQuery = ref('')
const isLoading = ref(true)

const fetchFriends = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) throw error
    friends.value = data || []
  } catch (error) {
    console.error("Error fetching profiles:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { fetchFriends() })

const filteredFriends = computed(() => {
  if (!searchQuery.value) return friends.value
  return friends.value.filter(f => 
    f.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
