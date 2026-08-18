<template>
  <nav class="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo & Brand -->
        <div class="flex-shrink-0 flex items-center gap-2">
          <Utensils class="w-8 h-8 text-primary-500" />
          <span class="font-bold text-xl tracking-tight text-gray-900 dark:text-white">MealMate</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex space-x-8">
          <router-link to="/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium px-3 py-2 rounded-md transition-colors">{{ $t('nav.home') }}</router-link>
          <router-link to="/friends" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium px-3 py-2 rounded-md transition-colors">{{ $t('nav.friends') }}</router-link>
          <router-link to="/groups" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium px-3 py-2 rounded-md transition-colors">{{ $t('nav.groups') }}</router-link>
          <router-link to="/debts" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium px-3 py-2 rounded-md transition-colors">{{ $t('nav.debts') }}</router-link>
          <router-link to="/admin" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium px-3 py-2 rounded-md transition-colors">{{ $t('nav.admin') }}</router-link>
        </div>

        <!-- Controls (Theme & Lang) -->
        <div class="flex items-center space-x-4">
          
          <router-link v-if="authStore.user" to="/profile" class="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md transition-colors">
            Profile
          </router-link>

          <button v-if="authStore.user" @click="handleLogout" class="text-sm font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-md transition-colors flex items-center">
            <LogOut class="w-4 h-4 mr-1" /> Logout
          </button>

          <!-- Language Switcher -->
          <div class="relative">
            <select v-model="appStore.currentLang" @change="changeLang($event.target.value)" class="appearance-none bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer outline-none">
              <option value="en">EN</option>
              <option value="th">TH</option>
              <option value="lo">LO</option>
            </select>
          </div>

          <!-- Theme Toggle -->
          <button @click="appStore.toggleTheme" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none">
            <Sun v-if="appStore.isDark" class="w-5 h-5 text-yellow-400" />
            <Moon v-else class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { Sun, Moon, Utensils, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const authStore = useAuthStore()
const router = useRouter()

const changeLang = (lang) => {
  appStore.setLanguage(lang)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Optional specific overrides */
.router-link-active {
  @apply text-blue-600 dark:text-blue-400 font-bold;
}
</style>
