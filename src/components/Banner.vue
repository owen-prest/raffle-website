<script setup lang="ts">
  import bannerimage from '@/assets/images/banner.jpg'
</script>

<template>
 <h1 class="home-title">Welcome to Winna Raffle!</h1>
  <div class="banner">
    <div class="banner-overlay">
      <div class="banner-text">You could be a winner today!</div>
      <div class="banner-text" to="/Login">
        <RouterLink class="link-hover shake" to="/Login">Sign up today!</RouterLink>
      </div>
    </div>
    <img class="banner-image" :src="bannerimage" alt="raffle image">
  </div>
</template>

<style>
  .banner{
    position: relative;
    width: 100%;
  }
  .banner-image{
    width: 100%;
    max-height: 500px;
    object-fit:cover;
    display: block; /* removes the small gap below the image */
  }
  .banner-overlay{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column; /* stacks text on top of each other */
    align-items: center;
    gap: 10px;
    background-color: rgba(22, 38, 58, 0.5);
    padding: 20px;
    border-radius: 10px;
  }
  .banner-text{
    color:#E6EDF3;
    text-align: center;
    font-size: 45px;
    background-color: transparent;
  }
</style>
