// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/supabase'

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
router.beforeEach(async(to, from, next) => {
  // 1. Await Supabase session check directly (reads from localStorage synchronously/fast on refresh)
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session
  // 2. Protected routes check
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }
  // 3. Guest-only routes check (login/signup)
  if (to.meta.redirectIfAuth && isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  next()
})
export default router
