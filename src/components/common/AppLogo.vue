<template>
  <img :src="logoUrl" :alt="altText" :class="customClass" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  customClass: {
    type: String,
    default: 'w-full h-full object-contain'
  },
  altText: {
    type: String,
    default: 'MealMate Logo'
  }
})

// ศูนย์กลางสำหรับเปลี่ยน Path โลโก้ของทั้งแอป
const logoUrl = computed(() => {
  return '/logo-mealmate.png' 
})
</script>
