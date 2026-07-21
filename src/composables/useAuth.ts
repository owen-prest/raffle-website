// src/composables/useAuth.ts
import { ref } from 'vue'
import { supabase } from '@/supabase'
import type { User, Session } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const isLoading = ref<boolean>(false)

export function useAuth() {
  //session listener - restores session on page load/refresh
  const initAuth = async () => {
    isLoading.value = true
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null

    supabase.auth.onAuthStateChange((_event, sessionData) => {
      session.value = sessionData
      user.value = sessionData?.user ?? null
      isLoading.value = false
    })
  }

  //sign up function
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  //sign in function
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password, })
    if (error) throw error
    user.value = data.user
    session.value = data.session
    return data
  }
  //sign out function
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
    initAuth,
    signUp,
    signIn,
    signOut,
  }
}
