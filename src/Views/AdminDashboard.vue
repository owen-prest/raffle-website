<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

interface AdminApplication {
  id: string
  user_id: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles?: {
    username: string
    full_name: string
  }[]
}

const router = useRouter()
const applications = ref<AdminApplication[]>([])
const loading = ref(true)
const isAdmin = ref(false)
const actionLoading = ref<string | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

// Check if current user is an admin
const checkAdminStatus = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      router.push('/login')
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData?.is_admin) {
      router.push('/')
      return
    }

    isAdmin.value = true
  } catch (err) {
    console.error('Error verifying admin status:', err)
    router.push('/')
  }
}

const fetchApplications = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const { data, error } = await supabase
      .from('admin_applications')
      .select(`
        id,
        user_id,
        reason,
        status,
        created_at,
        profiles (
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    applications.value = data || []
  } catch (err: unknown) {
    console.error('Error fetching applications:', err)
    errorMessage.value = 'Failed to load applications.'
  } finally {
    loading.value = false
  }
}

const handleAction = async (appId: string, userId: string, newStatus: 'approved' | 'rejected') => {
  try {
    actionLoading.value = appId
    errorMessage.value = ''
    successMessage.value = ''

    // 1. Update application status
    const { error: appError } = await supabase
      .from('admin_applications')
      .update({ status: newStatus })
      .eq('id', appId)

    if (appError) throw appError

    // 2. If approved, update user's profile to is_admin = true
    if (newStatus === 'approved') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId)

      if (profileError) throw profileError
    }

    successMessage.value = `Application successfully ${newStatus}!`
    await fetchApplications()
  } catch (err: unknown) {
    console.error('Error processing application:', err)
    errorMessage.value = 'Failed to update application.'
  } finally {
    actionLoading.value = null
  }
}

onMounted(async () => {
  await checkAdminStatus()
  if (isAdmin.value) {
    await fetchApplications()
  }
})
</script>

<template>
  <div class="admin-dashboard">
    <h1 class="home-title">Admin Review Dashboard</h1>

    <div v-if="loading && !isAdmin" class="loading-state">Verifying access...</div>

    <div v-else-if="!isAdmin" class="access-denied">
      <p>Access denied. You must be an administrator to view this page.</p>
    </div>

    <div v-else class="admin-container">
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-banner">{{ successMessage }}</div>

      <div class="applications-grid" v-if="!loading">
        <div v-for="app in applications" :key="app.id" class="profile-card app-card">
          <div class="app-header">
            <div>
              <h3 class="app-user">{{ app.profiles?.[0]?.full_name || 'Anonymous User' }}</h3>
              <span class="app-username">@{{ app.profiles?.[0]?.username || 'unknown' }}</span>
            </div>
            <span :class="['badge', app.status]">{{ app.status.toUpperCase() }}</span>
          </div>

          <div class="app-body">
            <p class="app-label">Reason for applying:</p>
            <p class="app-reason">"{{ app.reason }}"</p>
          </div>

          <div class="app-footer" v-if="app.status === 'pending'">
            <button
              class="save-btn approve-btn"
              @click="handleAction(app.id, app.user_id, 'approved')"
              :disabled="actionLoading === app.id"
            >
              {{ actionLoading === app.id ? 'Processing...' : 'Approve' }}
            </button>
            <button
              class="save-btn reject-btn"
              @click="handleAction(app.id, app.user_id, 'rejected')"
              :disabled="actionLoading === app.id"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">Loading applications...</div>
      <p v-else-if="applications.length === 0" class="empty-text">No admin applications found.</p>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 0 0 40px;
}
.admin-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 60px;
}
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.app-card {
  gap: 16px;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.app-user {
  color: #E6EDF3;
  font-size: 16px;
  font-weight: 600;
}
.app-username {
  color: #6a849e;
  font-size: 13px;
}
.app-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: #0B1220;
  padding: 12px;
  border-radius: 8px;
}
.app-label {
  color: #6a849e;
  font-size: 11px;
  text-transform: uppercase;
}
.app-reason {
  color: #E6EDF3;
  font-size: 14px;
}
.app-footer {
  display: flex;
  gap: 10px;
}
.approve-btn {
  background-color: #2ecc71;
  color: #0B1220;
  flex: 1;
}
.approve-btn:hover {
  background-color: #27ae60;
}
.reject-btn {
  background-color: #ff6b6b;
  color: #0B1220;
  flex: 1;
}
.reject-btn:hover {
  background-color: #e74c3c;
}
.badge {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}
.badge.pending {
  background-color: rgba(245, 200, 66, 0.2);
  color: #F5C842;
}
.badge.approved {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71; }
.badge.rejected {
  background-color: rgba(255, 107, 107, 0.2);
  color: #ff6b6b; }
.access-denied, .empty-text {
  color: #6a849e;
  padding: 0 60px;
}
</style>
