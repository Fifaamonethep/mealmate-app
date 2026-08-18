import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useNotificationsStore = defineStore('notificationsStore', () => {
  const notifications = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  
  const authStore = useAuthStore()
  
  let subscription = null

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.is_read).length
  })

  const fetchNotifications = async () => {
    if (!authStore.user) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
        
      if (err) throw err
      notifications.value = data || []
    } catch (err) {
      console.error("Error fetching notifications:", err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (id) => {
    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        
      if (err) throw err
      
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value[index].is_read = true
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    if (!authStore.user) return
    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', authStore.user.id)
        .eq('is_read', false)
        
      if (err) throw err
      
      notifications.value.forEach(n => n.is_read = true)
    } catch (err) {
      console.error("Error marking all as read:", err)
    }
  }
  
  const sendNotification = async (userId, type, message, relatedId = null) => {
    try {
      const { error: err } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          message: message,
          related_id: relatedId
        })
      if (err) throw err
    } catch (err) {
      console.error("Error sending notification:", err)
    }
  }

  const subscribeToNotifications = () => {
    if (!authStore.user) return
    
    if (subscription) {
      supabase.removeChannel(subscription)
    }

    subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${authStore.user.id}`
        },
        (payload) => {
          // Add new notification to the top
          notifications.value.unshift(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${authStore.user.id}`
        },
        (payload) => {
          const index = notifications.value.findIndex(n => n.id === payload.new.id)
          if (index !== -1) {
            notifications.value[index] = payload.new
          }
        }
      )
      .subscribe()
  }

  const unsubscribe = () => {
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
    }
  }

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    subscribeToNotifications,
    unsubscribe
  }
})
