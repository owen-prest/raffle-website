<script setup lang="ts">
  import placeholder from '@/assets/images/placeholder.webp'
</script>

<template>
  <div class="gallery">
    <h1 class="home-title">Gallery</h1>
    <div class="gallery-grid">
      <img class="gallery-image" :src="placeholder" alt="placeholder img">
      <img class="gallery-image" :src="placeholder" alt="placeholder img">
      <img class="gallery-image" :src="placeholder" alt="placeholder img">
    </div>
  </div>
</template>

<style>
  .gallery{
    width: 100%;
    padding: 0px;
  }
  .gallery-grid{
    display: flex;
    padding: 35px 0;
    align-items: center;
    justify-content: center;
    gap: 20px;
    background-color: #16263A;
  }
  .gallery-image{
    max-height: 300px;
    margin: 0px 30px;
    border-radius: 10%;
  }
</style>
