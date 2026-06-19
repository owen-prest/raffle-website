import{ ref } from 'vue'

export const isLoggedIn = ref(false)

// tracks log in status of the user
export const login = () => {
  isLoggedIn.value = true
}
export const logout = () => {
  isLoggedIn.value = false
}

