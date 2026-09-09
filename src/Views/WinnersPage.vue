<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import placeholder from '@/assets/images/placeholder.webp'

interface CompletedRaffle {
  id: number
  title: string
  image: string
  prize: string
  winningTicketNumber?: number
  endDate: string
  profiles?: {
    username?: string
    avatar_url?: string
  }
}

const completedRaffles = ref<CompletedRaffle[]>([])
const loading = ref(true)

const fetchCompletedRaffles = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('raffles')
      .select(`
        id,
        title,
        image,
        prize,
        winning_ticket_number,
        end_date,
        profiles:winner_id (
          username,
          avatar_url
        )
      `)
      .eq('status', 'completed')
      .order('end_date', { ascending: false })

    if (error) throw error

    completedRaffles.value = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      image: r.image,
      prize: r.prize,
      winningTicketNumber: r.winning_ticket_number,
      endDate: r.end_date,
      profiles: r.profiles
    }))
  } catch (err) {
    console.error('Error fetching completed raffles:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchCompletedRaffles()
})
</script>

<template>
  <div class="winners-page">
    <h1 class="home-title accent-title">Past Winners Archive</h1>

    <div v-if="loading" class="loading-state">Loading past winners...</div>

    <template v-else>
      <div v-if="completedRaffles.length > 0" class="raffle-grid">
        <div class="raffle-card" v-for="raffle in completedRaffles" :key="raffle.id">
          <img class="raffle-image" :src="raffle.image" :alt="raffle.title" />

          <div class="raffle-body">
            <h2 class="raffle-title">{{ raffle.title }}</h2>
            <p class="raffle-prize">🏆 Prize: {{ raffle.prize }}</p>

            <div class="winner-box" v-if="raffle.winningTicketNumber">
              <div class="winner-user-info">
                <img
                  :src="raffle.profiles?.avatar_url || placeholder"
                  alt="Winner Avatar"
                  class="winner-avatar"
                />
                <span class="winner-username">
                  Winner: <strong>{{ raffle.profiles?.username || 'Anonymous User' }}</strong>
                </span>
              </div>
              <div class="winning-ticket-badge">
                Winning Ticket: #{{ raffle.winningTicketNumber }}
              </div>
            </div>

            <div v-else class="no-winner-box">
              <p class="empty-text">No tickets were sold for this raffle.</p>
            </div>
          </div>

          <div class="raffle-footer">
            <span class="raffle-days">Ended: {{ new Date(raffle.endDate).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-text">No completed raffles yet. Check back soon after active draws conclude!</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.winners-page {
  padding: 0 0 40px;
}
.accent-title {
  color: #F5C842 !important;
  padding: 20px 60px;
}
.raffle-grid {
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
.raffle-card {
  background-color: #16263A;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.raffle-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.raffle-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.raffle-title {
  color: #E6EDF3;
  font-size: 18px;
}
.raffle-prize {
  color: #F5C842;
  font-size: 14px;
}
.winner-box {
  background-color: #0B1220;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid rgba(245, 200, 66, 0.2);
}
.winner-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.winner-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.winner-username {
  color: #E6EDF3;
  font-size: 14px;
}
.winning-ticket-badge {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
.no-winner-box {
  background-color: #0B1220;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.raffle-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px 16px 20px;
}
.raffle-days {
  color: #6a849e;
  font-size: 12px;
}
.loading-state, .empty-state {
  color: #6a849e;
  text-align: center;
  padding: 40px;
  font-size: 15px;
}
.empty-text {
  color: #6a849e;
  font-size: 14px;
}
</style>
