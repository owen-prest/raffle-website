<script setup lang="ts">
  import ImageGallery from '@/components/ImageGallery.vue'
  import HomeBanner from '@/components/HomeBanner.vue'
</script>

<template>
  <div class="home">
    <HomeBanner/>
     <ImageGallery/>
  </div>
</template>

<style>
.home-title{
  color: #f5c842;
  font-size: 32px;
  padding: 20px 60px;
}
.home{
  background-color: #0B1220;
}
</style>
