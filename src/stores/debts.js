import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useDebtsStore = defineStore('debtsStore', () => {
  const optimizedTransactions = ref([])
  const allPayments = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()

  // Computed totals for Dashboard
  const myNetBalance = computed(() => {
    if (!authStore.user) return 0
    let balance = 0
    optimizedTransactions.value.forEach(tx => {
      if (tx.fromId === authStore.user.id) balance -= tx.amount // I owe
      if (tx.toId === authStore.user.id) balance += tx.amount // Owed to me
    })
    return balance
  })

  const iOweTotal = computed(() => {
    if (!authStore.user) return 0
    let total = 0
    optimizedTransactions.value.forEach(tx => {
      if (tx.fromId === authStore.user.id) total += tx.amount
    })
    return total
  })

  const owedToMeTotal = computed(() => {
    if (!authStore.user) return 0
    let total = 0
    optimizedTransactions.value.forEach(tx => {
      if (tx.toId === authStore.user.id) total += tx.amount
    })
    return total
  })

  const fetchSettlements = async () => {
    isLoading.value = true
    error.value = null
    try {
      // 1. Fetch Meals (Who paid)
      const { data: meals, error: mealErr } = await supabase
        .from('meals')
        .select('payer_id, total_cost, profiles:payer_id(full_name)')
      if (mealErr && mealErr.code !== '42P01') throw mealErr

      // 2. Fetch Meal Participants (Who consumed)
      const { data: participants, error: partErr } = await supabase
        .from('meal_participants')
        .select('user_id, guest_name, amount_owed, profiles:user_id(full_name)')
      if (partErr && partErr.code !== '42P01') throw partErr

      // 3. Fetch Payments (Who settled)
      const { data: payments, error: payErr } = await supabase
        .from('payments')
        .select('id, from_user_id, to_user_id, guest_name, amount, status, from_profiles:from_user_id(full_name), to_profiles:to_user_id(full_name)')
      if (payErr && payErr.code !== '42P01') throw payErr
      
      allPayments.value = payments || []

      const balances = {}

      // Helper to identify user or guest
      const getEntityId = (userId, guestName) => userId ? userId : `guest_${guestName}`
      const getEntityName = (profile, guestName) => profile ? profile.full_name : `${guestName} (Guest)`

      // Calculate Net Balances
      if (meals) {
        meals.forEach(m => {
          if (!balances[m.payer_id]) balances[m.payer_id] = { name: m.profiles?.full_name || 'Unknown', balance: 0, isGuest: false }
          balances[m.payer_id].balance += parseFloat(m.total_cost)
        })
      }

      if (participants) {
        participants.forEach(p => {
          const id = getEntityId(p.user_id, p.guest_name)
          const name = getEntityName(p.profiles, p.guest_name)
          if (!balances[id]) balances[id] = { name, balance: 0, isGuest: !p.user_id }
          balances[id].balance -= parseFloat(p.amount_owed)
        })
      }

      if (payments) {
        payments.forEach(p => {
          if (p.status === 'COMPLETED') {
            const fromId = getEntityId(p.from_user_id, p.guest_name)
            const fromName = getEntityName(p.from_profiles, p.guest_name)
            const toId = p.to_user_id
            const toName = p.to_profiles?.full_name || 'Unknown'

            if (!balances[fromId]) balances[fromId] = { name: fromName, balance: 0, isGuest: !p.from_user_id }
            if (!balances[toId]) balances[toId] = { name: toName, balance: 0, isGuest: false }
            
            balances[fromId].balance += parseFloat(p.amount)
            balances[toId].balance -= parseFloat(p.amount)
          }
        })
      }

      // Separate into Creditors and Debtors
      const creditors = []
      const debtors = []

      for (const [userId, data] of Object.entries(balances)) {
        if (data.balance > 0.01) creditors.push({ userId, name: data.name, balance: data.balance, isGuest: data.isGuest, rawGuestName: data.name.replace(' (Guest)', '') })
        else if (data.balance < -0.01) debtors.push({ userId, name: data.name, balance: Math.abs(data.balance), isGuest: data.isGuest, rawGuestName: data.name.replace(' (Guest)', '') })
      }

      creditors.sort((a, b) => b.balance - a.balance)
      debtors.sort((a, b) => b.balance - a.balance)

      // Greedy Settlement Algorithm
      const transactions = []
      let i = 0, j = 0

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i]
        const creditor = creditors[j]
        const amount = Math.min(debtor.balance, creditor.balance)
        const roundedAmount = Math.round(amount * 100) / 100

        if (roundedAmount > 0) {
          let pendingPayment = null
          if (payments) {
            pendingPayment = payments.find(p => {
              const pFromId = getEntityId(p.from_user_id, p.guest_name)
              return pFromId === debtor.userId && p.to_user_id === creditor.userId && p.status === 'PENDING'
            })
          }

          transactions.push({
            fromId: debtor.userId,
            from: debtor.name,
            fromIsGuest: debtor.isGuest,
            fromRawGuestName: debtor.rawGuestName,
            toId: creditor.userId,
            to: creditor.name,
            amount: roundedAmount,
            status: pendingPayment ? 'SLIP_SENT' : 'UNPAID',
            paymentId: pendingPayment ? pendingPayment.id : null
          })
        }

        debtor.balance -= amount
        creditor.balance -= amount
        if (debtor.balance < 0.01) i++
        if (creditor.balance < 0.01) j++
      }

      // Add fully completed payments as history items
      if (payments) {
         payments.filter(p => p.status === 'COMPLETED').forEach(p => {
            transactions.push({
               fromId: getEntityId(p.from_user_id, p.guest_name),
               from: getEntityName(p.from_profiles, p.guest_name),
               toId: p.to_user_id,
               to: p.to_profiles?.full_name,
               amount: parseFloat(p.amount),
               status: 'COMPLETED',
               paymentId: p.id
            })
         })
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

  const verifyPayment = async (paymentId) => {
    try {
      const { data: payment } = await supabase.from('payments').select('*').eq('id', paymentId).single()
      const { error } = await supabase.from('payments').update({ status: 'COMPLETED' }).eq('id', paymentId)
      if (error) throw error
      
      if (payment && payment.from_user_id) {
         const { useNotificationsStore } = await import('./notificationsStore')
         const notifStore = useNotificationsStore()
         await notifStore.sendNotification(
            payment.from_user_id,
            'PAYMENT_VERIFIED',
            `<b>${authStore.user?.user_metadata?.full_name || authStore.user?.email || 'Someone'}</b> verified your payment slip!`,
            paymentId
         )
      }
      
      await fetchSettlements() // Refresh
    } catch (err) {
      alert("Error verifying payment: " + err.message)
    }
  }

  const settleGuestDebt = async (guestName, amount) => {
    if (!authStore.user) return
    try {
      const { error } = await supabase.from('payments').insert({
        to_user_id: authStore.user.id,
        guest_name: guestName,
        amount: amount,
        receipt_url: 'cash_settled',
        status: 'COMPLETED'
      })
      if (error) throw error
      await fetchSettlements()
    } catch (err) {
      alert("Error settling guest debt: " + err.message)
    }
  }

  return {
    optimizedTransactions,
    allPayments,
    isLoading,
    error,
    myNetBalance,
    iOweTotal,
    owedToMeTotal,
    fetchSettlements,
    verifyPayment,
    settleGuestDebt
  }
})
