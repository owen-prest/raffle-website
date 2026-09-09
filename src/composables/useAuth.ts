// src/composables/useAuth.ts
import { ref, readonly } from 'vue'
import { supabase } from '@/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Centralized state defined outside the composable to ensure single shared instance across app
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const profile = ref<any | null>(null) // Added to track public.profiles data (balance, etc.)
const isLoading = ref<boolean>(true) // Start as true while checking storage on load

// Flag to guarantee setup logic only runs once globally
let isInitialized = false

const fetchProfile = async () => {
  if (!user.value) {
    profile.value = null
    return
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (!error) {
      profile.value = data
    }
  } catch (err) {
    console.error('Error fetching profile:', err)
  }
}

const initAuth = async () => {
  if (isInitialized) return
  isInitialized = true

  try {
    // 1. Fetch initial session from localStorage
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
    if (user.value) {
      await fetchProfile()
    }
  } catch (err) {
    console.error('Error fetching session:', err)
  } finally {
    isLoading.value = false
  }

  // 2. Listen for auth changes (logins, logouts, auto token refreshes)
  supabase.auth.onAuthStateChange(async (_event, sessionData) => {
    session.value = sessionData
    user.value = sessionData?.user ?? null
    if (user.value) {
      await fetchProfile()
    } else {
      profile.value = null
    }
    isLoading.value = false
  })
}

// Automatically start listening as soon as this file is imported anywhere in the app
initAuth()

export function useAuth() {
  // Sign in existing users securely with credentials
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    await fetchProfile()
    return data
  }

  const signUp = async (email: string, password: string, username: string) => {
    const trimmedUsername = (username || '').trim()

    // 1. Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: trimmedUsername } // Stores in auth.users user_metadata
      }
    })

    if (error) throw error

    // 2. Create the corresponding record in public.profiles table
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        username: trimmedUsername,
        updated_at: new Date().toISOString()
      })

      if (profileError) console.error('Error creating profile:', profileError)
      await fetchProfile()
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    profile.value = null
  }

  // Explicitly return auth state and helper functions
  return {
    user: readonly(user),
    session: readonly(session),
    profile: readonly(profile), // 💡 Exposed profile state
    isLoading: readonly(isLoading),
    refreshProfile: fetchProfile, // 💡 Exposed method to reload balance/profile on demand
    signIn,
    signUp,
    signOut
  }
}
