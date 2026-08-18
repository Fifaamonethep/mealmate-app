import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('authStore', () => {
  const user = ref(null)
  const isInitialized = ref(false)
  const onlineUsers = ref(new Set())
  const needsOnboarding = ref(false)
  let presenceChannel = null

  const initializePresence = (userId) => {
    if (presenceChannel) {
      supabase.removeChannel(presenceChannel)
    }
    
    presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: userId } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        onlineUsers.value = new Set(Object.keys(state))
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        onlineUsers.value.add(key)
        onlineUsers.value = new Set(onlineUsers.value) // trigger reactivity
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        onlineUsers.value.delete(key)
        onlineUsers.value = new Set(onlineUsers.value)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() })
        }
      })
  }

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetchProfile(session.user.id)
        initializePresence(session.user.id)
      }
    } catch (err) {
      console.error('Error getting session:', err)
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.user.id)
        initializePresence(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        if (presenceChannel) {
          supabase.removeChannel(presenceChannel)
          presenceChannel = null
        }
        onlineUsers.value = new Set()
      }
    })
    
    isInitialized.value = true
  }

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        
      if (data) {
        user.value = {
          id: data.id,
          username: data.username,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          role: data.role || 'user'
        }
        needsOnboarding.value = !data.full_name || data.full_name === 'New User'
      } else if (error && (error.code === 'PGRST116' || error.code === '406')) {
        // Profile doesn't exist yet
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const newProfile = {
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'New User',
            username: authUser.email?.split('@')[0] || `user_${Date.now()}`,
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '',
            role: 'user'
          }
          
          await supabase.from('profiles').insert(newProfile)
          
          user.value = {
            id: newProfile.id,
            username: newProfile.username,
            fullName: newProfile.full_name,
            avatarUrl: newProfile.avatar_url,
            role: newProfile.role
          }
          needsOnboarding.value = !newProfile.full_name || newProfile.full_name === 'New User'
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        username: email.split('@')[0]
      })
      await fetchProfile(data.user.id)
      initializePresence(data.user.id)
    }
    return data
  }

  const loginWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      await fetchProfile(data.user.id)
      initializePresence(data.user.id)
    }
    return data
  }

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  const loginWithOtp = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({ email })
    if (error) throw error
    return data
  }

  const verifyOtp = async (email, token, type = 'email') => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type })
    if (error) throw error
    if (data.user) {
      await fetchProfile(data.user.id)
      initializePresence(data.user.id)
    }
    return data
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    })
    if (error) throw error
  }

  return { 
    user, 
    isInitialized, 
    onlineUsers,
    needsOnboarding,
    initializeAuth, 
    signUp, 
    loginWithPassword, 
    loginWithGoogle,
    loginWithOtp,
    verifyOtp,
    logout,
    resetPassword
  }
})
