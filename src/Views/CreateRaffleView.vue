<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import placeholder from '@/assets/images/placeholder.webp'

const router = useRouter()
const isAdmin = ref(false)
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form fields
const title = ref('')
const prize = ref('')
const ticketPrice = ref<number | null>(null)
const ticketsTotal = ref<number | null>(null)
const endDate = ref('')
const drawType = ref('random')
const socialLink = ref('')

// Image Handling state
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string>(placeholder)

// Handle local file selection and preview
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// Upload file to Supabase Storage bucket 'raffle-images'
const uploadRaffleImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('raffle-images')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('raffle-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Check admin access on mount
const checkAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      router.push('/')
      return
    }

    isAdmin.value = true
  } catch (err) {
    console.error('Error checking admin status:', err)
    router.push('/')
  } finally {
    loading.value = false
  }
}

const createRaffle = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!title.value || !prize.value || ticketPrice.value === null || ticketsTotal.value === null || !endDate.value) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }

  let finalDrawMethod = 'Random number generator, automated via platform code'
  if (drawType.value === 'livestream') {
    if (!socialLink.value.trim()) {
      errorMessage.value = 'Please provide a social link for the livestream draw.'
      return
    }
    finalDrawMethod = `Livestreamed on social page: ${socialLink.value.trim()}`
  }

  try {
    submitting.value = true

    // 1. Upload image if a custom file was selected
    let finalImageUrl = placeholder
    if (selectedFile.value) {
      finalImageUrl = await uploadRaffleImage(selectedFile.value)
    }

    // Automatically calculate draw date to be 15 minutes after the end date
    const endDateTimeObj = new Date(endDate.value)
    const drawDateTimeObj = new Date(endDateTimeObj.getTime() + 15 * 60 * 1000)

    // 2. Insert raffle record into database
    const { error } = await supabase.from('raffles').insert({
      title: title.value,
      prize: prize.value,
      ticket_price: ticketPrice.value,
      tickets_total: ticketsTotal.value,
      tickets_sold: 0,
      entrants: 0,
      end_date: endDateTimeObj.toISOString(),
      draw_date: drawDateTimeObj.toISOString(),
      draw_method: finalDrawMethod,
      image: finalImageUrl
    })

    if (error) throw error

    successMessage.value = 'Raffle created successfully!'

    // Reset form fields
    title.value = ''
    prize.value = ''
    ticketPrice.value = null
    ticketsTotal.value = null
    endDate.value = ''
    drawType.value = 'random'
    socialLink.value = ''
    selectedFile.value = null
    imagePreview.value = placeholder
  } catch (err: unknown) {
    console.error('Error creating raffle:', err)
    if (err && typeof err === 'object' && 'message' in err) {
      errorMessage.value = `Error: ${(err as { message: string }).message}`
    } else {
      errorMessage.value = 'Failed to create raffle.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  checkAdmin()
})
</script>

<template>
  <div class="create-raffle-page">
    <h1 class="home-title">Create New Raffle</h1>

    <div v-if="loading" class="loading-state">Checking permissions...</div>

    <div v-else-if="!isAdmin" class="access-denied">
      <p>Access denied.</p>
    </div>

    <div v-else class="profile-container">
      <div class="profile-card">
        <h2 class="section-title">Raffle Details</h2>

        <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-banner">{{ successMessage }}</div>

        <div class="profile-form">
          <div class="profile-field">
            <label class="profile-label">Raffle Title</label>
            <input v-model="title" class="profile-input" type="text" placeholder="e.g. Win a PS5 Bundle" />
          </div>

          <div class="profile-field">
            <label class="profile-label">Prize Description</label>
            <input v-model="prize" class="profile-input" type="text" placeholder="e.g. PlayStation 5 + 2 Games" />
          </div>

          <div class="profile-row">
            <div class="profile-field">
              <label class="profile-label">Ticket Price (🪙)</label>
              <input v-model.number="ticketPrice" class="profile-input" type="number" min="1" placeholder="5" />
            </div>
            <div class="profile-field">
              <label class="profile-label">Total Tickets Available</label>
              <input v-model.number="ticketsTotal" class="profile-input" type="number" min="10" placeholder="500" />
            </div>
          </div>

          <div class="profile-field">
            <label class="profile-label">End Date & Time (Draw will happen 15 mins after)</label>
            <input v-model="endDate" class="profile-input" type="datetime-local" />
          </div>

          <!-- Raffle Image Upload Field -->
          <div class="profile-field">
            <label class="profile-label">Raffle Image</label>
            <input
              class="profile-input file-input"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              @change="handleFileChange"
            />

            <!-- Live Preview -->
            <div class="image-preview-wrapper" v-if="imagePreview">
              <img :src="imagePreview" alt="Image Preview" class="preview-img" />
            </div>
          </div>

          <div class="profile-field">
            <label class="profile-label">Draw Method</label>
            <select v-model="drawType" class="profile-input">
              <option value="random">Random Number Generator (Platform Code)</option>
              <option value="livestream">Livestream (Custom Social Link)</option>
            </select>
          </div>

          <div class="profile-field" v-if="drawType === 'livestream'">
            <label class="profile-label">Social Page / Livestream Link</label>
            <input v-model="socialLink" class="profile-input" type="url" placeholder="https://twitch.tv/yourchannel" />
          </div>

          <div class="profile-actions">
            <button class="save-btn" @click="createRaffle" :disabled="submitting">
              {{ submitting ? 'Publishing...' : 'Publish Raffle' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-title {
  color: #f5c842;
  font-size: 32px;
  margin-bottom: 20px;
  padding:20px 60px;
}
.create-raffle-page {
  padding: 0 0 40px;
}
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 60px;
}
.profile-card {
  background-color: #16263A;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.section-title {
  color: #f5c842;
  font-size: 18px;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.profile-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.profile-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.profile-label {
  color: #6a849e;
  font-size: 12px;
  text-transform: uppercase;
}
.profile-input {
  background-color: #0B1220;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #E6EDF3;
  font-size: 14px;
}
.file-input {
  padding: 8px;
  cursor: pointer;
}
.image-preview-wrapper {
  margin-top: 6px;
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #0B1220;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-actions {
  display: flex;
  justify-content: flex-end;
}
.save-btn {
  background-color: #F5C842;
  color: #0B1220;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:hover {
  background-color: #e6b800;
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
.access-denied {
  color: #6a849e;
  padding: 0 60px;
}
</style>
