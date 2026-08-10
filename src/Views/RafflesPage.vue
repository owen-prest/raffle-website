<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { mockRaffles } from '@/data/mockRaffles'
  import type { Raffle } from '@/data/mockRaffles'
  import { useAuth } from '@/composables/useAuth'
  import { userTicketStore } from '@/stores/userTickets'

  const router = useRouter()
  const { user } = useAuth()
  const isLoggedIn = computed(() => !!user.value)

  // Live timer state (updates every second)
  const now = ref(new Date().getTime())
  let timerId: number | null = null

  onMounted(() => {
    timerId = window.setInterval(() => {
      now.value = new Date().getTime()
    }, 1000)
  })

  onUnmounted(() => {
    if (timerId) clearInterval(timerId)
  })

  // Tracks which raffle is open in the overlay
  const selectedRaffle = ref<Raffle | null>(null)

  const openOverlay = (raffle: Raffle) => {
    selectedRaffle.value = raffle
  }

  const closeOverlay = () => {
    selectedRaffle.value = null
  }

  // Returns the ticket numbers the user owns for a given raffle
  const getMyTickets = (raffleId: number) => {
    return userTicketStore[raffleId] || []
  }

  // Handles the enter raffle button, redirects if not logged in
  const handleEnter = (raffle: Raffle) => {
    if (!isLoggedIn.value) {
      router.push('/login')
      return
    }
    console.log('entering raffle', raffle.id)
  }

  // Live countdown calculation
  const getTimeRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - now.value
    if (diff <= 0) return 'Ended'

    const seconds = Math.floor((diff / 1000) % 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`
    }
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  }

  // Check if raffle is within the 15-minute post-end grace period
  const isDrawInProgress = (endDate: string) => {
    const endTime = new Date(endDate).getTime()
    const gracePeriod = 15 * 60 * 1000
    return now.value > endTime && now.value <= endTime + gracePeriod
  }

  // Filter out raffles that ended more than 15 minutes ago
  const activeRaffles = computed(() => {
    const gracePeriod = 15 * 60 * 1000
    return mockRaffles.filter(raffle => {
      const endTime = new Date(raffle.endDate).getTime()
      return now.value <= endTime + gracePeriod
    })
  })

  // Raffle progress bar
  const percentSold = (sold: number, total: number) => {
    return Math.round((sold / total) * 100)
  }

  // Pagination
  const currentPage = ref(1)
  const perPage = 6 // 3 columns x 2 rows
  const totalPages = computed(() => Math.ceil(activeRaffles.value.length / perPage))

  const paginatedRaffles = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return activeRaffles.value.slice(start, start + perPage)
  })

  const goToPage = (page: number) => {
    currentPage.value = page
  }
</script>

<template>
  <div class="raffles">
    <h1 class="home-title">Active Raffles</h1>

    <Transition name="fade" mode="out-in">
      <div class="raffle-grid" :key="currentPage">
        <div class="raffle-card" v-for="raffle in paginatedRaffles" :key="raffle.id" @click="openOverlay(raffle)">
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
            <span class="raffle-price">£{{ raffle.ticketPrice}} / per ticket</span>
            <span class="raffle-days">{{ getTimeRemaining(raffle.endDate) }}</span>
          </div>

          <button
            class="raffle-btn"
            @click.stop="handleEnter(raffle)"
            :disabled="isDrawInProgress(raffle.endDate)"
            :class="{ 'disabled-btn': isDrawInProgress(raffle.endDate) }"
          >
            {{ !isLoggedIn ? 'Login to Enter' : (isDrawInProgress(raffle.endDate) ? 'Draw in Progress 🎲' : 'Enter Raffle') }}
          </button>
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

    <Transition name="fade">
      <div class="overlay-backdrop" v-if="selectedRaffle" @click.self="closeOverlay">
        <div class="overlay-card no-scrollbar">
          <!-- close button -->
          <button class="overlay-close" @click="closeOverlay">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- image -->
          <img class="overlay-image" :src="selectedRaffle.image" :alt="selectedRaffle.title"/>

          <!-- details -->
          <div class="overlay-body">
            <h2 class="overlay-title">{{ selectedRaffle.title }}</h2>
            <p class="overlay-prize">🏆 Prize: {{ selectedRaffle.prize }}</p>

            <div class="overlay-info-grid">
              <div class="overlay-info-item">
                <span class="overlay-info-label">Ticket Price</span>
                <span class="overlay-info-value">£{{ selectedRaffle.ticketPrice }}</span>
              </div>
              <div class="overlay-info-item">
                <span class="overlay-info-label">Total Entrants</span>
                <span class="overlay-info-value">{{ selectedRaffle.entrants }}</span>
              </div>
              <div class="overlay-info-item">
                <span class="overlay-info-label">Draw Date</span>
                <span class="overlay-info-value">{{ selectedRaffle.drawDate }}</span>
              </div>
              <div class="overlay-info-item">
                <span class="overlay-info-label">Time Remaining</span>
                <span class="overlay-info-value">{{ getTimeRemaining(selectedRaffle.endDate) }}</span>
              </div>
            </div>

            <div class="overlay-draw-method">
              <span class="overlay-info-label">How it will be drawn</span>
              <p class="overlay-draw-text">{{ selectedRaffle.drawMethod }}</p>
            </div>

            <!-- your tickets if logged in and entered -->
            <div class="overlay-my-tickets" v-if="isLoggedIn && getMyTickets(selectedRaffle.id).length > 0">
              <span class="overlay-info-label">Your Tickets</span>
              <div class="my-ticket-numbers">
                <span
                  class="my-ticket-number"
                  v-for="num in getMyTickets(selectedRaffle.id)"
                  :key="num"
                >
                  #{{ num }}
                </span>
              </div>
            </div>

            <!-- ticket grid -->
            <div class="overlay-tickets">
              <span class="overlay-info-label">Tickets — {{ selectedRaffle.ticketsSold }} sold / {{ selectedRaffle.ticketsTotal - selectedRaffle.ticketsSold }} remaining</span>
              <div class="ticket-grid">
                <div
                  v-for="n in selectedRaffle.ticketsTotal"
                  :key="n"
                  :class="[
                    'ticket-square',
                    n <= selectedRaffle.ticketsSold ? 'ticket-sold' : 'ticket-available',
                    getMyTickets(selectedRaffle.id).includes(n) ? 'ticket-mine' : ''
                  ]"
                  :title="n <= selectedRaffle.ticketsSold ? `Ticket #${n} - Sold` : `Ticket #${n} - Available`"
                ></div>
              </div>
            </div>

            <button
              class="raffle-btn overlay-enter-btn"
              @click="handleEnter(selectedRaffle)"
              :disabled="isDrawInProgress(selectedRaffle.endDate)"
              :class="{ 'disabled-btn': isDrawInProgress(selectedRaffle.endDate) }"
            >
              {{ !isLoggedIn ? 'Login to Enter' : (isDrawInProgress(selectedRaffle.endDate) ? 'Draw in Progress 🎲' : 'Enter Raffle') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
  .home-title{
    color: #E6EDF3;
    padding: 20px 60px;
  }
  .raffle-card{
    background-color: #16263A;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.2s ease;
    margin: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
    padding: 0px 20px 10px 20px;
  }
  .raffle-price{
    color: #F5C842;
  }
  .raffle-days{
    color: #FF6B6B;
    font-size: 12px;
    font-weight: 500;
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
  .raffle-btn:hover:not(:disabled) {
    background-color:#e6b800;
  }
  .disabled-btn {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #6a849e !important;
    color: #E6EDF3 !important;
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
  /* Overlay Styles*/
  .overlay-backdrop{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .overlay-card{
    background-color: #16263A;
    border-radius: 12px;
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .overlay-close{
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #E6EDF3;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  .overlay-close:hover{
    background-color: #ff6b6b;
  }
  .overlay-image{
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 12px 12px 0 0;
  }
  .overlay-body{
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .overlay-title{
    color: #E6EDF3;
    font-size: 22px;
  }
  .overlay-prize{
    color: #F5C842;
    font-size: 15px;
  }
  .overlay-info-grid{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .overlay-info-item{
    display: flex;
    flex-direction: column;
    gap: 4px;
    background-color: #0B1220;
    padding: 12px;
    border-radius: 8px;
  }
  .overlay-info-label{
    color: #6a849e;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .overlay-info-value{
    color: #E6EDF3;
    font-size: 15px;
    font-weight: 500;
  }
  .overlay-draw-method{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .overlay-draw-text{
    color: #E6EDF3;
    font-size: 14px;
  }
  .overlay-my-tickets {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .my-ticket-numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .my-ticket-number {
    background-color: #F5C842;
    color: #0B1220;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
  }
  .overlay-tickets {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ticket-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16px, 1fr));
    gap: 3px;
  }
  .ticket-square {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    cursor: pointer;
  }
  .ticket-available {
    background-color: #1e3a5f;
  }
  .ticket-sold {
    background-color: #3d5a73;
    opacity: 0.5;
  }
  .ticket-mine {
    background-color: #F5C842 !important;
  }
  .overlay-enter-btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    margin: 0;
  }
</style>
