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
  color: #E6EDF3;
  font-size: 32px;
  padding: 35px 0 35px 40px;
}
.home{
  background-color: #0B1220;
}
</style>
