import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDebtsStore = defineStore('debts', () => {
  const debtsList = ref([
    { id: 'd_1', groupId: 'g_1', amount: 500, currency: 'THB', creditorId: 'user_12345', debtorId: 'f_1', status: 'pending' },
    { id: 'd_2', groupId: 'g_1', amount: 200, currency: 'THB', creditorId: 'f_2', debtorId: 'user_12345', status: 'settled' }
  ])

  const addDebt = (debt) => {
    debtsList.value.push(debt)
  }

  const settleDebt = (debtId) => {
    const debt = debtsList.value.find(d => d.id === debtId)
    if (debt) {
      debt.status = 'settled'
    }
  }

  return {
    debtsList,
    addDebt,
    settleDebt
  }
})
