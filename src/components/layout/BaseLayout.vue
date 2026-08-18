<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex flex-col font-sans relative pb-16 md:pb-0">
    <Navbar v-if="authStore.user" />
    
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Removed Global Expanding Speed Dial -->

    <BottomNav v-if="authStore.user" />
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import BottomNav from './BottomNav.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<style scoped>
/* Page transition handled by global style.css */
</style>
