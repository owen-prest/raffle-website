<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signUp } = useAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleSignUp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Basic validation
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    const data = await signUp(email.value, password.value)
    // supabase requres email confirmation by default.
    if (data.user && !data.session) {
      successMessage.value = 'Sign up successful! Please check your email to confirm your account.'
    } else {
      // if email confirmation is disabled, auto-redirect user to app.
      router.push('/')
    }
  } catch (err) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'An error occurred during sign up'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="signup">
    <div class="signup-card">
      <h1 class="signup-title">Create an Account</h1>

      <form @submit.prevent="handleSignUp" class="singup-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="signup-input"
            :disabled="isLoading"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="At least 6 characters"
            class="signup-input"
            :disabled="isLoading"
            required
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            class="signup-input"
            :disabled="isLoading"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button class="signup-btn" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
        </button>

        <p class="login-link">
          Already have an account?
          <router-link to="/login">Log in</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style>
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
    padding-bottom:20px;
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
  .signup-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .signup-btn {
    background-color: #F5C842;
    color: #0B1220;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    width: 100%;
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
  .success-message {
    color: #4cd964;
    font-size: 13px;
    text-align: center;
    padding: 10px;
    border-radius: 6px;
    background-color: rgba(76, 217, 100, 0.1);
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
