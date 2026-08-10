<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '@/supabase'
  import { useAuth } from '@/composables/useAuth'

  interface Raffle {
    id: number
    title: string
    image: string
    prize: string
    ticketPrice: number
    ticketsSold: number
    ticketsTotal: number
    endDate: string
    entrants: number
    drawMethod: string
    drawDate: string
  }

  interface TicketRecord {
    raffle_id: number
    ticket_number: number
    user_id: string
  }

  const router = useRouter()
  const { user } = useAuth()
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = ref(false)

  const raffles = ref<Raffle[]>([])
  const loadingRaffles = ref(true)
  const userTicketsMap = ref<Record<number, number[]>>({})
  const soldTicketsSet = ref<Record<number, Set<number>>>({})

  // Purchase state
  const ticketQuantity = ref(1)
  const purchasing = ref(false)
  const purchaseError = ref('')
  const purchaseSuccess = ref('')

  // Live timer state (updates every second)
  const now = ref(new Date().getTime())
  let timerId: number | null = null

  onMounted(async () => {
    timerId = window.setInterval(() => {
      now.value = new Date().getTime()
    }, 1000)

    await fetchRaffles()
    await checkAdminStatus()
    if (user.value) {
      await fetchUserTickets()
    }
  })

  watch(user, async (newUser) => {
    await checkAdminStatus()
    if (newUser) {
      await fetchUserTickets()
    } else {
      userTicketsMap.value = {}
    }
  })

  onUnmounted(() => {
    if (timerId) clearInterval(timerId)
  })

  // Fetch raffles and sold ticket allocations from Supabase
  const fetchRaffles = async () => {
    try {
      loadingRaffles.value = true
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
        entrants: r.entrants,
        drawMethod: r.draw_method,
        drawDate: r.draw_date
      }))

      // Fetch all sold tickets to map grid availability accurately
      const { data: ticketData } = await supabase.from('tickets').select('raffle_id, ticket_number')
      const map: Record<number, Set<number>> = {}
      if (ticketData) {
        ticketData.forEach((t: { raffle_id: number; ticket_number: number }) => {
          if (!map[t.raffle_id]) map[t.raffle_id] = new Set()
          map[t.raffle_id].add(t.ticket_number)
        })
      }
      soldTicketsSet.value = map
    } catch (err) {
      console.error('Error fetching raffles:', err)
    } finally {
      loadingRaffles.value = false
    }
  }

  // Fetch current user's tickets
  const fetchUserTickets = async () => {
    if (!user.value) return
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('raffle_id, ticket_number')
        .eq('user_id', user.value.id)

      if (error) throw error

      const map: Record<number, number[]> = {}
      data?.forEach((t: TicketRecord) => {
        if (!map[t.raffle_id]) map[t.raffle_id] = []
        map[t.raffle_id].push(t.ticket_number)
      })
      userTicketsMap.value = map
    } catch (err) {
      console.error('Error fetching user tickets:', err)
    }
  }

  // Check if current user is an admin
  const checkAdminStatus = async () => {
    if (!user.value) {
      isAdmin.value = false
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.value.id)
        .single()

      if (!error && data?.is_admin) {
        isAdmin.value = true
      } else {
        isAdmin.value = false
      }
    } catch (err) {
      isAdmin.value = false
    }
  }

  // Overlay state
  const selectedRaffle = ref<Raffle | null>(null)

  const openOverlay = (raffle: Raffle) => {
    selectedRaffle.value = raffle
    ticketQuantity.value = 1
    purchaseError.value = ''
    purchaseSuccess.value = ''
  }

  const closeOverlay = () => {
    selectedRaffle.value = null
  }

  const getMyTickets = (raffleId: number) => {
    return userTicketsMap.value[raffleId] || []
  }

  const isTicketSold = (raffleId: number, n: number) => {
    return soldTicketsSet.value[raffleId]?.has(n) || false
  }

  // Handle Ticket Purchase Checkout
  const handlePurchase = async (raffle: Raffle) => {
    if (!isLoggedIn.value) {
      router.push('/login')
      return
    }

    purchaseError.value = ''
    purchaseSuccess.value = ''

    const remainingTickets = raffle.ticketsTotal - raffle.ticketsSold
    if (ticketQuantity.value > remainingTickets) {
      purchaseError.value = `Only ${remainingTickets} tickets remaining.`
      return
    }

    try {
      purchasing.value = true

      // Find available ticket numbers
      const soldSet = soldTicketsSet.value[raffle.id] || new Set()
      const availableNumbers: number[] = []
      for (let i = 1; i <= raffle.ticketsTotal; i++) {
        if (!soldSet.has(i)) availableNumbers.push(i)
      }

      // Randomly pick N available numbers
      const chosenNumbers: number[] = []
      for (let i = 0; i < ticketQuantity.value; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length)
        chosenNumbers.push(availableNumbers.splice(randomIndex, 1)[0])
      }

      // Insert tickets into Supabase
      const insertPayload = chosenNumbers.map(num => ({
        raffle_id: raffle.id,
        user_id: user.value!.id,
        ticket_number: num
      }))

      const { error: ticketError } = await supabase.from('tickets').insert(insertPayload)
      if (ticketError) throw ticketError

      // Check if user already entered this raffle before
      const userAlreadyEntered = getMyTickets(raffle.id).length > 0
      const newEntrantsCount = userAlreadyEntered ? raffle.entrants : raffle.entrants + 1
      const newTicketsSold = raffle.ticketsSold + ticketQuantity.value

      // Update raffle stats in Supabase
      const { error: raffleError } = await supabase
        .from('raffles')
        .update({
          tickets_sold: newTicketsSold,
          entrants: newEntrantsCount
        })
        .eq('id', raffle.id)

      if (raffleError) throw raffleError

      purchaseSuccess.value = `Successfully purchased ${ticketQuantity.value} ticket(s)!`

      // Refresh local data
      await fetchRaffles()
      await fetchUserTickets()

      // Keep overlay updated
      const updatedRaffle = raffles.value.find(r => r.id === raffle.id)
      if (updatedRaffle) selectedRaffle.value = updatedRaffle

    } catch (err: unknown) {
      console.error('Error purchasing tickets:', err)
      if (err && typeof err === 'object' && 'message' in err) {
        purchaseError.value = (err as { message: string }).message
      } else {
        purchaseError.value = 'Failed to purchase tickets.'
      }
    } finally {
      purchasing.value = false
    }
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

  const isDrawInProgress = (endDate: string) => {
    const endTime = new Date(endDate).getTime()
    const gracePeriod = 15 * 60 * 1000
    return now.value > endTime && now.value <= endTime + gracePeriod
  }

  const activeRaffles = computed(() => {
    const gracePeriod = 15 * 60 * 1000
    return raffles.value.filter(raffle => {
      const endTime = new Date(raffle.endDate).getTime()
      return now.value <= endTime + gracePeriod
    })
  })

  const percentSold = (sold: number, total: number) => {
    return Math.round((sold / total) * 100)
  }

  // Pagination
  const currentPage = ref(1)
  const perPage = 6
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
    <div class="header-row">
      <h1 class="home-title accent-title">Active Raffles</h1>
      <div v-if="isAdmin" class="admin-actions-bar">
        <router-link to="/admin/create-raffle" class="admin-action-btn">
          ➕ Create Raffle
        </router-link>
        <router-link to="/admin/dashboard" class="admin-action-btn">
          🛡️ Admin Dashboard
        </router-link>
      </div>
    </div>

    <div v-if="loadingRaffles" class="loading-state">Loading raffles...</div>

    <template v-else>
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
                <span class="progress-text">{{ raffle.ticketsSold }} / {{ raffle.ticketsTotal }} tickets sold</span>
              </div>
            </div>

            <div class="raffle-footer">
              <span class="raffle-price">£{{ raffle.ticketPrice }} / per ticket</span>
              <span class="raffle-days">{{ getTimeRemaining(raffle.endDate) }}</span>
            </div>

            <button
              class="raffle-btn"
              @click.stop="openOverlay(raffle)"
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
    </template>

    <Transition name="fade">
      <div class="overlay-backdrop" v-if="selectedRaffle" @click.self="closeOverlay">
        <div class="overlay-card no-scrollbar">
          <button class="overlay-close" @click="closeOverlay">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <img class="overlay-image" :src="selectedRaffle.image" :alt="selectedRaffle.title"/>

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
                <span class="overlay-info-value">{{ new Date(selectedRaffle.drawDate).toLocaleString() }}</span>
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

            <!-- Your Tickets -->
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

            <!-- Ticket Grid Preview -->
            <div class="overlay-tickets">
              <span class="overlay-info-label">Tickets — {{ selectedRaffle.ticketsSold }} sold / {{ selectedRaffle.ticketsTotal - selectedRaffle.ticketsSold }} remaining</span>
              <div class="ticket-grid">
                <div
                  v-for="n in selectedRaffle.ticketsTotal"
                  :key="n"
                  :class="[
                    'ticket-square',
                    isTicketSold(selectedRaffle.id, n) ? 'ticket-sold' : 'ticket-available',
                    getMyTickets(selectedRaffle.id).includes(n) ? 'ticket-mine' : ''
                  ]"
                  :title="isTicketSold(selectedRaffle.id, n) ? `Ticket #${n} - Sold` : `Ticket #${n} - Available`"
                ></div>
              </div>
            </div>

            <!-- Checkout Section -->
            <div class="checkout-box" v-if="!isDrawInProgress(selectedRaffle.endDate)">
              <div v-if="purchaseError" class="error-banner">{{ purchaseError }}</div>
              <div v-if="purchaseSuccess" class="success-banner">{{ purchaseSuccess }}</div>

              <div class="checkout-row" v-if="isLoggedIn">
                <div class="quantity-selector">
                  <label class="overlay-info-label">Select Quantity</label>
                  <input v-model.number="ticketQuantity" class="profile-input qty-input" type="number" min="1" :max="selectedRaffle.ticketsTotal - selectedRaffle.ticketsSold" />
                </div>
                <div class="checkout-total">
                  <span class="overlay-info-label">Total Cost</span>
                  <span class="total-price-value">£{{ ticketQuantity * selectedRaffle.ticketPrice }}</span>
                </div>
              </div>

              <button
                class="raffle-btn overlay-enter-btn"
                @click="handlePurchase(selectedRaffle)"
                :disabled="purchasing"
              >
                {{ !isLoggedIn ? 'Login to Enter' : (purchasing ? 'Processing... 💳' : `Buy ${ticketQuantity} Ticket(s) (£${ticketQuantity * selectedRaffle.ticketPrice})`) }}
              </button>
            </div>

            <div v-else class="error-banner text-center">Draw in progress. Ticket sales are closed.</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  .raffles{
    padding: 0 0 40px;
  }
  .accent-title {
    color: #F5C842 !important;
  }
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 60px;
  }
  .home-title{
    color: #E6EDF3;
    padding: 0;
  }
  .admin-actions-bar {
    display: flex;
    gap: 12px;
  }
  .admin-action-btn {
    background-color: #16263A;
    color: #F5C842;
    border: 1px solid rgba(245, 200, 66, 0.3);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }
  .admin-action-btn:hover {
    background-color: #F5C842;
    color: #0B1220;
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
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
  /* Overlay Styles */
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
    max-height: 120px;
    overflow-y: auto;
    padding: 4px;
    background-color: #0B1220;
    border-radius: 8px;
  }
  .ticket-square {
    width: 16px;
    height: 16px;
    border-radius: 2px;
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
  .checkout-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #0B1220;
    padding: 16px;
    border-radius: 8px;
  }
  .checkout-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .quantity-selector {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  .qty-input {
    background-color: #16263A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    color: #E6EDF3;
  }
  .checkout-total {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }
  .total-price-value {
    color: #F5C842;
    font-size: 18px;
    font-weight: 600;
  }
  .overlay-enter-btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    margin: 0;
  }
  .loading-state {
    color: #6a849e;
    text-align: center;
    padding: 40px;
    font-size: 15px;
  }
  .error-banner {
    background-color: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
    padding: 10px;
    border-radius: 8px;
    font-size: 13px;
  }
  .success-banner {
    background-color: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
    padding: 10px;
    border-radius: 8px;
    font-size: 13px;
  }
  .text-center {
    text-align: center;
  }
</style>
