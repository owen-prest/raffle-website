<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '@/supabase'

  interface AdminApplication {
    id: string // Changed from number to string (UUID)
    user_id: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    profiles?: {
      id: string
      username: string
      full_name: string
    }
  }

  interface RpcApplication {
    id: string // Changed from number to string (UUID)
    user_id: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    profile_id: string
    username: string
    full_name: string
  }

  // Update actionLoading to track string UUIDs instead of numbers
  const actionLoading = ref<string | null>(null)

  const router = useRouter()
  const applications = ref<AdminApplication[]>([])
  const loading = ref(true)
  const isAdmin = ref(false)
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
    } catch (err: unknown) {
      console.error('Error verifying admin status:', err)
      router.push('/')
    }
  }

  const fetchApplications = async () => {
    try {
      loading.value = true
      errorMessage.value = ''

      const { data, error } = await supabase.rpc('get_admin_applications')

      if (error) throw error

      const rawData = (data as RpcApplication[]) || []

      applications.value = rawData.map((app) => ({
        id: app.id,
        user_id: app.user_id,
        reason: app.reason,
        status: app.status,
        created_at: app.created_at,
        profiles: app.profile_id
          ? {
              id: app.profile_id,
              username: app.username,
              full_name: app.full_name,
            }
          : undefined,
      }))
    } catch (err: unknown) {
      let errMessage = 'Unknown error occurred'
      if (err instanceof Error) {
        errMessage = err.message
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errMessage = String((err as { message: unknown }).message)
      } else if (typeof err === 'string') {
        errMessage = err
      }
      console.error('Error loading admin applications:', err)
      errorMessage.value = `Supabase Error: ${errMessage}`
    } finally {
      loading.value = false
    }
  }

  const handleAction = async (appId: number, userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      actionLoading.value = appId
      errorMessage.value = ''
      successMessage.value = ''

      const { error: appError } = await supabase
        .from('admin_applications')
        .update({ status: newStatus })
        .eq('id', appId)

      if (appError) throw appError

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
              <!-- FIXED: Removed [0] since profiles is now a single object -->
              <h3 class="app-user">{{ app.profiles?.full_name || 'Anonymous User' }}</h3>
              <span class="app-username">@{{ app.profiles?.username || 'unknown' }}</span>
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
.home-title {
  color: #f5c842;
  font-size: 24px;
  padding:20px 60px;
  margin-bottom: 20px;
}
</style>
