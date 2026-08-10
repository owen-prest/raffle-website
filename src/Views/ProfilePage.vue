<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabase'
import defaultProfileImg from '@/assets/images/profileImg.webp'

const router = useRouter()
const { user, signOut } = useAuth()

// Profile State
const email = ref(user.value?.email || '')
const username = ref(user.value?.user_metadata?.username || 'Username')
const bio = ref(user.value?.user_metadata?.bio || 'Tell us about yourself...')
const avatarUrl = ref(user.value?.user_metadata?.avatar_url || '')

// Status and Feedback States
const isEditing = ref(false)
const isSaving = ref(false)
const isUploading = ref(false)
const usernameError = ref('')
const errorMessage = ref('')
const successMessage = ref('')

// Password State
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const isUpdatingPassword = ref(false)


// Load existing profile from Supabase 'profiles' table
const loadProfile = async () => {
  if (!user.value) return

    email.value = user.value.email || ''

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, bio, avatar_url')
      .eq('id', user.value.id)
      .maybeSingle()

    if (error) throw error

    if (data) {
      username.value = data.username || user.value.user_metadata?.username || ''
      bio.value = data.bio || user.value.user_metadata?.bio || ''
      avatarUrl.value = data.avatar_url || user.value.user_metadata?.avatar_url || ''
    } else{
      // If no DB row exists yet, retain auth metadata defaults
      username.value = user.value.user_metadata?.username || username.value || 'Username'
      bio.value = user.value.user_metadata?.bio || bio.value || ''
    }
  } catch (err: unknown) {
    console.error('Error loading profile:', err)
  }
}

// Sync profile when user loads or when exiting edit mode
watch(
  [user, isEditing],
  ([newUser, newIsEditing]) => {
    if (newUser && !newIsEditing) {
      loadProfile()
    }
  },
  { immediate: true }
)

// Query Supabase to check if another user has this username
const isUsernameTaken = async (nameToCheck: string): Promise<boolean> => {
  const trimmed = (nameToCheck || '').trim()
  if (!trimmed) return false

  const { data, error} = await supabase
  .from('profiles')
  .select('id')
  .ilike('username', trimmed) // case-insensitive match
  .neq('id', user.value?.id || '') // exclude current user's profile
  .maybeSingle()

  if (error) {
    console.error('Error checking username:', error)
    return false
  }
  return !!data
}

// Handle image selection and upload to Supabase Storage bucket
const handleAvatarUpload = async (event:Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0 || !user.value) return

  const file = target.files[0]
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.value.id}/avatar.${fileExt}`

  try{
    isUploading.value = true
    errorMessage.value = ''

    // Upload to 'avatars' storage bucket (upsert overwrites previous avatar)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // Retrieve public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Append timestamp to bust browser image cache
    avatarUrl.value = `${data.publicUrl}?t=${Date.now()}`
  } catch (err: unknown) {
    console.error('Error uploading avatar:', err)
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'Failed to upload avatar.'
    }
  } finally {
    isUploading.value = false
  }
}

const handleEdit = () => {
  errorMessage.value = ''
  isEditing.value = true
}

const handleCancel = () => {
  username.value = user.value?.user_metadata?.username || ''
  bio.value = user.value?.user_metadata?.bio || ''
  usernameError.value = ''
  errorMessage.value = ''
  isEditing.value = false
  loadProfile() // Reloads latest DB values, reverting username, bio, and unsaved avatar uploads
}

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  const hasUpperCase = /[A-Z]/.test(newPassword.value)
  const hasLowerCase = /[a-z]/.test(newPassword.value)
  const hasNumber = /[0-9]/.test(newPassword.value)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value)

  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Please fill in both password fields.'
    return
  }
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    passwordError.value = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
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
    }, 3000) // Clear success message after 3 seconds
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

// Validate unique username & save changes
const handleSave = async () => {
  if (!user.value) {
    errorMessage.value = 'User session not found. Please log in again.'
    return
  }

  const trimmedUsername = (username.value || '').trim()

  if (!trimmedUsername) {
    usernameError.value = 'Username cannot be empty'
    return
  }

  try {
    isSaving.value = true
    usernameError.value = ''
    errorMessage.value = ''

    // 1. Check uniqueness across DB
    const taken = await isUsernameTaken(trimmedUsername)
    if (taken) {
      usernameError.value = 'Username is already taken. Please choose another.'
      return
    }

    // Strip cache-busting timestamp (?t=123456) so only the clean public URL is stored in DB
    const cleanAvatarUrl = avatarUrl.value ? avatarUrl.value.split('?')[0] : ''

    // 2. Upsert into public 'profiles' table
    const { error: dbError } = await supabase.from('profiles').upsert({
      id: user.value.id,
      username: trimmedUsername,
      bio: bio.value,
      avatar_url: cleanAvatarUrl,
      updated_at: new Date().toISOString()
    })

    if (dbError) throw dbError

    // 3. Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        username: trimmedUsername,
        bio: bio.value,
        avatar_url: cleanAvatarUrl
      }
    })

    if (authError) throw authError

    // Exit edit mode on success
    isEditing.value = false
    successMessage.value = 'Profile updated successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000) // Clear success message after 3 seconds

  } catch (err: unknown) {
    console.error('Error saving profile:', err)

    // Safely check for a message on Supabase error objects or standard Error instances
    if (err && typeof err === 'object' && 'message' in err) {
      errorMessage.value = (err as { message: string }).message
    } else {
      errorMessage.value = 'Failed to save profile changes.'
    }
  } finally {
    isSaving.value = false
  }
}

// handles logout asynchronously and redirects to login page
const handleLogout = async () => {
  try{
    await signOut()
    router.push('/login')
  } catch (err){
    console.error('Error signing out:', err)
  }
}
</script>

<template>
  <div class="profile">
    <div class="profile-card">
      <h1 class="profile-title">Hello {{ username }}!</h1>

      <!-- Error banner for general failures -->
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
      <!-- Success banner for saved changes -->
      <div v-if="successMessage" class="success-banner">
        {{ successMessage }}
      </div>

      <div class="profile-body">
        <div class ="profile-left">
          <img class="profile-image" :src="avatarUrl || defaultProfileImg" alt="profile image">

          <!-- Upload Avatar button only visible during edit mode -->
          <label v-if="isEditing" class="upload-btn">
            {{ isUploading ? 'Uploading...' : 'Change Avatar' }}
            <input
              type="file"
              accept="image/*"
              @change="handleAvatarUpload"
              :disabled="isUploading"
              hidden
            />
          </label>
        </div>

        <div class="profile-info">
          <div class="profile-row">
            <div class="profile-field">
            <label class="profile-label">Username</label>
            <input v-if="isEditing" v-model="username" @input="usernameError = ''" class="profile-input" :class="{ 'input-error': usernameError }" type="text"/>
            <span v-else class="profile-input">{{ username }}</span>
            <span v-if="usernameError && isEditing" class="error-text">{{ usernameError }}</span>
          </div>
          <div class="profile-field">
            <label class="profile-label">Email</label>
            <span class="profile-input readonly-field">{{ email }}</span>
          </div>
          </div>

          <div class="profile-field">
            <label class="profile-label">Bio</label>
            <textarea  v-if="isEditing" v-model="bio" class="profile-input profile-bio"></textarea>
            <span v-else class="profile-input profile-bio">{{ bio }}</span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="save-btn" @click="handleEdit" v-if="!isEditing">Edit</button>
        <template v-else>
          <button class="save-btn" @click="handleSave" :disabled="isSaving || isUploading">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
          <button class="cancel-btn" @click="handleCancel" :disabled="isSaving">
            Cancel
          </button>
        </template>
        <button class="logout-btn" @click="handleLogout">Logout</button>
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
    <div class="profile-card activity-card">
      <h2 class="section-title">Recent Activity & Tickets</h2>
      <div class="activity-content">
        <p class="empty-text">You haven't entered any raffles yet. Check out the active raffles to get started!</p>
      </div>
    </div>
  </div>

</template>

<style scoped>
  .profile{
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #0B1220;
    padding: 40px;
    gap:30px;
  }
  .profile-card{
    position: relative;
    background-color: #16263A;
    border-radius: 12px;
    padding: 40px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    height: fit-content;
  }
  .profile-title{
    color:#F5C842;
    font-size: 24px;
    margin-bottom: 24px;
    background-color: transparent;
  }
  .section-title{
    color:#F5C842;
    font-size: 18px;
    margin-bottom: 16px;
    background-color: transparent;
  }
  .empty-text{
    color:#6a849e;
    font-size: 14px;
  }
  /* Floating Toast Banners*/
  .error-banner{
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    background-color: rgba(255, 107, 107, 0.15);
    border: 1px solid #ff6b6b;
    color: #ff6b6b;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    white-space: nowrap;
  }
  .success-banner {
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    background-color: rgba(46, 204, 113, 0.15);
    border: 1px solid #2ecc71;
    color: #2ecc71;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    white-space: nowrap;
  }
  .profile-body{
    display: flex;
    gap: 40px;
    align-items: flex-start;
    padding: 20px 0px;
    border-radius: 12px;
  }
  .profile-left{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap:12px;
  }
  .profile-image{
    width: 150px;
    height:150px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #F5C842;
  }
  /* Change Avatar Button */
  .upload-btn{
    color: #F5C842;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 12px;
    border: 1px solid #F5C842;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  .upload-btn:hover {
    background-color: rgba(245, 200, 66, 0.1);
  }
  .profile-info{
    flex: 1;
    display:flex;
    flex-direction: column;
    gap: 16px;
  }
  .profile-row{
    display: flex;
    gap: 20px;
  }
  .profile-field{
    flex: 1;
    display:flex;
    flex-direction: column;
    gap:6px;
  }
  .profile-label{
    color:#6a849e;;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .profile-input{
    background-color: #0B1220;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px 14px;
    color: #E6EDF3;
    outline: none;
    transition: border 0.2s ease;
    width: 100%;
    font-size: 16px;
    font-family: inherit;
    display: block; /* makes span behave the same as input */
  }
  .profile-input:focus{
    border: 1px solid #F5C842;
  }
  /* Red border when validation fails */
  .input-error {
    border: 1px solid #ff6b6b !important;
  }
  .readonly-field{
    opacity: 0.7;
    cursor: not-allowed;
  }
  /* Inline Username Error text */
  .error-text {
    color: #ff6b6b;
    font-size: 12px;
    margin-top: 2px;
  }
  .profile-bio{
    resize: none;
    height: 100px;
    min-height: 100px;
    width: 100%;
  }
  .profile-actions{
    display: flex;
    gap: 12px;
    margin-top: 24px;
    background-color: transparent;
  }
  .save-btn{
    background-color:#F5C842;
    color: #0B1220;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor:pointer;
    transition:background 0.2s ease;
    min-width: 80px;
  }
  .save-btn:hover:not(:disabled){
    background-color: #e6b800;
  }
  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  /* Subtle style for Cancel so it doesn't fight with Save */
  .cancel-btn {
    background-color: transparent;
    color: #E6EDF3;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
  }
  .cancel-btn:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.05);
  }
  .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .logout-btn{
    background-color: transparent;
    color: #ff6b6b;
    border: 1px solid #ff6b6b;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 80px;
  }
  .logout-btn:hover{
    background-color: #ff6b6b;
    color: #0B1220;
  }
</style>
