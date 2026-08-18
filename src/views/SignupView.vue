<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="text-center">
      <Loader2 class="w-8 h-8 animate-spin mx-auto text-primary-500 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">Redirecting to Login...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()

onMounted(() => {
  router.push('/login')
})
</script>
