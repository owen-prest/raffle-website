<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { mockRaffles } from '@/data/mockRaffles';

  // raffle date calculation
  const daysLeft = (endDate:string) => {
    const diff = new Date(endDate).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / ( 1000 * 60 * 60 * 24 )))
  }

  // raffle progress bar
  const percentSold = (sold:number, total:number) => {
    return Math.round((sold/total) * 100)
  }

  //pagination
  const currentPage = ref(1)
  const perPage = 6 // 3 columns x 2 rows
  const totalPages = computed (() => Math.ceil(mockRaffles.length / perPage))

  const paginatedRaffles = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return mockRaffles.slice(start, start + perPage)
  })

  const goToPage = (page:number) => {
    currentPage.value = page
  }
</script>

<template>
  <div class="raffles">
    <h1 class="home-title">Welcome to the Raffle Page</h1>

    <Transition name="fade" mode="out-in">
      <div class="raffle-grid" :key="currentPage">
        <div class="raffle-card" v-for="raffle in paginatedRaffles" :key="raffle.id">
          <img class="raffle-image" :src="raffle.image" :alt="raffle.title"/>

          <div class="raffle-body">

            <h2 class="raffle-title">{{ raffle.title }}</h2>
            <p class="raffle-prize">{{ raffle.prize }}</p>

            <div class="raffle-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: percentSold(raffle.ticketsSold, raffle.ticketsTotal) + '%'}"></div>
              </div>
              <span class="progress-text">{{ raffle.ticketsSold}} / {{ raffle.ticketsTotal }} tickets sold</span>
            </div>

          </div>

          <div class="raffle-footer">
            <span class="raffle-price">{{ raffle.ticketPrice}} / per ticket</span>
            <span class="raffle-days">{{ daysLeft(raffle.endDate)}} days left</span>
          </div>

          <button class="raffle-btn">Enter Raffle</button>

        </div>
      </div>
    </Transition>

    <div class="pagination" v-if="totalPages > 1">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="['page-btn', {active: page === currentPage}]"
        @click="goToPage(page)"
      >
      {{ page }}
    </button>
    </div>

  </div>
</template>

<style>
  .raffles{
    padding: 0 0 40px;
  }
  .raffle-grid{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding: 0 40px;
  }
  @media (max-width: 900px) {
    .raffle-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 600px) {
    .raffle-grid {
      grid-template-columns: 1fr;
    }
  }
  .raffle-card{
    background-color: #16263A;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.2s ease;
    margin: 20px;
  }
  .raffle-card:hover{
    transform: translateY(-4px);
  }
  .raffle-image{
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
  .raffle-body{
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .raffle-title{
    color: #E6EDF3;
  }
  .raffle-prize{
    color: #6a849e;
    font-size: 14px;
  }
  .raffle-progress{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .progress-bar{
    width: 100%;
    height: 8px;
    background-color: #0B1220;
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-fill{
    height: 100%;
    background-color: #F5C842;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .progress-text{
    color: #6a849e;
    font-size: 12px;
  }
  .raffle-footer{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 20px;
  }
  .raffle-price{
    color: #F5C842;
  }
  .raffle-days{
    color:  #FF6B6B;
    font-size: 12px;
  }
  .raffle-btn{
    background-color:#F5C842;
    color:#0B1220;
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    margin: 20px;
  }
  .raffle-btn:hover
  {
    background-color:#e6b800;
  }
  .pagination{
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
  }
  .page-btn{
    background-color: #16263A;
    color: #6a849e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .page-btn:hover{
    color: #E6EDF3;
  }
  .page-btn.active{
    background-color: #F5C842;
    color: #0B1220;
    border-color: #F5C842;
  }
</style>
