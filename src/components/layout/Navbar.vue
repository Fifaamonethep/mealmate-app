<template>
  <nav class="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0f172a]/90 border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 relative">
        
        <!-- Logo -->
        <button @click="toggleThemeFromLogo" class="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-transform active:scale-95 focus:outline-none">
          <!-- Custom AI Generated Logo -->
          <div class="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
             <img src="@/assets/mealmate_logo.png" class="w-full h-full object-cover" alt="MealMate Logo">
          </div>
          <span class="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">MealMate</span>
        </button>

        <!-- Desktop Navigation (Centered & Compact) -->
        <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md px-2 py-1.5 rounded-full shadow-sm border border-gray-200/50 dark:border-gray-700/50 space-x-1">
          <router-link to="/" class="px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all" active-class="bg-white dark:bg-gray-700 text-primary-500 dark:text-primary-400 shadow-sm">{{ $t('nav.home') }}</router-link>
          <router-link to="/meals" class="px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all" active-class="bg-white dark:bg-gray-700 text-primary-500 dark:text-primary-400 shadow-sm">{{ $t('nav.addMeal') || 'Meals' }}</router-link>
          <router-link to="/groups" class="px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all" active-class="bg-white dark:bg-gray-700 text-primary-500 dark:text-primary-400 shadow-sm">{{ $t('nav.groups') }}</router-link>
          <router-link to="/debts" class="px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all" active-class="bg-white dark:bg-gray-700 text-primary-500 dark:text-primary-400 shadow-sm">{{ $t('nav.debts') }}</router-link>
          <router-link to="/friends" class="px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all" active-class="bg-white dark:bg-gray-700 text-primary-500 dark:text-primary-400 shadow-sm">{{ $t('nav.friends') }}</router-link>
        </div>

        <!-- Controls (Right Side) -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          
          <!-- Notifications (Bell) -->
          <div class="relative" v-click-outside="() => notifMenuOpen = false">
            <button @click="notifMenuOpen = !notifMenuOpen" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-colors focus:outline-none relative">
              <Bell class="w-5 h-5" />
              <!-- Notification Badge -->
              <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
            </button>

            <!-- Notifications Dropdown -->
            <transition name="dropdown">
              <div v-if="notifMenuOpen" class="absolute right-[-60px] sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                <div class="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#0f172a]/50">
                  <h3 class="font-bold text-gray-900 dark:text-white">Notifications</h3>
                  <button class="text-xs font-bold text-primary-500 hover:text-primary-600">Mark all as read</button>
                </div>
                
                <div class="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <!-- Mock Notification 1 -->
                  <div class="p-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-start space-x-3 bg-primary-50/30 dark:bg-primary-900/10">
                    <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                      <Receipt class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="text-sm text-gray-800 dark:text-gray-200"><span class="font-bold">Amonethep</span> added a new meal <span class="font-bold">"Dinner"</span></p>
                      <p class="text-xs text-primary-500 font-bold mt-1">You owe 500,000 LAK</p>
                      <p class="text-[10px] text-gray-500 mt-1">2 mins ago</p>
                    </div>
                  </div>

                  <!-- Mock Notification 2 -->
                  <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-start space-x-3">
                    <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                      <CheckCircle class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="text-sm text-gray-800 dark:text-gray-200"><span class="font-bold">Jane Doe</span> verified your payment slip!</p>
                      <p class="text-[10px] text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div class="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
                  <button class="text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">View All Notifications</button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Custom Language Switcher with Image Flags (Windows friendly) -->
          <div class="relative group" @click="langMenuOpen = !langMenuOpen" v-click-outside="() => langMenuOpen = false">
            <button class="flex items-center space-x-2 bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <img :src="getCurrentFlag()" class="w-5 h-5 object-cover rounded-sm shadow-sm" alt="Flag">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">{{ currentLang }}</span>
              <ChevronDown class="w-3 h-3 text-gray-400" />
            </button>

            <!-- Dropdown Menu -->
            <transition name="dropdown">
              <div v-if="langMenuOpen" class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden py-1 z-50">
                <button v-for="lang in languages" :key="lang.code" @click="changeLang(lang.code)"
                  class="w-full flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <img :src="lang.flag" class="w-5 h-5 object-cover rounded-sm shadow-sm mr-3" alt="Flag">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-200">{{ lang.label }}</span>
                  <Check v-if="currentLang === lang.code" class="w-4 h-4 ml-auto text-primary-500" />
                </button>
              </div>
            </transition>
          </div>

          <!-- Theme Toggle -->
          <button @click="toggleDark" 
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none active:scale-90 hidden sm:block">
            <Sun v-if="isDark" class="w-5 h-5 text-yellow-500 transition-transform hover:rotate-45 duration-300" />
            <Moon v-else class="w-5 h-5 text-gray-500 transition-transform hover:-rotate-12 duration-300" />
          </button>

          <!-- Profile Avatar Link -->
          <router-link to="/profile" class="relative group ml-2">
            <div class="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-2 border-white dark:border-[#0f172a] shadow-sm hover:scale-105 transition-transform">
              <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" class="w-full h-full object-cover">
              <span v-else class="text-white font-bold text-sm">{{ authStore.user?.fullName?.substring(0, 2) || 'U' }}</span>
            </div>
            <!-- Online Indicator -->
            <div v-if="authStore.onlineUsers.has(authStore.user?.id)" class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0f172a] rounded-full"></div>
          </router-link>

        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useRouter } from 'vue-router'
import { Sun, Moon, Bell, ChevronDown, Check, Receipt, CheckCircle } from 'lucide-vue-next'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const router = useRouter()

const currentLang = ref(appStore.currentLang || 'en')
const isDark = ref(appStore.isDark)
const langMenuOpen = ref(false)
const notifMenuOpen = ref(false)

const languages = [
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'th', label: 'ภาษาไทย', flag: 'https://flagcdn.com/w40/th.png' },
  { code: 'la', label: 'ພາສາລາວ', flag: 'https://flagcdn.com/w40/la.png' }
]

const getCurrentFlag = () => {
  const lang = languages.find(l => l.code === currentLang.value)
  return lang ? lang.flag : languages[0].flag
}

const changeLang = (langCode) => {
  currentLang.value = langCode
  appStore.setLanguage(langCode)
  langMenuOpen.value = false
}

const toggleDark = () => {
  appStore.toggleTheme()
  isDark.value = appStore.isDark
}

const toggleThemeFromLogo = () => {
  toggleDark()
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

// Simple click outside directive logic
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
