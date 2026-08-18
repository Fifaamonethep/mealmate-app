<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex flex-col font-sans relative">
    <Navbar />
    
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Floating Action Button — ONLY show when logged in -->
    <router-link 
      v-if="authStore.user" 
      to="/add-meal" 
      class="fixed bottom-8 right-8 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-xl shadow-primary-500/40 hover:scale-110 active:scale-95 transition-all duration-200 z-50 flex items-center justify-center animate-bounce-in"
    >
      <Plus class="w-8 h-8" />
    </router-link>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import { Plus } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<style scoped>
/* Page transition handled by global style.css */
</style>
