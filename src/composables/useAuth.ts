// src/composables/useAuth.ts
import { ref } from 'vue'
import { supabase } from '@/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Global reactive state
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const isLoading = ref<boolean>(true) // Start as true while checking storage on load

// Flag to guarantee setup logic only runs once globally
let isInitialized = false

const initAuth = async () => {
  if (isInitialized) return
  isInitialized = true

  try {
    // 1. Fetch initial session from localStorage
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
  } catch (err) {
    console.error('Error fetching session:', err)
  } finally {
    isLoading.value = false
  }

  // 2. Listen for auth changes (logins, logouts, auto token refreshes)
  supabase.auth.onAuthStateChange((_event, sessionData) => {
    session.value = sessionData
    user.value = sessionData?.user ?? null
    isLoading.value = false
  })
}

// Automatically start listening as soon as this file is imported anywhere in the app
initAuth()

export function useAuth() {
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    session.value = data.session
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    session.value = null
  }

  return {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  }
}
