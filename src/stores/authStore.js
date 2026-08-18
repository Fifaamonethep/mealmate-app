import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('authStore', () => {
  const user = ref(null)
  const isInitialized = ref(false)

  // Auto-detect if user is already logged in
  const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetchProfile(session.user.id)
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchProfile(session.user.id)
      } else {
        user.value = null
      }
    })
    isInitialized.value = true
  }

  const fetchProfile = async (userId) => {
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
    }
  }

  const signUp = async (email, password, fullName) => {
    // 1. Create Auth User
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    
    // 2. Wait for trigger or manually insert into profiles
    // In many Supabase setups, a Postgres trigger creates the profile. 
    // If not, we insert it manually here. Let's try inserting manually.
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
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
