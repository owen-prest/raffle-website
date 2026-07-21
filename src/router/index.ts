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
    component: () =>import('../Views/LoginPage.vue'),
    meta: { requiresAuth: false } },
    { path: '/signup',
    name: 'signup',
    component: () =>import('../Views/SignUpPage.vue'),
    meta: { requiresAuth: false } },
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
