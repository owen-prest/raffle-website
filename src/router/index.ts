import { createRouter, createWebHistory } from 'vue-router'

/* Web Pages */
const routes = [
  { path: '/',
    name: 'dashboard',
    component: () => import('../Views/HomePage.vue') },
  { path: '/raffles',
    name: 'raffles',
    component: () =>import('../Views/RafflesPage.vue') },
  { path: '/login',
    name: 'login',
    component: () =>import('../Views/LoginPage.vue') },
  { path: '/profile',
    name: 'profile',
    component: () => import('../Views/ProfilePage.vue')},
  { path: '/winners',
    name: 'winners',
    component: () =>import('../Views/WinnersPage.vue')},
]

export default createRouter({
  history: createWebHistory(),
  routes
})
