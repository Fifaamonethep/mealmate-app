import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import i18n from '../i18n'

export const useAppStore = defineStore('app', () => {
  // Theme state (dark/light)
  const isDark = ref(localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches))
  
  // Language state
  const currentLang = ref(localStorage.getItem('language') || 'th')

  // Apply theme classes to document
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  // Change language
  const setLanguage = (lang) => {
    currentLang.value = lang
    i18n.global.locale.value = lang
    localStorage.setItem('language', lang)
  }

  // Watchers for initial load
  watch(isDark, applyTheme, { immediate: true })

  return {
    isDark,
    currentLang,
    toggleTheme,
    setLanguage
  }
})
