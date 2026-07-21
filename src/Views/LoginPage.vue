<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter} from 'vue-router'
  import { useAuth } from '../composables/useAuth'

  const router = useRouter()
  const { signIn } = useAuth()

  const email = ref('')
  const password = ref ('')
  const errorMessage = ref('')
  const isLoading = ref(false)

  const handleLogin = async() =>{
    // resets error message
    errorMessage.value = ''
    // basic validation for empty fields and valid email format
    if (!email.value  || !password.value){
      errorMessage.value="Please fill in all fields"
      return
    }
    if (!email.value.includes('@')) {
      errorMessage.value = 'Please enter a valid email'
      return
    }

    isLoading.value = true

    try{
      // authentication with Supabase
      await signIn(email.value, password.value)

      //redirect to home on successful authentication
      router.push('/')
      } catch (err) {
          // Type-safe error handling without 'any'
          if (err instanceof Error) {
            errorMessage.value = err.message
          } else {
            errorMessage.value = 'An error occurred during login'
          }
        } finally {
          isLoading.value = false
        }
  }
</script>

<template>
  <div class="login">
    <div class="login-menu">
      <h1 class="login-title">Welcome to the Login Page</h1>

        <form @submit.prevent="handleLogin" class="login-form">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="login-input"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="login-input"
          />

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <button class="login-btn" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Log in' }}
          </button>

          <!-- New Signup Link-->
          <p class="auth-switch">
            Don't have an account? <router-link class="auth-link button" to="/signup">Sign up</router-link>
          </p>

        </form>
    </div>
  </div>
</template>

<style>
.login{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80%;
  background-color: #0B1220;
  flex: 1;
}
.login-menu{
  background-color: #16263a;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba( 255, 255, 255, 0.1);
}
.login-title{
  background-color: transparent;
  color: #F5C842;
  font-size:24px;
  margin-bottom: 24px;
  text-align: center;
}
.login-form{
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: transparent;
}
.login-input{
  background-color: #0B1220;
  border: 1px solid rgba( 255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #e6edef;
  font-size: 14PX;
  outline: none;
  transition: BORDER 0.2s ease;
}
.login-btn{
  background-color: #F5C842;
  color: #0B1220;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}
.login-btn:focus{
border: 1px solid #F5C842;
}
.login-btn:hover{
  background-color: #e6b800;
}
.error-message {
  color: #ff6b6b;
  font-size: 16px;
  text-align: center;
  padding: 16px;
  border-radius: 12px;
}
.auth-switch {
  margin-top: 1.25rem;
  font-size: 0.9rem;
  color: #666; /* Adjust to match your theme's muted text color */
  text-align: center;
}

.auth-link {
  color: #F5C842; /* Vue green or your primary brand color */
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
}

.auth-link:hover {
  color: #e6b800;
  transition: 0.2s ease;
}
</style>
