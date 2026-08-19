<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up stagger-1 mt-6">
    
    <!-- Who Owes Me (Donut Chart) -->
    <div class="bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow relative z-0">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <PieChart class="w-4 h-4 mr-2 text-primary-500" /> {{ $t('home.whoOwesMe', 'Who Owes Me') }}
      </h3>
      <div class="flex justify-center">
        <apexchart type="donut" height="220" :options="donutOptions" :series="donutSeries"></apexchart>
      </div>
    </div>

    <!-- Who I Owe (Bar Chart) -->
    <div class="bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow relative z-0">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <BarChart3 class="w-4 h-4 mr-2 text-red-500" /> {{ $t('home.whoIOwe', 'Who I Owe') }}
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
import { useDebtsStore } from '@/stores/debts'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()
const debtsStore = useDebtsStore()
const authStore = useAuthStore()
const { t } = useI18n()

const myDebts = computed(() => {
  if (!authStore.user) return []
  return debtsStore.optimizedTransactions.filter(tx => tx.fromId === authStore.user.id)
})

const debtsToMe = computed(() => {
  if (!authStore.user) return []
  return debtsStore.optimizedTransactions.filter(tx => tx.toId === authStore.user.id)
})

// --- Donut Chart Config (Who Owes Me) ---
const donutSeries = computed(() => {
  if (debtsToMe.value.length === 0) return [1] // Dummy value for empty state
  return debtsToMe.value.slice(0, 5).map(tx => tx.amount)
})
const categoryLabels = computed(() => {
  if (debtsToMe.value.length === 0) return [t('home.noOneOwesYou', 'No one owes you')]
  return debtsToMe.value.slice(0, 5).map(tx => tx.from)
})

const donutOptions = computed(() => {
  const isDark = appStore.isDark
  const hasData = debtsToMe.value.length > 0
  return {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    labels: categoryLabels.value,
    colors: hasData ? ['#35a076', '#f97316', '#0ea5e9', '#8b5cf6', '#64748b'] : ['#e5e7eb'],
    stroke: {
      show: true,
      colors: isDark ? ['#0f172a'] : ['#ffffff'],
      width: 2
    },
    dataLabels: { enabled: false },
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
                if (!hasData) return '0'
                return Number(val).toLocaleString()
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: t('home.totalOwed', 'Total Owed'),
              fontSize: '12px',
              fontFamily: 'inherit',
              fontWeight: 600,
              color: isDark ? '#9ca3af' : '#6b7280',
              formatter: function (w) {
                if (!hasData) return '0'
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                return total.toLocaleString()
              }
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
      labels: { colors: isDark ? '#9ca3af' : '#4b5563' }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: function(val) {
          if (!hasData) return ''
          return val.toLocaleString() + " LAK"
        }
      }
    }
  }
})

// --- Bar Chart Config (Who I Owe) ---
const barSeries = computed(() => [
  { name: t('home.amount', 'Amount'), data: myDebts.value.length === 0 ? [0] : myDebts.value.slice(0, 5).map(tx => tx.amount) }
])
const weeklyLabels = computed(() => {
  if (myDebts.value.length === 0) return [t('home.noDebts', 'No Debts')]
  return myDebts.value.slice(0, 5).map(tx => tx.to)
})

const barOptions = computed(() => {
  const isDark = appStore.isDark
  const hasData = myDebts.value.length > 0
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors: hasData ? ['#f97316'] : ['#e5e7eb'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '40%',
        distributed: true
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: weeklyLabels.value,
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
          if (val === 0) return '0'
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
          if (!hasData) return ''
          return val.toLocaleString() + " LAK"
        }
      }
    }
  }
})
</script>
