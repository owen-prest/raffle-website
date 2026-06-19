<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter} from 'vue-router'
  import { isLoggedIn, login } from '@/stores/auth'

  const router = useRouter()

  const email = ref('')
  const password = ref ('')
  const errorMessage = ref('')

  const fakeUser = {
    email:'test@example.com',
    password:'password123'
  }

  const handleLogin = () =>{
    // resets error message
    errorMessage.value = ''

    // check if fields are empty
    if (!email.value  || !password.value){
      errorMessage.value="Please fill in all fields"
      return
    }
    // checks for valid email
    if (!email.value.includes('@')) {
      errorMessage.value = 'Please enter a valid email'
      return
    }
    // check if credentials match fake user, sets status to logged (Auth.ts) and redirects
    if (email.value === fakeUser.email && password.value === fakeUser.password){
      console.log('login called')
      login()
      console.log('isLoggedIn', isLoggedIn.value)
      router.push('/')
    } else {
      errorMessage.value = 'Invalid email or password'
    }
  }

</script>

<template>
  <div class="login">
    <div class="login-menu">
      <h1 class="login-title">Welcome to the Login Page</h1>
        <div class="login-form">
          <input v-model="email" type="email" placeholder="Email" class="login-input">
          <input v-model="password" type="password" placeholder="Password" class="login-input">
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button class="login-btn" @click="handleLogin">Sign in</button>
        </div>
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
  background-color: #F5C842;;
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
</style>
