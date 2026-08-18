<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24 relative">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex-shrink-0">
          <Users class="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Friend Groups</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Manage friend groups, roommates, and colleagues</p>
        </div>
      </div>
      <button @click="isCreatingGroup = true" class="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl px-5 py-3 font-bold shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-transform active:scale-95 flex items-center flex-shrink-0">
        <Plus class="w-4 h-4 mr-2" /> Create Group
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
    </div>

    <div v-else class="space-y-4">
      <!-- Group Cards -->
      <div v-for="(group, index) in groups" :key="group.id" 
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow animate-slide-up relative"
        :style="{ animationDelay: `${index * 0.08}s` }">
        
        <!-- Header: Avatar, Name, Leader -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="relative w-16 h-16 rounded-[1.25rem] overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-inner flex-shrink-0 border-2 border-white dark:border-gray-800">
              <img v-if="group.avatar_url" :src="group.avatar_url" class="w-full h-full object-cover">
              <Users v-else class="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <!-- Leader Badge (Crown) on avatar -->
              <div v-if="group.is_leader" class="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-white dark:border-gray-800 shadow-sm">
                <Crown class="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ group.name }}</h3>
              <p class="text-xs text-gray-500 flex items-center mt-1">
                <User class="w-3 h-3 mr-1 text-yellow-500" /> Group Leader: <span class="font-medium ml-1">{{ group.leader_name || 'Admin' }}</span>
              </p>
              <p v-if="group.description" class="text-xs text-gray-400 mt-1 truncate max-w-[200px] sm:max-w-xs">{{ group.description }}</p>
            </div>
          </div>
          <div class="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
            <Users class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <!-- Financial Summary Box -->
        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 flex flex-row items-center justify-between mb-6 border border-gray-100 dark:border-gray-700/50">
          <div>
            <p class="text-xs text-gray-500 mb-1">Total Expenses:</p>
            <p class="text-lg font-black text-green-600 dark:text-green-500 tracking-tight">{{ group.total_expenses || 0 }} {{ profileCurrency }}</p>
          </div>
          <div class="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
          <div class="pr-4 sm:pr-8">
            <p class="text-xs text-gray-500 mb-1">Total Meals:</p>
            <p class="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center">
              <Receipt class="w-4 h-4 mr-1 opacity-70" /> {{ group.total_meals || 0 }}
            </p>
          </div>
        </div>

        <!-- Footer: Members and Details Link -->
        <div class="flex items-center justify-between">
          <div class="flex -space-x-3">
            <div v-for="member in group.members?.slice(0, 4) || []" :key="member.id" class="relative z-10 hover:z-20 transition-transform hover:scale-110">
              <div class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img v-if="member.avatar_url" :src="member.avatar_url" class="w-full h-full object-cover">
                <User v-else class="w-4 h-4 text-gray-400 m-1.5" />
              </div>
              <div v-if="authStore.onlineUsers.has(member.id)" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div v-if="(group.members?.length || 0) > 4" class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold flex items-center justify-center relative z-10">
              +{{ group.members.length - 4 }}
            </div>
            <div v-if="(group.members?.length || 0) === 0" class="text-xs text-gray-400 ml-3">No members</div>
          </div>
          <router-link :to="`/group/${group.id}`" class="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center transition-colors">
            Group Details <ArrowRight class="w-4 h-4 ml-1" />
          </router-link>
        </div>
      </div>

      <div v-if="groups.length === 0" class="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/20 animate-fade-in">
        <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Users class="w-8 h-8 text-primary-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">No groups found</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">You haven't created or joined any shared groups yet.</p>
        <button @click="isCreatingGroup = true" class="btn-primary rounded-xl px-6 py-2">
          Create Group
        </button>
      </div>
    </div>

    <!-- Create Group Modal -->
    <transition name="modal">
      <div v-if="isCreatingGroup" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="isCreatingGroup = false"></div>
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-[450px] rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Users class="w-5 h-5 mr-2 text-primary-500" /> + Create Group
            </h3>
            <button @click="isCreatingGroup = false" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <!-- Form Body -->
          <div class="p-6 overflow-y-auto space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Group Name *</label>
              <input v-model="newGroup.name" type="text" required class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700" placeholder="E.g. Room 302, Vacation Trip...">
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Group Avatar:</label>
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center space-x-3 overflow-x-auto custom-scrollbar">
                <!-- Preset avatars -->
                <button v-for="n in 4" :key="n" @click="newGroup.avatarPreset = n" 
                  :class="['flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all', newGroup.avatarPreset === n ? 'border-primary-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100']">
                  <!-- Using placeholder gradients since we don't have images -->
                  <div class="w-full h-full bg-gradient-to-br" :class="getPresetGradient(n)"></div>
                </button>
                <div class="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2 flex-shrink-0"></div>
                <label class="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-500 transition-colors cursor-pointer relative overflow-hidden group">
                  <img v-if="newGroup.avatarUrlPreview" :src="newGroup.avatarUrlPreview" class="w-full h-full object-cover">
                  <Image v-else class="w-5 h-5" />
                  <div v-if="newGroup.avatarUrlPreview" class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                    <span class="text-white text-[10px] font-bold text-center leading-tight">Change</span>
                  </div>
                  <input type="file" class="hidden" accept="image/*" @change="onGroupAvatarSelect">
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea v-model="newGroup.description" rows="2" class="input-field rounded-2xl w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 resize-none py-3" placeholder="E.g. Living expenses & shared meals..."></textarea>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Add Members ({{ selectedMembersCount }})</label>
              <div v-if="friends.length === 0" class="text-sm text-gray-500 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                No friends available to add.
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                <!-- Current User Pill (Fixed) -->
                <div class="flex items-center p-2 rounded-xl bg-primary-50/50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50">
                  <div class="w-8 h-8 rounded-full overflow-hidden bg-primary-200 dark:bg-primary-700 mr-3 flex-shrink-0">
                     <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" class="w-full h-full object-cover">
                     <User v-else class="w-4 h-4 text-white m-2" />
                  </div>
                  <span class="text-sm font-bold text-gray-900 dark:text-white truncate">You (Admin)</span>
                </div>

                <!-- Friend Pills -->
                <label v-for="friend in friends" :key="friend.id" 
                  :class="['flex items-center p-2 rounded-xl border cursor-pointer transition-all', newGroup.members.includes(friend.id) ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300']">
                  <input type="checkbox" v-model="newGroup.members" :value="friend.id" class="hidden">
                  <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3 flex-shrink-0 border border-gray-200 dark:border-gray-600">
                    <img v-if="friend.avatar_url" :src="friend.avatar_url" class="w-full h-full object-cover">
                    <User v-else class="w-4 h-4 text-gray-400 m-2" />
                  </div>
                  <span class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ friend.full_name }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Footer Buttons -->
          <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3 bg-white dark:bg-gray-800">
            <button @click="isCreatingGroup = false" class="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
            <button @click="createGroup" :disabled="isSaving || !newGroup.name" class="btn-primary px-8 py-2.5 rounded-xl flex items-center disabled:opacity-50">
              <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
              <Plus v-else class="w-4 h-4 mr-2" />
              {{ isSaving ? 'Creating...' : 'Create Group' }}
            </button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Users, Plus, Loader2, X, User, Crown, Receipt, ArrowRight, Image } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const groups = ref([])
const friends = ref([])
const isLoading = ref(true)
const isCreatingGroup = ref(false)
const isSaving = ref(false)
const profileCurrency = ref('THB')

const newGroup = ref({
  name: '',
  description: '',
  avatarPreset: 1,
  avatarFile: null,
  avatarUrlPreview: null,
  members: []
})

const selectedMembersCount = computed(() => {
  return newGroup.value.members.length + 1 // +1 for the creator
})

const getPresetGradient = (n) => {
  const gradients = [
    'from-blue-400 to-indigo-500',
    'from-orange-400 to-rose-500',
    'from-emerald-400 to-cyan-500',
    'from-purple-400 to-pink-500'
  ]
  return gradients[(n - 1) % 4]
}

const fetchGroups = async () => {
  if (!authStore.user) return
  isLoading.value = true
  try {
    // Fetch currency
    const { data: profileData } = await supabase.from('profiles').select('currency').eq('id', authStore.user.id).single()
    if (profileData && profileData.currency) profileCurrency.value = profileData.currency

    // Fetch groups where the user is a member
    const { data: memberData, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', authStore.user.id)
    
    if (memberError && memberError.code !== '42P01') {
      console.error(memberError)
    }

    if (memberData && memberData.length > 0) {
      const groupIds = memberData.map(m => m.group_id)
      const { data, error } = await supabase.from('groups').select('*').in('id', groupIds)
      if (error) throw error
      
      // Enrich groups with members and mock financial data since we don't have group_expenses yet
      const enrichedGroups = []
      for(const g of data) {
         // fetch members for this group
         const { data: gMembers } = await supabase
           .from('group_members')
           .select('user_id, profiles(full_name, avatar_url)')
           .eq('group_id', g.id)
         
         const formattedMembers = gMembers?.map(m => ({
           id: m.user_id,
           full_name: m.profiles.full_name,
           avatar_url: m.profiles.avatar_url
         })) || []

         // Identify leader (first member or whoever)
         const leader = formattedMembers.length > 0 ? formattedMembers[0] : null;

         // Fetch group stats
         const { data: groupMeals } = await supabase
           .from('meals')
           .select('total_cost')
           .eq('group_id', g.id)
         
         const totalMeals = groupMeals?.length || 0
         const totalExpenses = groupMeals?.reduce((sum, m) => sum + parseFloat(m.total_cost || 0), 0) || 0

         enrichedGroups.push({
           ...g,
           leader_name: leader ? leader.full_name : 'Admin',
           is_leader: leader && leader.id === authStore.user.id,
           members: formattedMembers,
           total_expenses: totalExpenses,
           total_meals: totalMeals
         })
      }
      groups.value = enrichedGroups

    } else {
      groups.value = []
    }

    // Fetch accepted friends for creation modal
    const { data: rels } = await supabase
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${authStore.user.id},user2_id.eq.${authStore.user.id}`)
      .eq('status', 'accepted')

    if (rels && rels.length > 0) {
      const friendIds = rels.map(r => r.user1_id === authStore.user.id ? r.user2_id : r.user1_id)
      const { data: profs } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', friendIds)
      friends.value = profs || []
    }

  } catch (error) {
    console.error("Error fetching groups/friends:", error)
  } finally {
    isLoading.value = false
  }
}

const createGroup = async () => {
  if (!authStore.user || !newGroup.value.name) return
  isSaving.value = true
  try {
    let finalAvatarUrl = null
    
    // 0. Upload Avatar if chosen
    if (newGroup.value.avatarFile) {
      const fileExt = newGroup.value.avatarFile.name.split('.').pop()
      const fileName = `${Date.now()}_${authStore.user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, newGroup.value.avatarFile)
      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        finalAvatarUrl = data.publicUrl
      }
    }

    // 1. Insert into groups
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({ 
        name: newGroup.value.name, 
        description: newGroup.value.description,
        avatar_url: finalAvatarUrl
      })
      .select()
      .single()
    if (groupError) throw groupError

    // 2. Insert members (creator + selected friends)
    const memberRecords = [
      { group_id: groupData.id, user_id: authStore.user.id },
      ...newGroup.value.members.map(friendId => ({ group_id: groupData.id, user_id: friendId }))
    ]

    const { error: membersError } = await supabase.from('group_members').insert(memberRecords)
    if (membersError && membersError.code !== '42P01') throw membersError

    isCreatingGroup.value = false
    newGroup.value = { name: '', description: '', avatarPreset: 1, avatarFile: null, avatarUrlPreview: null, members: [] }
    fetchGroups()
  } catch (error) {
    console.error(error)
    if (error.code === '42P01') {
      alert("Database Error: Table 'groups' or 'group_members' does not exist. Please run the SQL schema in Supabase.")
    } else {
      alert("Error creating group: " + error.message)
    }
  } finally {
    isSaving.value = false
  }
}

const onGroupAvatarSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    newGroup.value.avatarFile = file
    newGroup.value.avatarUrlPreview = URL.createObjectURL(file)
    newGroup.value.avatarPreset = 0 // clear preset
  }
}

onMounted(() => { fetchGroups() })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 20px;
}
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
