<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import placeholder from '@/assets/images/placeholder.webp'

interface TicketGroup {
  raffleId: number
  title: string
  prize: string
  tickets: number[]
}

interface WonRaffle {
  id: number
  title: string
  prize: string
  winningTicketNumber: number
}

const { user } = useAuth()
const loading = ref(true)

// Profile Form States
const username = ref('')
const fullName = ref('')
const avatarUrl = ref('')
const uploading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Password States
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const isUpdatingPassword = ref(false)

// Admin Application States
const adminReason = ref('')
const isSubmittingAdmin = ref(false)
const existingApplication = ref<{ status: string; reason: string } | null>(null)
const adminMessage = ref('')
const adminError = ref('')

// User Tickets & Won Raffles State
const userTicketGroups = ref<TicketGroup[]>([])
const wonRaffles = ref<WonRaffle[]>([])
const isWinningTicket = (raffleId: number, ticketNum: number) => {
  return wonRaffles.value.some(win => win.id === raffleId && win.winningTicketNumber === ticketNum)
}

const fetchProfileData = async () => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) throw error
    if (data) {
      username.value = data.username || ''
      fullName.value = data.full_name || ''
      avatarUrl.value = data.avatar_url || placeholder
    }
  } catch (err) {
    console.error('Error fetching profile:', err)
  }
}

const fetchUserTickets = async () => {
  if (!user.value) return
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('ticket_number, raffle_id, raffles(id, title, prize)')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const map: Record<number, { title: string; prize: string; tickets: number[] }> = {}
    data?.forEach((t: any) => {
      const rId = t.raffle_id
      const raffleInfo = t.raffles || { title: `Raffle #${rId}`, prize: '' }
      if (!map[rId]) {
        map[rId] = {
          title: raffleInfo.title,
          prize: raffleInfo.prize,
          tickets: []
        }
      }
      map[rId].tickets.push(t.ticket_number)
    })

    userTicketGroups.value = Object.entries(map).map(([raffleId, val]) => ({
      raffleId: Number(raffleId),
      title: val.title,
      prize: val.prize,
      tickets: val.tickets
    }))
  } catch (err) {
    console.error('Error fetching user tickets:', err)
  }
}

const fetchWonRaffles = async () => {
  if (!user.value) return
  try {
    const { data, error } = await supabase
      .from('raffles')
      .select('id, title, prize, winning_ticket_number')
      .eq('winner_id', user.value.id)
      .eq('status', 'completed')

    if (error) throw error
    wonRaffles.value = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      prize: r.prize,
      winningTicketNumber: r.winning_ticket_number
    }))
  } catch (err) {
    console.error('Error fetching won raffles:', err)
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await fetchProfileData()
    await fetchApplicationStatus()
    await fetchUserTickets()
    await fetchWonRaffles()
  } finally {
    loading.value = false
  }
})

// Fetch Admin Application Status
const fetchApplicationStatus = async () => {
  if (!user.value) return
  try {
    const { data, error: err } = await supabase
      .from('admin_applications')
      .select('status, reason')
      .eq('user_id', user.value.id)
      .maybeSingle()

    if (err) throw err
    if (data) {
      existingApplication.value = data
    }
  } catch (err) {
    console.error('Error checking application status:', err)
  }
}

// Submit Admin Application
const submitAdminApplication = async () => {
  if (!user.value) return
  if (!adminReason.value.trim()) {
    adminError.value = 'Please provide a reason for applying.'
    return
  }

  try {
    isSubmittingAdmin.value = true
    adminError.value = ''
    adminMessage.value = ''

    const { error: insertError } = await supabase.from('admin_applications').insert({
      user_id: user.value.id,
      reason: adminReason.value.trim(),
      status: 'pending'
    })

    if (insertError) throw insertError

    adminMessage.value = 'Application submitted successfully! Our team will review it shortly.'
    adminReason.value = ''
    await fetchApplicationStatus()
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err) {
      adminError.value = (err as { message: string }).message
    } else {
      adminError.value = 'Failed to submit application.'
    }
  } finally {
    isSubmittingAdmin.value = false
  }
}

// Upload Avatar
const uploadAvatar = async (event: Event) => {
  try {
    uploading.value = true
    errorMessage.value = ''
    const target = event.target as HTMLInputElement
    if (!target.files || target.files.length === 0) return

    const file = target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.value?.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    avatarUrl.value = publicUrlData.publicUrl + '?t=' + new Date().getTime()
  } catch (err: unknown) {
    console.error('Error uploading avatar:', err)
    if (err && typeof err === 'object' && 'message' in err) {
      errorMessage.value = `Upload Error: ${(err as { message: string }).message}`
    } else {
      errorMessage.value = 'Failed to upload avatar.'
    }
  } finally {
    uploading.value = false
  }
}

// Update Profile Details
const updateProfile = async () => {
  if (!user.value) return
  try {
    saving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const updates = {
      id: user.value.id,
      username: username.value,
      full_name: fullName.value,
      avatar_url: avatarUrl.value,
      updated_at: new Date()
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) throw error

    successMessage.value = 'Profile updated successfully!'
    await fetchProfileData()
  } catch (err: unknown) {
    console.error('Error updating profile:', err)
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message: string }).message
      const code = (err as { code?: string }).code

      if (msg.includes('profiles_username_key') || code === '23505') {
        errorMessage.value = 'This username is already taken. Please choose a different one.'
      } else {
        errorMessage.value = msg
      }
    } else {
      errorMessage.value = 'Failed to update profile.'
    }
  } finally {
    saving.value = false
  }
}

// Handle Password Change
const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Please fill in all password fields.'
    return
  }

  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New passwords do not match.'
    return
  }

  try {
    isUpdatingPassword.value = true
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })

    if (error) throw error

    passwordSuccess.value = 'Password updated successfully!'
    newPassword.value = ''
    confirmPassword.value = ''

    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)
  } catch (err: unknown) {
    console.error('Error updating password:', err)
    if (err && typeof err === 'object' && 'message' in err) {
      passwordError.value = (err as { message: string }).message
    } else {
      passwordError.value = 'Failed to update password.'
    }
  } finally {
    isUpdatingPassword.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <h1 class="home-title">Account Settings</h1>

    <div v-if="loading" class="loading-state">Loading profile...</div>

    <div v-else class="profile-container">

      <!-- Winner Victory Notifications Card -->
      <div class="profile-card winner-card" v-if="wonRaffles.length > 0">
        <h2 class="section-title accent-title">🎉 Congratulations! You Won!</h2>
        <div class="winners-list">
          <div class="won-item" v-for="win in wonRaffles" :key="win.id">
            <div class="won-info">
              <span class="won-title">{{ win.title }}</span>
              <span class="won-prize">🏆 Prize: {{ win.prize }}</span>
            </div>
            <div class="winning-badge">
              Winning Ticket #{{ win.winningTicketNumber }}
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Details Card -->
      <div class="profile-card">
        <h2 class="section-title">Profile Details</h2>

        <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-banner">{{ successMessage }}</div>

        <div class="avatar-section">
          <img :src="avatarUrl || placeholder" alt="Avatar" class="profile-avatar" />
          <label class="upload-btn">
            {{ uploading ? 'Uploading...' : 'Change Avatar' }}
            <input type="file" accept="image/*" @change="uploadAvatar" :disabled="uploading" style="display: none;" />
          </label>
        </div>

        <div class="profile-form">
          <div class="profile-row">
            <div class="profile-field">
              <label class="profile-label">Email</label>
              <input class="profile-input" type="text" :value="user?.email" disabled />
            </div>
            <div class="profile-field">
              <label class="profile-label">Username</label>
              <input v-model="username" class="profile-input" type="text" placeholder="Enter username" />
            </div>
          </div>

          <div class="profile-field">
            <label class="profile-label">Full Name</label>
            <input v-model="fullName" class="profile-input" type="text" placeholder="Enter full name" />
          </div>

          <div class="profile-actions">
            <button class="save-btn" @click="updateProfile" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Security Card: Change Password -->
      <div class="profile-card security-card">
        <h2 class="section-title">Change Password</h2>

        <div v-if="passwordError" class="error-banner">{{ passwordError }}</div>
        <div v-if="passwordSuccess" class="success-banner">{{ passwordSuccess }}</div>

        <div class="password-form">
          <div class="profile-row">
            <div class="profile-field">
              <label class="profile-label">New Password</label>
              <input v-model="newPassword" class="profile-input" type="password" placeholder="At least 6 characters" />
            </div>
            <div class="profile-field">
              <label class="profile-label">Confirm New Password</label>
              <input v-model="confirmPassword" class="profile-input" type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <div class="profile-actions">
            <button class="save-btn" @click="handleChangePassword" :disabled="isUpdatingPassword">
              {{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Become an Admin Card -->
      <div class="profile-card admin-application-card">
        <h2 class="section-title">Become an Admin</h2>

        <div v-if="adminError" class="error-banner">{{ adminError }}</div>
        <div v-if="adminMessage" class="success-banner">{{ adminMessage }}</div>

        <div v-if="existingApplication" class="application-status-box">
          <p class="status-text">
            Application Status:
            <span :class="['badge', existingApplication.status]">
              {{ existingApplication.status.toUpperCase() }}
            </span>
          </p>
          <p class="submitted-reason"><strong>Your Reason:</strong> "{{ existingApplication.reason }}"</p>
        </div>

        <div v-else class="application-form">
          <p class="form-desc">Want to host and create your own raffles? Apply to become a platform administrator.</p>
          <div class="profile-field">
            <label class="profile-label">Why do you want to be an admin?</label>
            <textarea v-model="adminReason" class="profile-input profile-bio" placeholder="Tell us about your plans..."></textarea>
          </div>
          <div class="profile-actions">
            <button class="save-btn" @click="submitAdminApplication" :disabled="isSubmittingAdmin">
              {{ isSubmittingAdmin ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity Card -->
      <div class="profile-card activity-card">
        <h2 class="section-title">Recent Activity & Tickets</h2>
        <div class="activity-content">
          <template v-if="userTicketGroups.length > 0">
            <div class="activity-list" v-for="group in userTicketGroups" :key="group.raffleId">
              <div class="activity-item">
                <div class="activity-raffle-info">
                  <span class="activity-raffle-name">{{ group.title }}</span>
                  <span class="activity-raffle-prize" v-if="group.prize">🏆 {{ group.prize }}</span>
                </div>
                <div class="activity-tickets">
                  <span
                    v-for="t in group.tickets"
                    :key="t"
                    :class="['my-ticket-number', { 'winning-ticket-highlight': isWinningTicket(group.raffleId, t) }]"
                  >
                    {{ isWinningTicket(group.raffleId, t) ? '👑 ' : '' }}#{{ t }}
                  </span>
                </div>
              </div>
            </div>
          </template>
          <p v-else class="empty-text">You haven't entered any raffles yet. Check out active raffles to get started!</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 0 0 40px;
}
.accent-title {
  color: #F5C842 !important;
}
.winner-card {
  background: linear-gradient(135deg, #16263A 0%, #1f3655 100%);
  border: 1px solid rgba(245, 200, 66, 0.4);
  box-shadow: 0 4px 20px rgba(245, 200, 66, 0.1);
}
.winners-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.won-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0B1220;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  gap: 16px;
}
.won-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.won-title {
  color: #E6EDF3;
  font-weight: 600;
  font-size: 16px;
}
.won-prize {
  color: #F5C842;
  font-size: 13px;
}
.winning-badge {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
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
  color: #E6EDF3;
  font-size: 18px;
}
.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}
.upload-btn {
  background-color: #0B1220;
  color: #E6EDF3;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}
.upload-btn:hover {
  background-color: #1e3a5f;
}
.profile-form, .password-form, .application-form {
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
.profile-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.profile-bio {
  resize: vertical;
  min-height: 80px;
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
.application-status-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #0B1220;
  padding: 16px;
  border-radius: 8px;
}
.status-text {
  color: #E6EDF3;
  font-size: 15px;
}
.badge {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.badge.pending { background-color: rgba(245, 200, 66, 0.2); color: #F5C842; }
.badge.approved { background-color: rgba(46, 204, 113, 0.2); color: #2ecc71; }
.badge.rejected { background-color: rgba(255, 107, 107, 0.2); color: #ff6b6b; }
.submitted-reason {
  color: #6a849e;
  font-size: 14px;
}
.form-desc {
  color: #6a849e;
  font-size: 14px;
}
.empty-text {
  color: #6a849e;
  font-size: 14px;
}
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}
.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0B1220;
  padding: 14px;
  border-radius: 8px;
  gap: 16px;
}
.activity-raffle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.activity-raffle-name {
  color: #E6EDF3;
  font-weight: 500;
  font-size: 15px;
}
.activity-raffle-prize {
  color: #6a849e;
  font-size: 12px;
}
.activity-tickets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
  max-width: 50%;
}
.my-ticket-number {
  background-color: #F5C842;
  color: #0B1220;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}
.winning-ticket-highlight {
  background-color: #2ecc71 !important;
  color: #0B1220 !important;
  box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
  font-weight: 700;
}
</style>
