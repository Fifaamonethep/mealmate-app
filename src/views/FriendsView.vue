<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('friends.title') || 'Friends' }}</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('friends.subtitle') || 'Manage your friends.' }}</p>
      </div>
      <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
        <Users class="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
    </div>

    <!-- Search -->
    <div class="mb-8 animate-slide-up">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" :placeholder="$t('friends.searchPlaceholder') || 'Search users by name...'" class="input-field pl-12">
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-2 mb-6 animate-slide-up">
      <button @click="currentTab = 'all'" :class="['px-4 py-2 rounded-full text-sm font-bold transition-colors', currentTab === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700']">All Users</button>
      <button @click="currentTab = 'friends'" :class="['px-4 py-2 rounded-full text-sm font-bold transition-colors', currentTab === 'friends' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700']">My Friends</button>
      <button @click="currentTab = 'requests'" :class="['px-4 py-2 rounded-full text-sm font-bold transition-colors relative', currentTab === 'requests' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700']">
        Requests
        <span v-if="pendingRequestsCount > 0" class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{{ pendingRequestsCount }}</span>
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="(user, index) in filteredUsers" :key="user.id" 
        class="flex items-center justify-between p-4 card hover:scale-[1.01] animate-slide-up"
        :style="{ animationDelay: `${index * 0.05}s` }">
        
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center shadow-md overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800">
            <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover">
            <UserIcon v-else class="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white">{{ user.full_name || 'Unknown User' }}</h3>
            <p class="text-xs text-gray-500">@{{ user.username || 'user' }}</p>
          </div>
        </div>

        <div v-if="user.id !== authStore.user?.id">
          <!-- Friendship actions -->
          <button v-if="!user.friendshipStatus" @click="sendRequest(user.id)" class="px-4 py-2 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-xl text-sm font-bold transition-colors flex items-center">
            <UserPlus class="w-4 h-4 mr-1" /> Add
          </button>
          
          <button v-else-if="user.friendshipStatus === 'pending' && user.isRequester" disabled class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl text-sm font-bold flex items-center">
            <Clock class="w-4 h-4 mr-1" /> Pending
          </button>
          
          <div v-else-if="user.friendshipStatus === 'pending' && !user.isRequester" class="flex space-x-2">
            <button @click="acceptRequest(user.friendshipId)" class="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors">Accept</button>
            <button @click="removeFriend(user.friendshipId)" class="px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-colors">Reject</button>
          </div>

          <button v-else-if="user.friendshipStatus === 'accepted'" @click="removeFriend(user.friendshipId)" class="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-colors flex items-center group">
            <UserMinus class="w-4 h-4 mr-1" /> Remove
          </button>
        </div>
      </div>

      <div v-if="filteredUsers.length === 0" class="text-center py-12 animate-fade-in">
        <Users class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p class="text-gray-500">{{ $t('friends.noUsers') || 'No users found.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, Search, Loader2, User as UserIcon, UserPlus, UserMinus, Clock } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const profiles = ref([])
const friendships = ref([])
const searchQuery = ref('')
const isLoading = ref(true)
const currentTab = ref('all') // all, friends, requests

const fetchData = async () => {
  if (!authStore.user) return
  isLoading.value = true
  try {
    const { data: profs } = await supabase.from('profiles').select('*')
    profiles.value = profs || []

    const { data: rels } = await supabase
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${authStore.user.id},user2_id.eq.${authStore.user.id}`)
      
    friendships.value = rels || []
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { fetchData() })

const enrichedUsers = computed(() => {
  return profiles.value.map(p => {
    const rel = friendships.value.find(f => f.user1_id === p.id || f.user2_id === p.id)
    return {
      ...p,
      friendshipStatus: rel ? rel.status : null,
      friendshipId: rel ? rel.id : null,
      isRequester: rel ? rel.user1_id === authStore.user.id : false
    }
  })
})

const pendingRequestsCount = computed(() => {
  return enrichedUsers.value.filter(u => u.friendshipStatus === 'pending' && !u.isRequester && u.id !== authStore.user?.id).length
})

const filteredUsers = computed(() => {
  let list = enrichedUsers.value

  // Do not show current user in the main list
  list = list.filter(u => u.id !== authStore.user?.id)

  if (currentTab.value === 'friends') {
    list = list.filter(u => u.friendshipStatus === 'accepted')
  } else if (currentTab.value === 'requests') {
    list = list.filter(u => u.friendshipStatus === 'pending' && !u.isRequester)
  }

  if (searchQuery.value) {
    list = list.filter(u => 
      u.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  return list
})

const sendRequest = async (targetId) => {
  try {
    const { error } = await supabase.from('friendships').insert({
      user1_id: authStore.user.id,
      user2_id: targetId,
      status: 'pending'
    })
    if (error) throw error
    fetchData()
  } catch (err) {
    alert("Error sending request: " + err.message)
  }
}

const acceptRequest = async (id) => {
  try {
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id)
    if (error) throw error
    fetchData()
  } catch (err) {
    alert("Error accepting request: " + err.message)
  }
}

const removeFriend = async (id) => {
  if(!confirm("Are you sure?")) return
  try {
    const { error } = await supabase.from('friendships').delete().eq('id', id)
    if (error) throw error
    fetchData()
  } catch (err) {
    alert("Error removing friend: " + err.message)
  }
}
</script>
