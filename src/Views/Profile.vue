<script setup lang="ts">
  import profileImg from '@/assets/images/profileImg.webp'
</script>

<template>
  <div class="profile">
    <div class="profile-menu">
      <h1 class="profile-title">Hello username!</h1>
      <div class ="image-wrapper">
        <img class="profile-image" :src="profileImg" alt="profile image">
      </div>
      <div class="profile-info">
        <h1>Your Username</h1><span>your username</span>
        <h1>Change Password</h1><span>dont show password</span>
        <h1>Your Bio</h1>
      </div>
    </div>
  </div>
</template>

<style>
.profile{
    background-color: red;
    display: flex;
}
  .profile-menu{
    display: inline-block;
    justify-content: center;
    width: 100%;
    background-color: aqua;
  }
</style>
