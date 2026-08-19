<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24 animate-fade-in">
    
    <!-- Header with Back Button -->
    <div class="flex items-center space-x-4 mb-6">
      <button @click="router.back()" class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <ArrowLeft class="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Group Details</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500" />
    </div>
    
    <div v-else-if="!group" class="text-center py-12 text-gray-500">
      Group not found.
    </div>

    <div v-else class="space-y-6">
      <!-- Group Info Card -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div class="w-24 h-24 rounded-3xl bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden shadow-inner border-4 border-white dark:border-gray-800">
            <img v-if="group.avatar_url" :src="group.avatar_url" class="w-full h-full object-cover">
            <Users v-else class="w-10 h-10 text-gray-400 m-6" />
          </div>
          <div class="text-center sm:text-left flex-1">
            <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ group.name }}</h2>
            <p v-if="group.description" class="mt-2 text-gray-500 dark:text-gray-400">{{ group.description }}</p>
            <div class="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <Users class="w-3 h-3 mr-1" /> {{ members.length }} Members
              </span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                Created {{ new Date(group.created_at).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Members Section -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[2rem] p-6 shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users class="w-5 h-5 mr-2 text-primary-500" /> Members
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="member in members" :key="member.user_id" class="flex items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 overflow-hidden border-2 border-white dark:border-gray-800 relative">
              <img v-if="member.profiles?.avatar_url" :src="member.profiles.avatar_url" class="w-full h-full object-cover">
              <User v-else class="w-5 h-5 text-gray-400 m-2" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ member.profiles?.full_name }}</p>
              <p class="text-xs text-gray-500 truncate">Joined {{ new Date(member.joined_at).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Users, Loader2, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const group = ref(null)
const members = ref([])

onMounted(async () => {
  const groupId = route.params.id
  if (!groupId) return router.push('/groups')

  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()
    
    if (groupError) throw groupError
    group.value = groupData

    const { data: memberData } = await supabase
      .from('group_members')
      .select('user_id, joined_at, profiles(full_name, avatar_url)')
      .eq('group_id', groupId)
    
    members.value = memberData || []
  } catch (error) {
    console.error("Error loading group:", error)
  } finally {
    isLoading.value = false
  }
})
</script>
