import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import th from './locales/th.json'
import la from './locales/la.json'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('language') || 'th',
  fallbackLocale: 'en',
  messages: {
    en,
    th,
    la
  }
})

export default i18n
