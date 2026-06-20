<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import placeholder from '@/assets/images/placeholder.webp'

  // list of images
  const images = [
    placeholder,
    placeholder,
    placeholder,
    placeholder,
    placeholder,
    placeholder,
  ]

  // moves to the next and previous images
  const currentIndex = ref(0)
  const next = () => { currentIndex.value = (currentIndex.value + 1) % images.length }
  const prev = () => { currentIndex.value = (currentIndex.value - 1 + images.length) % images.length }

  // autoslide function
  let timer: ReturnType<typeof setInterval>
  onMounted(() => { timer = setInterval(next, 4000) })

  //clears the timer when the componet is removed (can cause memory leaks)
  onUnmounted(() => { clearInterval(timer) })

  // tracks if lightbox is open and which image is visible
  const lightboxOpen = ref(false)
  const openLightbox = () => { lightboxOpen.value = true }
  const closeLightbox = () => { lightboxOpen.value = false }
</script>

<template>
  <div class="gallery">
    <h1 class="home-title">Gallery</h1>

    <div class="carousel">
      <button class="carousel-btn left" @click="prev">
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      <div class="carousel-track">
        <img
          class="carousel-image"
          :src="images[currentIndex]"
          :key="currentIndex"
          alt="gallery image"
          @click="openLightbox"
        />
      </div>

         <button class="carousel-btn right" @click="next">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

    <!-- dots showing current position -->
    <div class="carousel-dots">
      <span
        v-for="(image, index) in images"
        :key="index"
        :class="['dot', { active: index === currentIndex }]"
        @click="currentIndex = index"
      ></span>
    </div>

    <!-- fullscreen lightbox -->
    <div class="lightbox" v-if="lightboxOpen" @click="closeLightbox">
      <button class="lightbox-close" @click="closeLightbox">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <img class="lightbox-image" :src="images[currentIndex]" alt="gallery image" @click.stop/>
    </div>


  </div>
</template>

<style>
  .carousel{
    display: flex;
    align-items: center;
    justify-content: center;
    background-color:#16263A ;
    padding: 35px 0;
    position: relative;
  }
  .carousel-track{
    width: 1200px;
    height:600px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow:hidden;
    border-radius: 12px;
  }
  .carousel-image{
    width: 100%;
    height:100%;
    object-fit: cover;
    border-radius: 12px;
    transition: opacity 0.3s ease;
  }
  .carousel-btn{
    background-color: rgba(15, 28, 46, 0.8);
    color: #F5C842;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 16px;
    cursor: pointer;
    margin: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }
  .carousel-btn:hover{
    background-color: #F5C842;
    color: #0F1C2E;
  }
  .carousel-dots{
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 12px 0;
    background-color: #16263A;
  }
  .dot{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #3d5a73;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .dot.active{
    background-color: #F5C842;
  }
  .lightbox{
    position:fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .lightbox-image{
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
  }
  .lightbox-close{
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: transparent;
    color: #E6EDF3;
    border: 1px solid #E6EDF3;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 18px;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .lightbox-close:hover{
    background-color: #ff6b6b;
    border-color: #ff6b6b;
    color: white;
  }
  .lightbox-close i {
    background-color: transparent;
    pointer-events: none;
    font-size: 16px;
}
</style>
