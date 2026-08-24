<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24 animate-fade-in">
    
    <!-- Header with Back Button -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <button @click="router.back()" class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Group Details</h1>
      </div>
      <div class="flex space-x-2">
        <button v-if="group" @click="openEditGroup" class="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300">
          <Settings class="w-5 h-5" />
        </button>
        <router-link v-if="group" :to="'/add-meal?groupId=' + group.id" class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95 flex items-center">
          <Plus class="w-4 h-4 mr-1" /> Add Meal
        </router-link>
      </div>
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

      <!-- Tabs Navigation -->
      <div class="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-2xl animate-slide-up mt-6">
        <button @click="currentTab = 'meals'" 
          :class="['flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all', 
            currentTab === 'meals' ? 'bg-white dark:bg-gray-800 text-primary-500 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
          <Utensils class="w-4 h-4 mr-2" />
          Meals
        </button>
        <button @click="currentTab = 'balances'" 
          :class="['flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all', 
            currentTab === 'balances' ? 'bg-white dark:bg-gray-800 text-primary-500 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
          <Scale class="w-4 h-4 mr-2" />
          Balances
        </button>
        <button @click="currentTab = 'members'" 
          :class="['flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all', 
            currentTab === 'members' ? 'bg-white dark:bg-gray-800 text-primary-500 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
          <Users class="w-4 h-4 mr-2" />
          Members
        </button>
      </div>

      <!-- Tab Contents -->
      <div class="mt-6">
        
        <!-- Meals Tab -->
        <div v-if="currentTab === 'meals'" class="space-y-4 animate-fade-in">
           <div v-if="groupMeals.length === 0" class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem]">
              <Utensils class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p class="text-gray-500 dark:text-gray-400">No meals found in this group.</p>
           </div>
           
           <div v-for="meal in groupMeals" :key="meal.id" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-primary-500 mb-1">{{ meal.title || 'Untitled Meal' }}</h3>
                  <p class="text-2xl font-black text-green-600 dark:text-green-500 tracking-tight">{{ parseFloat(meal.total_cost).toLocaleString() }} {{ meal.currency || 'LAK' }}</p>
                </div>
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-600">
                  {{ meal.split_method === 'equal' ? 'Equal Split' : 'Custom Split' }}
                </span>
                <button v-if="meal.created_by === authStore.user?.id || meal.payer_id === authStore.user?.id" @click="editMeal(meal.id)" class="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary-500 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-sm" title="Edit Meal">
                  <Pencil class="w-4 h-4" />
                </button>
                <button v-if="meal.created_by === authStore.user?.id || meal.payer_id === authStore.user?.id" @click="confirmDelete(meal)" class="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-sm" title="Delete Meal">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div class="flex flex-col space-y-2">
                  <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Paid By: </span>
                    <span class="font-bold text-gray-900 dark:text-gray-200">{{ getMealPayersStr(meal.id) }}</span>
                  </div>
                  <div class="flex items-center text-xs text-gray-500 font-medium">
                    <Users class="w-3 h-3 mr-1" />
                    {{ getMealParticipantsCount(meal.id) }} Participants
                  </div>
                </div>
                <div class="flex flex-col items-end space-y-2">
                  <div class="flex items-center text-xs text-gray-500 font-medium">
                    <Calendar class="w-3 h-3 mr-1" />
                    {{ meal.date || new Date(meal.created_at).toLocaleDateString() }}
                  </div>
                  <div v-if="meal.location" class="flex items-center text-xs text-gray-500 font-medium">
                    <MapPin class="w-3 h-3 mr-1" />
                    {{ meal.location }}
                  </div>
                </div>
              </div>
           </div>
        </div>

        <!-- Balances Tab -->
        <div v-else-if="currentTab === 'balances'" class="space-y-4 animate-fade-in">
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[2rem] p-6 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Group Ledger</h3>
            <p class="text-xs text-gray-500 mb-6">This shows net positions calculated from meals within this group.</p>
            
            <div class="space-y-3">
               <div v-for="bal in groupBalances" :key="bal.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                 <div class="flex items-center">
                   <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 overflow-hidden border-2 border-white dark:border-gray-800 flex items-center justify-center">
                     <span class="text-gray-500 font-bold text-sm">{{ bal.name.charAt(0).toUpperCase() }}</span>
                   </div>
                   <p class="text-sm font-bold text-gray-900 dark:text-white">{{ bal.name }}</p>
                 </div>
                 <div class="text-right">
                   <p v-if="bal.balance > 0.01" class="text-green-500 font-black">Gets back {{ bal.balance.toLocaleString() }} LAK</p>
                   <p v-else-if="bal.balance < -0.01" class="text-red-500 font-black">Owes {{ Math.abs(bal.balance).toLocaleString() }} LAK</p>
                   <p v-else class="text-gray-500 font-bold">Settled up</p>
                 </div>
               </div>
               <div v-if="groupBalances.length === 0" class="text-center text-gray-500 py-4">
                  No activity yet.
               </div>
            </div>
          </div>
        </div>

        <!-- Members Tab -->
        <div v-else-if="currentTab === 'members'" class="animate-fade-in">
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

    </div>

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div v-if="mealToDelete" class="fixed inset-0 z-[200] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-[#111827] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Meal?</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">Are you sure you want to delete <span class="font-bold text-gray-700 dark:text-gray-200">"{{ mealToDelete.title }}"</span>? The associated debt will be canceled.</p>
          <div class="flex space-x-3">
            <button @click="mealToDelete = null" class="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button @click="executeDelete" :disabled="isDeleting" class="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl transition-colors hover:bg-red-600 flex items-center justify-center disabled:opacity-50">
              <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit Group Modal -->
    <transition name="fade">
      <div v-if="isEditingGroup" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="isEditingGroup = false"></div>
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Settings class="w-5 h-5 mr-2 text-primary-500" /> Group Settings
            </h3>
            <button @click="isEditingGroup = false" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <X class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
              <input v-model="editForm.name" type="text" class="input-field rounded-xl w-full">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea v-model="editForm.description" rows="2" class="input-field rounded-xl w-full resize-none"></textarea>
            </div>
            
            <div class="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
              <button v-if="group.created_by !== authStore.user?.id" @click="leaveGroup" class="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center">
                <LogOut class="w-4 h-4 mr-2" /> Leave Group
              </button>
              
              <button v-if="group.created_by === authStore.user?.id" @click="deleteGroup" class="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center">
                <Trash2 class="w-4 h-4 mr-2" /> Delete Group
              </button>
            </div>
          </div>
          
          <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3 bg-white dark:bg-gray-800">
            <button @click="isEditingGroup = false" class="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
            <button @click="saveGroupSettings" :disabled="isSavingSettings" class="btn-primary px-6 py-2 rounded-xl flex items-center">
              <Loader2 v-if="isSavingSettings" class="w-4 h-4 mr-2 animate-spin" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Users, Loader2, User, Plus, Utensils, Scale, Calendar, Pencil, Trash2, Settings, X, LogOut, MapPin } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)

const group = ref(null)
const members = ref([])
const groupMeals = ref([])
const groupBalances = ref([])
const mealParticipantsData = ref([])
const mealPayersData = ref([])
const currentTab = ref('meals') // 'meals', 'balances', 'members'
const mealToDelete = ref(null)
const isDeleting = ref(false)

const isEditingGroup = ref(false)
const isSavingSettings = ref(false)
const editForm = ref({ name: '', description: '' })

const loadGroupData = async () => {
  const groupId = route.params.id
  if (!groupId) return router.push('/groups')

  try {
    isLoading.value = true
    // 1. Fetch Group Details
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()
    
    if (groupError) throw groupError
    group.value = groupData

    // 2. Fetch Members
    const { data: memberData } = await supabase
      .from('group_members')
      .select('user_id, joined_at, profiles(full_name, avatar_url)')
      .eq('group_id', groupId)
    
    members.value = memberData || []

    // 3. Fetch Meals for this group
    const { data: mealsData, error: mealsErr } = await supabase
      .from('meals')
      .select('*, profiles:payer_id(full_name, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      
    if (!mealsErr && mealsData) {
      groupMeals.value = mealsData
    } else {
      groupMeals.value = []
    }

    // 4. Calculate Group Balances
    if (groupMeals.value.length > 0) {
      const mealIds = groupMeals.value.map(m => m.id)
      
      const { data: participantsData, error: partErr } = await supabase
        .from('meal_participants')
        .select('*, profiles:user_id(full_name)')
        .in('meal_id', mealIds)
        
      const { data: payersData, error: payersErr } = await supabase
        .from('meal_payers')
        .select('*, profiles:user_id(full_name)')
        .in('meal_id', mealIds)

      if (!partErr && participantsData) {
        mealParticipantsData.value = participantsData
      }
      if (!payersErr && payersData) {
        mealPayersData.value = payersData
      }

      if (!partErr && participantsData) {
        const balancesMap = {}

        // Helper
        const getEntityId = (userId, guestName) => userId ? userId : `guest_${guestName}`
        const getEntityName = (profile, guestName) => profile ? profile.full_name : `${guestName} (Guest)`

        // Add amounts paid by payers
        groupMeals.value.forEach(m => {
           // Fallback to single payer if meal_payers is not available (legacy)
           const mPayers = payersData?.filter(p => p.meal_id === m.id) || []
           if (mPayers.length > 0) {
              mPayers.forEach(p => {
                 const id = p.user_id
                 const name = p.profiles?.full_name || 'Unknown'
                 if (!balancesMap[id]) balancesMap[id] = { name, balance: 0 }
                 balancesMap[id].balance += parseFloat(p.amount_paid)
              })
           } else if (m.payer_id) {
              const id = m.payer_id
              const name = m.profiles?.full_name || 'Unknown'
              if (!balancesMap[id]) balancesMap[id] = { name, balance: 0 }
              balancesMap[id].balance += parseFloat(m.total_cost)
           }
        })

        // Subtract amounts consumed
        participantsData.forEach(p => {
           const id = getEntityId(p.user_id, p.guest_name)
           const name = getEntityName(p.profiles, p.guest_name)
           if (!balancesMap[id]) balancesMap[id] = { name, balance: 0 }
           balancesMap[id].balance -= parseFloat(p.amount_owed)
        })

        const finalBalances = []
        for (const [id, data] of Object.entries(balancesMap)) {
           // rounding to avoid JS float precision issues
           const roundedBalance = Math.round(data.balance * 100) / 100
           if (Math.abs(roundedBalance) > 0.01) {
             finalBalances.push({
               id,
               name: data.name,
               balance: roundedBalance
             })
           }
        }
        
        // Sort by balance descending (who is owed most first)
        finalBalances.sort((a, b) => b.balance - a.balance)
        groupBalances.value = finalBalances
      }
    } else {
      groupBalances.value = []
    }
  } catch (error) {
    console.error("Error loading group details:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadGroupData()
})

const getMealParticipantsCount = (mealId) => {
  return mealParticipantsData.value.filter(p => p.meal_id === mealId).length
}

const getMealPayersStr = (mealId) => {
  const mPayers = mealPayersData.value.filter(p => p.meal_id === mealId)
  if (mPayers.length > 0) {
    if (mPayers.length === 1) return mPayers[0].profiles?.full_name || 'Unknown'
    return mPayers.map(p => p.profiles?.full_name?.split(' ')[0] || 'Unknown').join(', ')
  }
  const meal = groupMeals.value.find(m => m.id === mealId)
  return meal?.profiles?.full_name || 'Unknown'
}

const editMeal = (id) => {
  router.push({ path: '/add-meal', query: { editMealId: id } })
}

const confirmDelete = (meal) => {
  mealToDelete.value = meal
}

const executeDelete = async () => {
  if (!mealToDelete.value) return
  isDeleting.value = true
  try {
    const { error } = await supabase.from('meals').delete().eq('id', mealToDelete.value.id)
    if (error) throw error
    mealToDelete.value = null
    await loadGroupData() // Recalculate balances by refetching group data
  } catch (err) {
    console.error("Failed to delete meal:", err)
    alert("Failed to delete meal: " + err.message)
  } finally {
    isDeleting.value = false
  }
}

const openEditGroup = () => {
  editForm.value = {
    name: group.value.name,
    description: group.value.description
  }
  isEditingGroup.value = true
}

const saveGroupSettings = async () => {
  isSavingSettings.value = true
  try {
    const { error } = await supabase
      .from('groups')
      .update({ name: editForm.value.name, description: editForm.value.description })
      .eq('id', group.value.id)
    if (error) throw error
    
    group.value.name = editForm.value.name
    group.value.description = editForm.value.description
    isEditingGroup.value = false
  } catch (err) {
    alert("Error saving group: " + err.message)
  } finally {
    isSavingSettings.value = false
  }
}

const leaveGroup = async () => {
  // Check if user has outstanding balances
  const myBalance = groupBalances.value.find(b => b.id === authStore.user.id)?.balance || 0
  if (Math.abs(myBalance) > 0.01) {
    alert(`You cannot leave this group because you have an outstanding balance (${myBalance > 0 ? 'Gets back' : 'Owes'} ${Math.abs(myBalance)} LAK). Please settle up first.`)
    return
  }

  if(!confirm("Are you sure you want to leave this group?")) return
  
  isSavingSettings.value = true
  try {
    const { error } = await supabase.from('group_members').delete().eq('group_id', group.value.id).eq('user_id', authStore.user.id)
    if (error) throw error
    isEditingGroup.value = false
    router.push('/groups')
  } catch (err) {
    alert("Error leaving group: " + err.message)
  } finally {
    isSavingSettings.value = false
  }
}

const deleteGroup = async () => {
  if(!confirm("WARNING: This will permanently delete the group and ALL its meals and debts. Are you absolutely sure?")) return
  
  isSavingSettings.value = true
  try {
    // Manually delete meals first to prevent foreign key constraint issues
    await supabase.from('meals').delete().eq('group_id', group.value.id)
    // Then delete the group itself (group_members will be cascade deleted if set up, or we might need to delete them manually if not)
    await supabase.from('group_members').delete().eq('group_id', group.value.id)
    const { error } = await supabase.from('groups').delete().eq('id', group.value.id)
    if (error) throw error
    
    isEditingGroup.value = false
    router.push('/groups')
  } catch (err) {
    alert("Error deleting group: " + err.message)
  } finally {
    isSavingSettings.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
