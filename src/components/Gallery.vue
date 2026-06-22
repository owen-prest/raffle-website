<script setup lang="ts">
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { Navigation, Pagination, Autoplay } from 'swiper/modules'
  import placeholder from '@/assets/images/placeholder.webp'

  import 'swiper/css'
  import 'swiper/css/navigation'
  import 'swiper/css/pagination'

  const images = [
    placeholder,
    placeholder,
    placeholder,
    placeholder,
    placeholder,
  ]
  const modules = [Navigation,Pagination,Autoplay]
</script>

<template>
  <div class="gallery">
    <h1 class="home-title">Gallery</h1>

      <Swiper
        :modules="modules"
        :slides-per-view="1.2"
        :centered-slides="true"
        :space-between="20"
        :navigation="true"
        :pagination=" { clickable: true } "
        :autoplay=" { delay:4000, disableOnInteraction: false } "
        :loop="true"
        class="gallery-swiper"
      >
        <SwiperSlide v-for="( image, index) in images" :key="index">
          <img :src="image" alt="gallery image" class="swiper-image" />
        </SwiperSlide>
      </Swiper>

  </div>
</template>

<style>
  .gallery-swiper{
    width: 100%;
    height: 600px;
    background-color: #16263A;
    padding: 35px 0 50px !important;
  }
  .swiper-image{
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
  .swiper-button-next,
  .swiper-button-prev{
    color:#f5c842;
    padding: 0px 12px;
    border-radius: 12px !important;
    height: 40px;
    width: 40px;
  }
  .swiper-pagination-bullet{
    background-color: #3d5a73;
    opacity: 1;
  }
  .swiper-pagination-bullet-active{
    background-color: #f5c842;
  }
</style>
