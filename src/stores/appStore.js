import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import i18n from '../i18n'

export const useAppStore = defineStore('app', () => {
  // Theme state
  const isDark = ref(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
  
  // Language state (lo → la)
  const currentLang = ref(localStorage.getItem('language') || 'th')

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  const setLanguage = (lang) => {
    currentLang.value = lang
    i18n.global.locale.value = lang
    localStorage.setItem('language', lang)
  }

  // Apply theme immediately on store creation
  applyTheme()

  return {
    isDark,
    currentLang,
    toggleTheme,
    setLanguage
  }
})
