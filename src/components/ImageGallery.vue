<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { Navigation, Pagination, Autoplay } from 'swiper/modules'
  import { supabase } from '@/supabase'

  import 'swiper/css'
  import 'swiper/css/navigation'
  import 'swiper/css/pagination'

  interface Raffle {
    id: number
    title: string
    image: string
    prize: string
    ticketPrice: number
    ticketsSold: number
    ticketsTotal: number
    endDate: string
  }

  const raffles = ref<Raffle[]>([])
  const loading = ref(true)
  const swiperModules = [Navigation, Pagination, Autoplay]

  // Fetch raffles from Supabase on component mount
  const fetchActiveRaffles = async () => {
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      raffles.value = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        prize: r.prize,
        ticketPrice: r.ticket_price,
        ticketsSold: r.tickets_sold,
        ticketsTotal: r.tickets_total,
        endDate: r.end_date,
      }))
    } catch (err) {
      console.error('Error fetching gallery raffles:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchActiveRaffles()
  })
</script>

<template>
  <div class="gallery">
    <h1 class="home-title">Active Raffles Gallery</h1>

    <div v-if="loading" class="loading-state">Loading active raffles...</div>

    <Swiper
      v-else-if="raffles.length > 0"
      :modules="swiperModules"
      :slides-per-view="3"
      :centered-slides="true"
      :space-between="20"
      :navigation="true"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 4000, disableOnInteraction: false }"
      :loop="true"
      class="gallery-swiper"
    >
      <SwiperSlide v-for="raffle in raffles" :key="raffle.id">
        <div class="slide-content">
          <img :src="raffle.image" :alt="raffle.title" class="swiper-image" />
          <div class="slide-caption">
            <h3>{{ raffle.title }}</h3>
            <p>🏆 Prize: {{ raffle.prize }}</p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <div v-else class="empty-state">No active raffles found.</div>
  </div>
</template>

<style>
 .gallery-swiper {
    width: 100%;
    height: 600px;
    background-color: #16263A;
    padding: 35px 0 50px !important;
    border-radius: 12px;
  }
  .slide-content {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .swiper-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    background-color: #16263A;
  }
  .slide-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(11, 18, 32, 0.9), transparent);
    padding: 24px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    color: #E6EDF3;
  }
  .slide-caption h3 {
    font-size: 18px;
    font-weight: 600;
    color: #F5C842;
    margin-bottom: 4px;
  }
  .slide-caption p {
    font-size: 14px;
    color: #c8dcea;
  }
  .swiper-slide {
    background-color: transparent;
  }
  .swiper-button-next,
  .swiper-button-prev {
    color: #f5c842;
    padding: 0px 12px;
    border-radius: 12px !important;
    height: 40px;
    width: 40px;
    background-color: rgba(22, 38, 58, 0.8);
  }
  .swiper-pagination-bullet {
    background-color: #3d5a73;
    opacity: 1;
  }
  .swiper-pagination-bullet-active {
    background-color: #f5c842;
  }
  .loading-state, .empty-state {
    color: #6a849e;
    padding: 20px 0;
    text-align: center;
  }
</style>
