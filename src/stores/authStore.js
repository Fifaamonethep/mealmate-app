import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('authStore', () => {
  const user = ref(null)
  const isInitialized = ref(false)

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetchProfile(session.user.id)
      }
    } catch (err) {
      console.error('Error getting session:', err)
    }
    
    // Listen for auth state changes (Google OAuth redirect fires SIGNED_IN here)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        user.value = null
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
          avatarUrl: data.avatar_url
        }
      } else if (error && (error.code === 'PGRST116' || error.code === '406')) {
        // Profile doesn't exist yet (first Google login). Auto-create it.
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const newProfile = {
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'New User',
            username: authUser.email?.split('@')[0] || `user_${Date.now()}`,
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || ''
          }
          
          await supabase.from('profiles').insert(newProfile)
          
          user.value = {
            id: newProfile.id,
            username: newProfile.username,
            fullName: newProfile.full_name,
            avatarUrl: newProfile.avatar_url
          }
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
    }
    return data
  }

  const loginWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      await fetchProfile(data.user.id)
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

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return { 
    user, 
    isInitialized, 
    initializeAuth, 
    signUp, 
    loginWithPassword, 
    loginWithGoogle, 
    logout 
  }
})
