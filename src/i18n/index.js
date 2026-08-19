import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import th from './locales/th.json'
import la from './locales/la.json'

let initialLocale = 'th';
try {
  initialLocale = localStorage.getItem('language') || 'th';
} catch (e) {}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    th,
    la
  }
})

export default i18n
