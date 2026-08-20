<template>
  <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
    
    <!-- Header & Tabs -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Control Center</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage slips, users, and system data</p>
      </div>
      
      <!-- Tab Navigation -->
      <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto w-full sm:w-auto hide-scrollbar">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          :class="['px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all flex items-center', 
            activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']">
          <component :is="tab.icon" class="w-4 h-4 mr-2" />
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Notification Toast -->
    <transition name="toast">
      <div v-if="toastMessage" class="fixed top-20 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl shadow-xl z-50 font-bold flex items-center space-x-2">
        <Info class="w-5 h-5" />
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- TAB 1: DASHBOARD -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6 animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card p-6 flex flex-col justify-center border-l-4 border-primary-500">
          <div class="flex items-center text-primary-500 mb-2">
            <Users class="w-5 h-5 mr-2" />
            <span class="font-bold">Total Users</span>
          </div>
          <span class="text-4xl font-black text-gray-900 dark:text-white">{{ stats.totalUsers }}</span>
        </div>
        <div class="card p-6 flex flex-col justify-center border-l-4 border-blue-500">
          <div class="flex items-center text-blue-500 mb-2">
            <FolderKanban class="w-5 h-5 mr-2" />
            <span class="font-bold">Total Groups</span>
          </div>
          <span class="text-4xl font-black text-gray-900 dark:text-white">{{ stats.totalGroups }}</span>
        </div>
        <div class="card p-6 flex flex-col justify-center border-l-4 border-green-500">
          <div class="flex items-center text-green-500 mb-2">
            <Banknote class="w-5 h-5 mr-2" />
            <span class="font-bold">Transaction Volume</span>
          </div>
          <span class="text-4xl font-black text-gray-900 dark:text-white">{{ stats.totalVolume.toFixed(2) }} ฿</span>
        </div>
      </div>
      
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex items-start">
        <Info class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <p class="text-sm text-blue-700 dark:text-blue-300">
          <b>Admin Tip:</b> For full functionality in managing Users and Groups (Promoting admins or deleting records), make sure to run the <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin-policies.sql</code> script in your Supabase SQL Editor.
        </p>
      </div>
    </div>

    <!-- TAB 2: SLIPS -->
    <div v-if="activeTab === 'slips'" class="animate-fade-in">
       <div class="flex mb-4 gap-4 border-b border-gray-200 dark:border-gray-700">
         <button @click="slipTab = 'pending'" :class="['pb-2 font-bold text-sm transition-colors', slipTab === 'pending' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">
           Pending Verifications <span v-if="pendingSlips.length" class="ml-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{{ pendingSlips.length }}</span>
         </button>
         <button @click="slipTab = 'history'" :class="['pb-2 font-bold text-sm transition-colors', slipTab === 'history' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']">
           Slip History
         </button>
       </div>
       
       <div class="card overflow-hidden">
         <div class="overflow-x-auto">
           <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
             <thead class="bg-gray-50 dark:bg-gray-900/50">
               <tr>
                 <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                 <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                 <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                 <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
               
               <tr v-for="slip in (slipTab === 'pending' ? pendingSlips : historySlips)" :key="slip.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                 <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center space-x-3">
                     <div class="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                       <a :href="slip.image" target="_blank" class="hover:opacity-80 w-full h-full">
                         <img :src="slip.image" class="w-full h-full object-cover" />
                       </a>
                     </div>
                     <div>
                       <p class="text-sm font-bold text-gray-900 dark:text-white">{{ slip.from }} <span class="text-gray-400">➔</span> {{ slip.to }}</p>
                       <p class="text-xs text-gray-500">{{ slip.timestamp }}</p>
                     </div>
                   </div>
                 </td>
                 <td class="px-6 py-4 whitespace-nowrap">
                   <span class="text-sm font-black text-gray-900 dark:text-white">{{ slip.amount.toFixed(2) }} ฿</span>
                 </td>
                 <td class="px-6 py-4 whitespace-nowrap">
                   <span :class="[
                     'px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full',
                     slip.status === 'Needs Review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                     slip.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                     'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                   ]">
                     {{ slip.status }}
                   </span>
                 </td>
                 <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <!-- Pending Actions -->
                   <div class="flex justify-end space-x-2" v-if="slip.status === 'Needs Review'">
                     <button @click="handleAction(slip, 'Rejected')" class="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Reject Slip">
                       <X class="w-4 h-4" />
                     </button>
                     <button @click="handleAction(slip, 'Confirmed')" class="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg transition-colors" title="Force Confirm">
                       <Check class="w-4 h-4" />
                     </button>
                   </div>
                   <!-- History Actions -->
                   <div class="flex justify-end space-x-2" v-else>
                     <button @click="handleAction(slip, 'Needs Review')" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center" title="Undo Decision">
                       <RotateCcw class="w-3 h-3 mr-1" /> Undo
                     </button>
                   </div>
                 </td>
               </tr>
               
               <tr v-if="(slipTab === 'pending' && pendingSlips.length === 0) || (slipTab === 'history' && historySlips.length === 0)">
                 <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                   No slips found in this category.
                 </td>
               </tr>
             </tbody>
           </table>
         </div>
       </div>
    </div>

    <!-- TAB 3: USERS -->
    <div v-if="activeTab === 'users'" class="animate-fade-in card overflow-hidden">
      <div class="overflow-x-auto">
         <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
           <thead class="bg-gray-50 dark:bg-gray-900/50">
             <tr>
               <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
               <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
               <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
               <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
             </tr>
           </thead>
           <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
             <tr v-for="user in allUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
               <td class="px-6 py-4 whitespace-nowrap">
                 <div class="flex items-center space-x-3">
                   <img :src="user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`" class="w-10 h-10 rounded-full" />
                   <div>
                     <p class="text-sm font-bold text-gray-900 dark:text-white">{{ user.full_name }}</p>
                     <p class="text-xs text-gray-500">@{{ user.username }}</p>
                   </div>
                 </div>
               </td>
               <td class="px-6 py-4 whitespace-nowrap">
                 <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full', user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300']">
                   {{ user.role || 'user' }}
                 </span>
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                 {{ new Date(user.created_at).toLocaleDateString() }}
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="toggleUserRole(user)" class="text-primary-600 hover:text-primary-500 font-bold px-3 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                    {{ user.role === 'admin' ? 'Demote to User' : 'Make Admin' }}
                  </button>
               </td>
             </tr>
           </tbody>
         </table>
      </div>
    </div>

    <!-- TAB 4: GROUPS -->
    <div v-if="activeTab === 'groups'" class="animate-fade-in card overflow-hidden">
      <div class="overflow-x-auto">
         <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
           <thead class="bg-gray-50 dark:bg-gray-900/50">
             <tr>
               <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Group Name</th>
               <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
               <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
               <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
             </tr>
           </thead>
           <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
             <tr v-for="group in allGroups" :key="group.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
               <td class="px-6 py-4 whitespace-nowrap">
                 <div class="flex items-center space-x-3">
                   <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                     {{ group.name.charAt(0).toUpperCase() }}
                   </div>
                   <p class="text-sm font-bold text-gray-900 dark:text-white">{{ group.name }}</p>
                 </div>
               </td>
               <td class="px-6 py-4">
                 <p class="text-sm text-gray-500 truncate max-w-[200px]">{{ group.description || '-' }}</p>
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                 {{ new Date(group.created_at).toLocaleDateString() }}
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="deleteGroup(group.id)" class="text-red-600 hover:text-red-500 font-bold p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Group">
                    <Trash2 class="w-4 h-4" />
                  </button>
               </td>
             </tr>
           </tbody>
         </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ShieldAlert, Check, X, Info, LayoutDashboard, Receipt, Users, FolderKanban, RotateCcw, Banknote, UsersRound, Trash2 } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'slips', name: 'Slips', icon: Receipt },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'groups', name: 'Groups', icon: FolderKanban }
]
const activeTab = ref('dashboard')
const slipTab = ref('pending')

const toastMessage = ref('')
const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => toastMessage.value = '', 3000)
}

// Data State
const pendingSlips = ref([])
const historySlips = ref([])
const allUsers = ref([])
const allGroups = ref([])
const stats = ref({ totalUsers: 0, totalGroups: 0, totalVolume: 0 })

// Fetch Slips
const fetchSlips = async () => {
  try {
    const { data, error } = await supabase
      .from('slips')
      .select(`id, amount, image_url, status, created_at, from:profiles!slips_from_user_id_fkey(full_name), to:profiles!slips_to_user_id_fkey(full_name)`)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    const formatted = data.map(s => ({
      id: s.id,
      from: s.from?.full_name || 'Unknown',
      to: s.to?.full_name || 'Unknown',
      amount: s.amount,
      image: s.image_url,
      status: s.status,
      timestamp: new Date(s.created_at).toLocaleString()
    }))

    pendingSlips.value = formatted.filter(s => s.status === 'Needs Review')
    historySlips.value = formatted.filter(s => s.status !== 'Needs Review')
    
    // Calculate total volume from confirmed slips
    stats.value.totalVolume = historySlips.value
      .filter(s => s.status === 'Confirmed')
      .reduce((sum, slip) => sum + slip.amount, 0)

  } catch (err) {
    console.error("Error fetching slips:", err)
  }
}

// Fetch Users
const fetchUsers = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    allUsers.value = data
    stats.value.totalUsers = data.length
  } catch (err) {
    console.error("Error fetching users:", err)
  }
}

// Fetch Groups
const fetchGroups = async () => {
  try {
    const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
    if (error) throw error
    allGroups.value = data
    stats.value.totalGroups = data.length
  } catch (err) {
    console.error("Error fetching groups:", err)
  }
}

// Action: Handle Slip Status
const handleAction = async (slip, newStatus) => {
  const previousStatus = slip.status
  slip.status = newStatus

  try {
    const { error } = await supabase.from('slips').update({ status: newStatus }).eq('id', slip.id)
    if (error) throw error
    showToast(`Slip updated to ${newStatus}`)
    fetchSlips() // Refresh lists
  } catch (error) {
    slip.status = previousStatus
    showToast(`Failed to update slip.`)
  }
}

// Action: Toggle User Role
const toggleUserRole = async (user) => {
  if (confirm(`Are you sure you want to change ${user.full_name}'s role?`)) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
      if (error) throw error
      user.role = newRole
      showToast(`Role updated to ${newRole}`)
    } catch (error) {
      showToast("Error updating role. Did you run the SQL policies script?")
    }
  }
}

// Action: Delete Group
const deleteGroup = async (groupId) => {
  if (confirm("DANGER: Are you sure you want to delete this group? All related debts will be deleted!")) {
    try {
      const { error } = await supabase.from('groups').delete().eq('id', groupId)
      if (error) throw error
      allGroups.value = allGroups.value.filter(g => g.id !== groupId)
      stats.value.totalGroups--
      showToast("Group deleted successfully.")
    } catch (error) {
      showToast("Error deleting group. Did you run the SQL policies script?")
    }
  }
}

let subscription = null

onMounted(() => {
  fetchSlips()
  fetchUsers()
  fetchGroups()

  subscription = supabase
    .channel('public:slips')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'slips' }, () => fetchSlips())
    .subscribe()
})

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription)
})
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
