<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up stagger-1 mt-6">
    
    <!-- Category Breakdown (Donut Chart) -->
    <div class="bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow relative z-0">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <PieChart class="w-4 h-4 mr-2 text-primary-500" /> Spending by Category
      </h3>
      <div class="flex justify-center">
        <apexchart type="donut" height="220" :options="donutOptions" :series="donutSeries"></apexchart>
      </div>
    </div>

    <!-- Weekly Trends (Bar Chart) -->
    <div class="bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow relative z-0">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <BarChart3 class="w-4 h-4 mr-2 text-green-500" /> Weekly Trends
      </h3>
      <div class="relative -ml-2">
        <apexchart type="bar" height="220" :options="barOptions" :series="barSeries"></apexchart>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PieChart, BarChart3 } from 'lucide-vue-next'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

// --- Mock Data ---
// Categories: Food (45%), Transport (25%), Shopping (15%), Entertainment (10%), Other (5%)
const donutSeries = [45, 25, 15, 10, 5]
const categoryLabels = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Other']

// Weekly Trends
const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
const weeklyData = [120000, 180000, 95000, 210000]

// --- Donut Chart Config ---
const donutOptions = computed(() => {
  const isDark = appStore.isDark
  return {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    labels: categoryLabels,
    colors: ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'],
    stroke: {
      show: true,
      colors: isDark ? ['#0f172a'] : ['#ffffff'],
      width: 2
    },
    dataLabels: {
      enabled: false // cleaner look
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: isDark ? '#9ca3af' : '#6b7280'
            },
            value: {
              show: true,
              fontSize: '18px',
              fontFamily: 'inherit',
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#111827',
              formatter: function (val) {
                return val + "%"
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: isDark ? '#9ca3af' : '#6b7280',
            }
          }
        }
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '11px',
      markers: { width: 8, height: 8, radius: 12 },
      itemMargin: { horizontal: 5, vertical: 0 },
      labels: {
        colors: isDark ? '#9ca3af' : '#4b5563'
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: function(val) {
          return val + "%"
        }
      }
    }
  }
})

// --- Bar Chart Config ---
const barOptions = computed(() => {
  const isDark = appStore.isDark
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '40%',
        distributed: true // allows individual colors if needed later
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: weeklyLabels,
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '11px', fontWeight: 600 }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '11px', fontWeight: 500 },
        formatter: (val) => {
          return (val / 1000) + 'k'
        }
      }
    },
    grid: {
      borderColor: isDark ? '#1e293b' : '#f3f4f6',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: { show: false },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: function(val) {
          return val.toLocaleString() + " LAK"
        }
      }
    }
  }
})
const barSeries = computed(() => [
  { name: 'Spent', data: weeklyData }
])
</script>
