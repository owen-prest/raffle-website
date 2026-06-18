import { createRouter, createWebHistory } from 'vue-router'

const Placeholder = { template: '<div></div>' }


/* Web Pages */
const routes = [
  { path: '/', name: 'Dashboard', component: Placeholder },
  { path: '/Raffles', name: 'Raffles', component: Placeholder },
  { path: '/Profile', name: 'Profile', component: Placeholder },
  { path: '/Login', name: 'Login', component: Placeholder },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
