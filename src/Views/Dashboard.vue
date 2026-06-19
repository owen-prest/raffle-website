<script setup lang="ts">
  import Gallery from '@/components/Gallery.vue'
  import Banner from '@/components/Banner.vue'
  import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="home">
    <Banner/>
     <Gallery/>
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
