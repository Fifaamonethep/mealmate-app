<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex flex-col font-sans relative pb-16 md:pb-0">
    <Navbar />
    
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Expanding Speed Dial (FAB) -->
    <div v-if="authStore.user" class="fixed bottom-24 md:bottom-8 right-8 z-50 flex flex-col-reverse items-end group">
      <!-- Main Toggle Button -->
      <button @click="fabOpen = !fabOpen" class="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-xl shadow-primary-500/40 transition-all duration-300 flex items-center justify-center animate-bounce-in relative z-10" :class="{'rotate-45': fabOpen}">
        <Plus class="w-8 h-8 transition-transform duration-300" />
      </button>

      <!-- Dropup Actions -->
      <div class="flex flex-col items-end mb-4 space-y-3 transition-all duration-300 origin-bottom" :class="fabOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'">
        
        <router-link to="/add-meal" @click="fabOpen = false" class="flex items-center space-x-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
          <span class="text-sm font-bold">{{ $t('nav.addMeal') || 'Add Meal' }}</span>
          <div class="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full">
            <Utensils class="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
        </router-link>

        <router-link to="/friends" @click="fabOpen = false" class="flex items-center space-x-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
          <span class="text-sm font-bold">{{ $t('nav.addFriend') || 'Add Friend' }}</span>
          <div class="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <UserPlus class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </router-link>

        <router-link to="/groups" @click="fabOpen = false" class="flex items-center space-x-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
          <span class="text-sm font-bold">{{ $t('nav.createGroup') || 'Create Group' }}</span>
          <div class="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
            <Users class="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
        </router-link>

      </div>
      
      <!-- Backdrop for closing -->
      <div v-if="fabOpen" @click="fabOpen = false" class="fixed inset-0 z-[-1]"></div>
    </div>

    <BottomNav v-if="authStore.user" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from './Navbar.vue'
import BottomNav from './BottomNav.vue'
import { Plus, Utensils, UserPlus, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const fabOpen = ref(false)
</script>

<style scoped>
/* Page transition handled by global style.css */
</style>
