<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/stores/auth'
import profileImg from '@/assets/images/profileImg.webp'

const router = useRouter()

const username = ref('you username')
const email = ref('your@email.com')
const bio = ref('your bio')

//tracks if the user is in edit mode
const isEditing = ref(false)

// tracks if the users login status
const handleLogout = () => {
  logout()
  router.push('/login')
}
const handleEdit = () => {
  isEditing.value = true
}

// saves changes to the profile
const handleSave =() => {
  isEditing.value = false
  console.group('saved!')
}
</script>

<template>
  <div class="profile">

    <div class="profile-card">
      <h1 class="profile-title">Hello {{ username }}!</h1>

      <div class="profile-body">
        <div class ="profile-left">
          <img class="profile-image" :src="profileImg" alt="profile image">
        </div>

        <div class="profile-info">
          <div class="profile-field">
            <label class="profile-label">Your Username</label>
            <input  v-if="isEditing" v-model="username" class="profile-input" type="text"/>
            <span v-else class="profile-input">{{ username }}</span>
          </div>
          <div class="profile-field">
            <label class="profile-label">Your Email</label>
            <input  v-if="isEditing" v-model="email" class="profile-input" type="email"/>
            <span v-else class="profile-input">{{ email }}</span>
          </div>
          <div class="profile-field">
            <label class="profile-label">Bio</label>
            <textarea  v-if="isEditing" v-model="bio" class="profile-input profile-bio"></textarea>
            <span v-else class="profile-input profile-bio">{{ bio }}</span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="save-btn" @click="handleEdit" v-if="!isEditing">Edit</button>
        <button class="save-btn" @click="handleSave" v-if="isEditing">Save</button>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>

    </div>
  </div>
</template>

<style>
.profile{
  display: flex;
  width: 100%;
  background-color: #0B1220;
  padding: 40px;
}
.profile-card{
  background-color: #16263A;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: fit-content;
}
.profile-title{
  color:#F5C842;
  font-size: 24px;
  margin-bottom: 24px;
  background-color: transparent;
}
.profile-body{
  display: flex;
  gap: 40px;
  align-items: flex-start;
  padding: 40px 40px;
  border-radius: 12px;
}
.profile-left{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap:12px;
}
.profile-image{
  width: 150px;
  height:150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #F5C842;
}
.profile-info{
  flex: 1;
  display:flex;
  flex-direction: column;
  gap: 16px;
}
.profile-field{
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.profile-label{
  color:#6a849e;;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.profile-input{
  background-color: #0B1220;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #E6EDF3;
  outline: none;
  transition: border 0.2s ease;
  max-width: 300px;
  font-size: 16px;
  font-family: inherit;
  display: block; /* makes span behave the same as input */
}
.profile-input:focus{
  border: 1px solid #F5C842;
}
.profile-bio{
  resize: none;
  height: 80px;
  max-width: 100%;
  min-height: 250px;
  max-height: fit-content;
}
.profile-actions{
  display: flex;
  gap: 12px;
  margin-top: 24px;
  background-color: transparent;
}
.save-btn{
  background-color:#F5C842;
  color: #0B1220;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor:pointer;
  transition:background 0.2s ease;
}
.save-btn:hover{
  background-color: #e6b800;
}
.logout-btn{
  background-color: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.logout-btn:hover{
  background-color: #ff6b6b;
  color: #0B1220;
}
</style>
