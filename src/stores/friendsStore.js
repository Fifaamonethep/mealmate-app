import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useFriendsStore = defineStore('friendsStore', () => {
  const friendsList = ref([])

  const fetchFriends = async () => {
    try {
      // Fetch all profiles from Supabase to populate friends list
      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) throw error

      if (data) {
        friendsList.value = data.map(p => ({
          id: p.id,
          username: p.username,
          name: p.full_name,
          avatarUrl: p.avatar_url
        }))
      }
    } catch (error) {
      console.error('Error fetching friends from Supabase:', error.message)
    }
  }

  return { friendsList, fetchFriends }
})
