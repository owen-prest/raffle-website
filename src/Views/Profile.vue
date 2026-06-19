<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/stores/auth'
import profileImg from '@/assets/images/profileImg.webp'

const router = useRouter()

const username = ref('you username')
const email = ('your@email.com')
const bio =('your bio')

const handleLogout = () => {
  logout()
  router.push('/login')
}

const handleSave =() => {
  console.group('saved!')
}
</script>

<template>
  <div class="profile">

    <div class="profile-card">
      <h1 class="profile-title">Hello {{ username }}>!</h1>

        <div class="profile-body">

          <div class ="profile-left">
            <img class="profile-image" :src="profileImg" alt="profile image">
          </div>

          <div class="profile-info">
            <div class="profile-field">
              <h1 class="profile-text">Your Username</h1><span class="profile-text">your username</span>
            </div>
            <div lass="profile-field">
              <h1 class="profile-text">Change Password</h1><span class="profile-text">dont show password</span>
            </div>
            <div lass="profile-field">
              <h1 class="profile-text">Your Bio</h1>
            </div>
          </div>

        </div>
    </div>

  </div>
</template>

<style>
.profile{
    background-color: red;
    display: flex;
    width: 100%;
    background-color: #16263A;

}
.profile-menu{
  display: inline-block;
  justify-content: center;
  width: 100%;
  background-color: transparent;
  padding: 40px;
}
.image-wrapper{
  display: flex;
  background-color: transparent;
}
.profile-image{
  max-height:150px;
  border-radius: 50%;
  border: 2px solid grey;
}
.profile-menu{
  background-color: transparent;
  width: 100%;
}
.profile-info{
  background-color: transparent;
  border: 1px solid grey;
  border-radius: 12px;
}
.profile-text{
  background-color: transparent;
  color: #e6edef;
  padding: 10px;
  font-size: 22px;
}
</style>
