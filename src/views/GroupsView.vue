<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
    
    <div class="flex items-center justify-between mb-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ $t('groups.title') || 'Groups' }}</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('groups.subtitle') || 'Your shared trips and events.' }}</p>
      </div>
      <button @click="isCreatingGroup = true" class="btn-primary p-3 rounded-2xl">
        <Plus class="w-6 h-6" />
      </button>
    </div>

    <!-- Create Group Modal -->
    <div v-if="isCreatingGroup" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in">
        <button @click="isCreatingGroup = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X class="w-6 h-6" />
        </button>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Group</h2>
        
        <form @submit.prevent="createGroup" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
            <input v-model="newGroup.name" type="text" required class="input-field" placeholder="e.g. Pattaya Trip 2026">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <input v-model="newGroup.description" type="text" class="input-field" placeholder="e.g. Hotel and food expenses">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Add Friends</label>
            <div v-if="friends.length === 0" class="text-sm text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              You need to add friends first before you can invite them to a group.
            </div>
            <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <label v-for="friend in friends" :key="friend.id" class="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                <input type="checkbox" v-model="newGroup.members" :value="friend.id" class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500">
                <div class="ml-3 flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img v-if="friend.avatar_url" :src="friend.avatar_url" class="w-full h-full object-cover">
                    <User v-else class="w-full h-full text-gray-400 p-1" />
                  </div>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">{{ friend.full_name }}</span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" :disabled="isSaving" class="btn-primary w-full mt-6 flex justify-center items-center">
            <Loader2 v-if="isSaving" class="w-5 h-5 mr-2 animate-spin" />
            <Users v-else class="w-5 h-5 mr-2" />
            {{ isSaving ? 'Creating...' : 'Create Group' }}
          </button>
        </form>
      </div>
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
        <p class="text-gray-500">{{ $t('groups.noGroups') || "You don't have any groups yet." }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Users, Plus, Loader2, X, User } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const groups = ref([])
const friends = ref([])
const isLoading = ref(true)
const isCreatingGroup = ref(false)
const isSaving = ref(false)

const newGroup = ref({
  name: '',
  description: '',
  members: []
})

const fetchGroups = async () => {
  if (!authStore.user) return
  isLoading.value = true
  try {
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
      groups.value = data || []
    } else {
      // Fallback if no members table or no groups: fetch all groups (for MVP backward compat)
      const { data } = await supabase.from('groups').select('*')
      groups.value = data || []
    }

    // Fetch accepted friends
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
  if (!authStore.user) return
  isSaving.value = true
  try {
    // 1. Insert into groups
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({ name: newGroup.value.name, description: newGroup.value.description })
      .select()
      .single()
    if (groupError) throw groupError

    // 2. Insert members (creator + selected friends)
    const memberRecords = [
      { group_id: groupData.id, user_id: authStore.user.id },
      ...newGroup.value.members.map(friendId => ({ group_id: groupData.id, user_id: friendId }))
    ]

    const { error: membersError } = await supabase.from('group_members').insert(memberRecords)
    if (membersError && membersError.code !== '42P01') throw membersError // Ignore if table doesn't exist yet

    alert("Group Created Successfully!")
    isCreatingGroup.value = false
    newGroup.value = { name: '', description: '', members: [] }
    fetchGroups()
  } catch (error) {
    alert("Error creating group: " + error.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => { fetchGroups() })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
</style>
