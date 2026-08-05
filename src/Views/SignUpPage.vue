<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()

const email = ref('')
const password = ref('')
const username = ref('')

const usernameError = ref('')
const passwordError = ref('')
const generalError = ref('')
const isCheckingUsername = ref(false)
const isSubmitting = ref(false)

// Check database for existing username
const checkUsernameAvailability = async (): Promise<boolean> => {
  const trimmed = (username.value || '').trim()
  usernameError.value = ''

  if (!trimmed) {
    usernameError.value = 'Username is required'
    return false
  }

  if (trimmed.length < 3) {
    usernameError.value = 'Username must be at least 3 characters'
    return false
  }

  try {
    isCheckingUsername.value = true
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmed)
      .maybeSingle()

    if (error) throw error

    if (data) {
      usernameError.value = 'Username is already taken'
      return false
    }

    return true
  } catch (err: unknown) {
    console.error('Error checking username:', err)
    return false
  } finally {
    isCheckingUsername.value = false
  }
}

// Validate password length on blur
const validatePassword = () => {
  const cleanPassword = (password.value || '').trim()
  passwordError.value = ''

  if (cleanPassword.length > 0 && cleanPassword.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
  }
}

const handleSignUp = async () => {
  generalError.value = ''
  passwordError.value = ''

  const cleanEmail = (email.value || '').trim()
  const cleanPassword = (password.value || '').trim()
  const cleanUsername = (username.value || '').trim()

  if (cleanPassword.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  const isAvailable = await checkUsernameAvailability()
  if (!isAvailable) return

  try {
    isSubmitting.value = true

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          username: cleanUsername,
        }
      }
    })

    if (error) throw error

    router.push('/profile')
  } catch (err: unknown) {
    if (err instanceof Error) {
      generalError.value = err.message
    } else if (err && typeof err === 'object' && 'message' in err) {
      generalError.value = String((err as { message: unknown }).message)
    } else {
      generalError.value = 'Failed to create account.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="signup">
    <div class="signup-card">
      <h2 class="signup-title">Create Account</h2>

      <form class="signup-form" @submit.prevent="handleSignUp">
        <!-- Username Field -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="signup-input"
            :class="{ 'input-error': usernameError }"
            placeholder="Choose a username"
            @blur="checkUsernameAvailability"
            @input="usernameError = ''"
            required
          />
          <span v-if="isCheckingUsername" class="checking-text">Checking availability...</span>
          <span v-else-if="usernameError" class="error-text">{{ usernameError }}</span>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="signup-input"
            placeholder="you@example.com"
            required
          />
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="signup-input"
            :class="{ 'input-error': passwordError }"
            placeholder="••••••••••••••"
            @blur="validatePassword"
            @input="passwordError = ''"
            required
          />
          <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
        </div>

        <!-- Error Banner -->
        <div v-if="generalError" class="error-message">
          {{ generalError }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="signup-btn"
          :disabled="isSubmitting || isCheckingUsername || !!usernameError || !!passwordError"
        >
          {{ isSubmitting ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>

      <p class="login-link">
        Already have an account? <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.signup {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background-color: #0B1220;
}

.signup-card {
  background-color: #16263a;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.signup-title {
  color: #F5C842;
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #f5c842;
  font-size: 13px;
  font-weight: 500;
}

.signup-input {
  background-color: #0B1220;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #e6edef;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.signup-input:focus {
  border-color: #F5C842;
}

.signup-input.input-error {
  border-color: #ff6b6b;
}

.signup-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #ff6b6b;
  font-size: 12px;
}

.checking-text {
  color: #8fa0b5;
  font-size: 12px;
}

.signup-btn {
  background-color: #F5C842;
  color: #0B1220;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  width: 100%;
  margin-top: 8px;
}

.signup-btn:hover:not(:disabled) {
  background-color: #e6b800;
}

.signup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  background-color: rgba(255, 107, 107, 0.1);
  margin: 0;
}

.login-link {
  color: #8fa0b5;
  font-size: 14px;
  text-align: center;
  margin-top: 25px;
}

.login-link a {
  color: #F5C842;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
