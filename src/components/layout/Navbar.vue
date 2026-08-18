<template>
  <nav class="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div class="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/30">
            <Utensils class="w-5 h-5 text-white" />
          </div>
          <span class="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">MealMate</span>
        </router-link>

        <!-- Desktop Nav (hidden on mobile) -->
        <div v-if="authStore.user" class="hidden md:flex items-center space-x-1">
          <router-link v-for="link in navLinks" :key="link.path" :to="link.path" 
            class="nav-link text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-medium px-4 py-2 rounded-xl transition-all duration-200">
            {{ link.label }}
          </router-link>
        </div>

        <!-- Controls -->
        <div class="flex items-center space-x-1 sm:space-x-2">
          <router-link v-if="authStore.user" to="/profile" 
            class="hidden sm:block text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200">
            {{ $t('nav.profile') || 'Profile' }}
          </router-link>

          <button v-if="authStore.user" @click="handleLogout" 
            class="text-xs sm:text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-1">
            <LogOut class="w-4 h-4" /> <span class="hidden sm:inline">{{ $t('nav.logout') || 'Logout' }}</span>
          </button>

          <!-- Language Switcher -->
          <select v-model="currentLang" @change="changeLang($event.target.value)" 
            class="appearance-none bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 rounded-lg px-2 sm:px-3 py-1.5 cursor-pointer outline-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <option value="en">EN</option>
            <option value="th">TH</option>
            <option value="la">LA</option>
          </select>

          <!-- Theme Toggle -->
          <button @click="toggleDark" 
            class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none active:scale-90">
            <Sun v-if="isDark" class="w-5 h-5 text-yellow-400 transition-transform hover:rotate-45 duration-300" />
            <Moon v-else class="w-5 h-5 text-gray-600 transition-transform hover:-rotate-12 duration-300" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { Sun, Moon, Utensils, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const router = useRouter()

const currentLang = ref(appStore.currentLang)
const isDark = ref(appStore.isDark)

const navLinks = computed(() => [
  { path: '/', label: t('nav.home') },
  { path: '/friends', label: t('nav.friends') },
  { path: '/groups', label: t('nav.groups') },
  { path: '/debts', label: t('nav.debts') },
  { path: '/admin', label: t('nav.admin') },
])

const changeLang = (lang) => {
  currentLang.value = lang
  appStore.setLanguage(lang)
}

const toggleDark = () => {
  appStore.toggleTheme()
  isDark.value = appStore.isDark
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.router-link-exact-active {
  color: #16a34a;
  font-weight: 700;
  background-color: rgba(22, 163, 74, 0.08);
}
:root.dark .router-link-exact-active {
  color: #4ade80;
  background-color: rgba(22, 163, 74, 0.15);
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
