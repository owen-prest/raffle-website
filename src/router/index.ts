import { createRouter, createWebHistory } from 'vue-router'

/* Web Pages */
const routes = [
  { path: '/',
    name: 'Dashboard',
    component: import('../Views/HomePage.vue') },
  { path: '/Raffles',
    name: 'Raffles',
    component: import('../Views/RafflesPage.vue') },
  { path: '/Login',
    name: 'Login',
    component: import('../Views/LoginPage.vue') },
  { path: '/Profile',
    name: 'Profile',
    component: import('../Views/ProfilePage.vue')},
  { path: '/Winners',
    name: 'Winners',
    component: import('../Views/WinnersPage.vue')},
]

export default createRouter({
  history: createWebHistory(),
  routes
})
