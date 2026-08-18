import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useDebtsStore = defineStore('debtsStore', () => {
  const optimizedTransactions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const fetchSettlements = async () => {
    isLoading.value = true
    error.value = null
    try {
      // 1. Fetch live expenses from Supabase
      const { data: dbExpenses, error: dbError } = await supabase
        .from('expenses')
        .select(`
          user_id,
          paid,
          actual_cost,
          profiles ( full_name )
        `)
        
      if (dbError) throw dbError

      // 2. Format them for the backend algorithm
      const formattedExpenses = dbExpenses.map(e => ({
        userId: e.user_id,
        userName: e.profiles.full_name, // keep name for UI
        paid: parseFloat(e.paid),
        actualCost: parseFloat(e.actual_cost)
      }))

      // 3. Send to Vercel secure endpoint
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: formattedExpenses })
      })

      if (!response.ok) {
        throw new Error('Backend failed to calculate settlements')
      }

      const data = await response.json()
      optimizedTransactions.value = data.transactions
    } catch (err) {
      console.error("Settlement Error:", err)
      error.value = err.message
      optimizedTransactions.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    optimizedTransactions,
    isLoading,
    error,
    fetchSettlements
  }
})
