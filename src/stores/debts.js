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

      // 2. Format them for the algorithm
      const formattedExpenses = dbExpenses.map(e => ({
        userId: e.user_id,
        userName: e.profiles.full_name,
        paid: parseFloat(e.paid),
        actualCost: parseFloat(e.actual_cost)
      }))

      // 3. Local settlement calculation (Two-Pointer Greedy Algorithm)
      let totalPaid = 0;
      let totalCost = 0;
      const creditors = [];
      const debtors = [];

      for (const exp of formattedExpenses) {
        totalPaid += exp.paid;
        totalCost += exp.actualCost;
        const net = exp.paid - exp.actualCost;
        if (net > 1e-9) creditors.push({ userId: exp.userId, userName: exp.userName, balance: net });
        else if (net < -1e-9) debtors.push({ userId: exp.userId, userName: exp.userName, balance: Math.abs(net) });
      }

      creditors.sort((a, b) => b.balance - a.balance);
      debtors.sort((a, b) => b.balance - a.balance);

      const transactions = [];
      let i = 0, j = 0;

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(debtor.balance, creditor.balance);
        const roundedAmount = Math.round(amount * 100) / 100;

        if (roundedAmount > 0) {
          transactions.push({
            fromId: debtor.userId,
            from: debtor.userName,
            toId: creditor.userId,
            to: creditor.userName,
            amount: roundedAmount,
          });
        }

        debtor.balance -= amount;
        creditor.balance -= amount;
        if (debtor.balance < 1e-9) i++;
        if (creditor.balance < 1e-9) j++;
      }

      optimizedTransactions.value = transactions
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
