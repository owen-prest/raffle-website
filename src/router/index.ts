import { createRouter, createWebHistory } from 'vue-router'

/* Web Pages */
const routes = [
  { path: '/',
    name: 'Dashboard',
    component: import('../Views/Dashboard.vue') },
  { path: '/Raffles',
    name: 'Raffles',
    component: import('../Views/Raffles.vue') },
  { path: '/Login',
    name: 'Login',
    component: import('../Views/Login.vue') },
    {
      path: '/Profile',
      name: 'Profile',
      component: import('../Views/Profile.vue')
    }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
