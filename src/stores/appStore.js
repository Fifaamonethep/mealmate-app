import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import i18n from '../i18n'

export const useAppStore = defineStore('app', () => {
  // Helper for localStorage
  const getStorage = (key, defaultVal) => {
    try {
      return localStorage.getItem(key) || defaultVal
    } catch {
      return defaultVal
    }
  }

  const setStorage = (key, val) => {
    try {
      localStorage.setItem(key, val)
    } catch {}
  }

  // Theme state
  const isDark = ref(
    getStorage('theme', null) === 'dark' || 
    (getStorage('theme', null) === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
  
  // Language state (lo → la)
  const currentLang = ref(getStorage('language', 'th'))

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      setStorage('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      setStorage('theme', 'light')
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  const setLanguage = (lang) => {
    currentLang.value = lang
    i18n.global.locale.value = lang
    setStorage('language', lang)
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
