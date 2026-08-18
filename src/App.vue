<script setup>
import { onMounted } from 'vue'
import BaseLayout from './components/layout/BaseLayout.vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<template>
  <BaseLayout />
</template>
