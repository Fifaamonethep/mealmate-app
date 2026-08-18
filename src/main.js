import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import './style.css'
import 'aos/dist/aos.css'
import AOS from 'aos'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia()) // เปิดใช้งานระบบจัดการข้อมูลส่วนกลาง (State)
app.use(router)        // เปิดใช้งานระบบเปลี่ยนหน้าเว็บ
app.use(i18n)          // เปิดใช้งานระบบหลายภาษา

app.mount('#app')

// Initialize AOS for scroll animations
AOS.init({
  duration: 600,
  once: true, // whether animation should happen only once - while scrolling down
  offset: 50,
})