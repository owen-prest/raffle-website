// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import {useAuth} from '../composables/useAuth'

/* Web Pages */
const routes = [
  { path: '/',
    name: 'dashboard',
    component: () => import('../Views/HomePage.vue')
  },
  { path: '/raffles',
    name: 'raffles',
    component: () =>import('../Views/RafflesPage.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/login',
    name: 'login',
    component: () =>import('../Views/LoginPage.vue'),
    meta: { redirectIfAuth: true }
  },
    { path: '/signup',
    name: 'signup',
    component: () =>import('../Views/SignUpPage.vue'),
    meta: { redirectIfAuth: true }
  },
  { path: '/profile',
    name: 'profile',
    component: () => import('../Views/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../Views/SettingsPage.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/winners',
    name: 'winners',
    component: () =>import('../Views/WinnersPage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to) => {
  const { user } = useAuth()
  const isAuthenticated = !!user.value

  // 1. Protected routes check
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // 2. Guest-only routes check (login/signup)
  if (to.meta.redirectIfAuth && isAuthenticated) {
    return { name: 'dashboard' }
  }
})
export default router
