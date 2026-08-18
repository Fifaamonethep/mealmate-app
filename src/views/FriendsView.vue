<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
    
    <!-- Header -->
    <div class="flex items-center space-x-4 mb-4">
      <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex-shrink-0">
        <Users class="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Friends</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Manage friends list, search and add new friends</p>
      </div>
    </div>

    <!-- Big Add Button -->
    <button @click="openAddModal" class="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl py-4 flex items-center justify-center text-lg font-bold shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-transform active:scale-95">
      <UserPlus class="w-5 h-5 mr-2" />
      + Add New Friend
    </button>

    <!-- Main Card for Tabs -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[2rem] p-4 sm:p-6 shadow-sm animate-slide-up">
      
      <!-- Search within Tabs -->
      <div class="relative mb-6">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="searchQuery" type="text" placeholder="Search by username or Email..." class="input-field rounded-2xl w-full pl-12 bg-gray-50 dark:bg-gray-900/50 border-transparent focus:border-primary-500">
      </div>

      <!-- Tab Buttons -->
      <div class="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-2xl mb-6">
        <button @click="currentTab = 'friends'" :class="['flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all', currentTab === 'friends' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">
          <UserIcon class="w-4 h-4 mr-2" />
          My Friends <span class="ml-2 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">{{ friendsCount }}</span>
        </button>
        <button @click="currentTab = 'requests'" :class="['flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all', currentTab === 'requests' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">
          <Clock class="w-4 h-4 mr-2" />
          Friend Requests
          <span v-if="requestsCount > 0" class="ml-2 bg-primary-500 text-white px-2 py-0.5 rounded-full text-xs">{{ requestsCount }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 flex justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <!-- Content Area -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-3xl bg-gray-50/50 dark:bg-gray-900/20">
          <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
            <Users class="w-8 h-8 text-primary-500" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">No friends yet</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">Connect with friends using username or Email to split meals and confirm bills seamlessly.</p>
          <button @click="openAddModal" class="btn-primary rounded-xl px-6 py-2">
            + Add New Friend
          </button>
        </div>

        <!-- List State -->
        <div v-else class="space-y-3">
          <div v-for="user in filteredUsers" :key="user.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
            
            <div class="flex items-center space-x-4">
              <div class="relative w-12 h-12 rounded-full flex-shrink-0">
                <div class="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover">
                  <UserIcon v-else class="w-6 h-6 text-gray-400 m-3" />
                </div>
                <div v-if="authStore.onlineUsers.has(user.id)" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ user.full_name }}</h4>
                <p class="text-xs text-gray-500">@{{ user.username }}</p>
              </div>
            </div>

            <!-- Actions based on tab -->
            <div v-if="currentTab === 'friends'">
              <button @click="removeFriend(user.friendshipId)" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-colors">Remove</button>
            </div>
            <div v-else-if="currentTab === 'requests'" class="flex space-x-2">
              <button @click="acceptRequest(user.friendshipId)" class="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-bold transition-colors">Accept</button>
              <button @click="removeFriend(user.friendshipId)" class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- People You May Know -->
    <div class="pt-4 animate-slide-up stagger-2" v-if="suggestedUsers.length > 0">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
        <Sparkles class="w-4 h-4 mr-2 text-yellow-500" /> PEOPLE YOU MAY KNOW
      </h3>
      <div class="space-y-3">
        <div v-for="user in suggestedUsers.slice(0, 3)" :key="user.id" class="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover">
              <UserIcon v-else class="w-5 h-5 text-gray-400 m-2.5" />
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ user.full_name }}</h4>
              <p class="text-xs text-gray-500">@{{ user.username }}</p>
            </div>
          </div>
          <button @click="sendRequest(user.id)" class="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold transition-colors">
            + Add
          </button>
        </div>
      </div>
    </div>

    <!-- Add New Friend Modal -->
    <transition name="modal">
      <div v-if="isAddModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeAddModal"></div>
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <UserPlus class="w-5 h-5 mr-2 text-primary-500" /> Add New Friend
            </h3>
            <button @click="closeAddModal" class="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-6 flex-1 overflow-y-auto">
            
            <div class="flex space-x-2 mb-6">
              <div class="relative flex-1">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input v-model="modalSearchQuery" type="text" placeholder="Search by username or Email" class="input-field rounded-2xl w-full pl-10 py-3 text-sm">
              </div>
              <button class="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl px-6 font-bold text-sm transition-colors">Search</button>
            </div>

            <!-- Global Search Results -->
            <div class="space-y-3">
              <div v-if="globalSearchResults.length === 0 && modalSearchQuery" class="text-center py-8 text-gray-500 text-sm">
                No users found matching "{{ modalSearchQuery }}"
              </div>

              <div v-for="user in globalSearchResults" :key="user.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover">
                    <UserIcon v-else class="w-6 h-6 text-gray-400 m-3" />
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ user.full_name }}</h4>
                    <p class="text-xs text-gray-500">@{{ user.username }}</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">{{ user.email || 'Hidden email' }}</p>
                  </div>
                </div>

                <button v-if="!user.friendshipStatus" @click="sendRequest(user.id)" class="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold transition-colors flex items-center">
                  <UserPlus class="w-3 h-3 mr-1" /> Add Friend
                </button>
                <button v-else disabled class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-xl text-xs font-bold flex items-center cursor-not-allowed">
                  <Check class="w-3 h-3 mr-1" /> Added
                </button>
              </div>
            </div>

          </div>
          
          <!-- Modal Footer -->
          <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end flex-shrink-0">
            <button @click="closeAddModal" class="px-6 py-2 text-gray-500 font-bold hover:text-gray-700 transition-colors">Cancel</button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, Search, Loader2, User as UserIcon, UserPlus, Clock, X, Sparkles, Check } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const profiles = ref([])
const friendships = ref([])
const searchQuery = ref('')
const isLoading = ref(true)
const currentTab = ref('friends') // 'friends', 'requests'
const isAddModalOpen = ref(false)
const modalSearchQuery = ref('')

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
  }).filter(u => u.id !== authStore.user?.id) // Remove self
})

const friendsCount = computed(() => {
  return enrichedUsers.value.filter(u => u.friendshipStatus === 'accepted').length
})

const requestsCount = computed(() => {
  return enrichedUsers.value.filter(u => u.friendshipStatus === 'pending' && !u.isRequester).length
})

const filteredUsers = computed(() => {
  let list = enrichedUsers.value

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

const suggestedUsers = computed(() => {
  // Users who have no relationship at all
  return enrichedUsers.value.filter(u => !u.friendshipStatus)
})

const globalSearchResults = computed(() => {
  if (!modalSearchQuery.value) return suggestedUsers.value // Show suggestions when empty
  return enrichedUsers.value.filter(u => 
    u.full_name?.toLowerCase().includes(modalSearchQuery.value.toLowerCase()) ||
    u.username?.toLowerCase().includes(modalSearchQuery.value.toLowerCase())
  )
})

const openAddModal = () => {
  modalSearchQuery.value = ''
  isAddModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
}

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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(20px);
}
</style>
