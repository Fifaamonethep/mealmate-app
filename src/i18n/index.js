import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import th from './locales/th.json'
import lo from './locales/lo.json'

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem('language') || 'th',
  fallbackLocale: 'en',
  messages: {
    en,
    th,
    lo
  }
})

export default i18n
