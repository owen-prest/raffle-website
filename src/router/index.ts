import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

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
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
    { path: '/signup',
    name: 'signup',
    component: () =>import('../Views/SignUpPage.vue'),
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  { path: '/profile',
    name: 'profile',
    component: () => import('../Views/ProfilePage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../Views/SettingsPage.vue'), // Added missing settings route
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

// navigation guard
router.beforeEach((to, from, next) => {
  const { user } = useAuth()
  const isAuthenticated = !!user.value

  if(to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }
  if(to.meta.requiresAuth && isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  next()
})
export default router
