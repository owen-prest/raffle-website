import{ ref } from 'vue'

const isLoggedIn = ref(false)

// tracks log in status of the user
const login = () => {
  isLoggedIn.value = true
}
const logout = () => {
  isLoggedIn.value = false
}

export { isLoggedIn, login, logout}
