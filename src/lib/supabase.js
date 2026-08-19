import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  console.warn('Supabase URL or Anon Key is missing. Using mock data mode.');
}

// Custom safe storage for in-app browsers that block localStorage
const customStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key)
    } catch (error) {
      console.warn('localStorage is blocked, using memory fallback for reading')
      return null
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value)
    } catch (error) {
      console.warn('localStorage is blocked, using memory fallback for writing')
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.warn('localStorage is blocked, using memory fallback for removing')
    }
  }
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
