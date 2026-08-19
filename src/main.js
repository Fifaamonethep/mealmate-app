import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import './style.css'
import '@fontsource-variable/noto-sans-lao'
import 'aos/dist/aos.css'
import { injectSpeedInsights } from '@vercel/speed-insights'
import AOS from 'aos'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia()) // เปิดใช้งานระบบจัดการข้อมูลส่วนกลาง (State)
app.use(router)        // เปิดใช้งานระบบเปลี่ยนหน้าเว็บ
app.use(i18n)          // เปิดใช้งานระบบหลายภาษา
app.use(VueApexCharts) // เปิดใช้งานระบบกราฟ

app.config.globalProperties.$formatCurrency = (amount, currencyCode = '') => {
  if (amount === undefined || amount === null) return '0.00 ' + currencyCode;
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formatter.format(amount)} ${currencyCode}`.trim();
}

injectSpeedInsights() // เปิดใช้งาน Vercel Speed Insights

app.mount('#app')

// Initialize AOS for scroll animations
AOS.init({
  duration: 600,
  once: true, // whether animation should happen only once - while scrolling down
  offset: 50,
})