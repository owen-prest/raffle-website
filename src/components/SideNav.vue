<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { RouterLink } from 'vue-router'
  import { isLoggedIn } from '@/stores/auth'

  interface NavItem{
    label: string
    icon: string
    path: string
    // ? means badge is optional - not every nav item needs one
    badge?:number
  }

  // ref() makes collapsed reactive so the template updates automatically
  const collapsed=ref(false)

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'fa-solid fa-house', path: '/' },
  { label: 'Raffles', icon: 'fas fa-ticket-alt', path: '/raffles' },
]

// switches between Login and Profile based on auth state
const authItem = computed<NavItem>(() =>
  isLoggedIn.value
    ? { label: 'Profile', icon: 'fa-solid fa-user', path: '/profile' }
    : { label: 'Login', icon: 'fa-solid fa-right-to-bracket', path: '/login' }
)
</script>

<template>
  <nav :class="['sideNav', {collapsed}]">

    <div class="logo-area" @click="collapsed = !collapsed">
        <div class="logo-icon">
          <i class="fa-solid fa-ticket"></i>
        </div>
        <div :class="['logo-text', { hidden:collapsed }]">
          <span class="logo-name">Winna Raffle</span>
          <span class="logo-sub">Raffle Platform</span>
        </div>
    </div>

    <div class="divider"></div>

    <div class="nav-items">
      <router-link v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
      >
        <span class="nav-icon"><i :class="item.icon"></i></span>
        <span :class="['nav-label', { hidden:collapsed }]">{{ item.label}}</span>
        <span v-if="item.badge" :class="['badge', { hidden:collapsed }]">{{ item.badge }}</span>
      </router-link>

      <!-- dynamically switches between Login and Profile -->
      <router-link :to="authItem.path" class="nav-item">
        <span class="nav-icon"><i :class="authItem.icon"></i></span>
        <span :class="['nav-label', { hidden:collapsed }]">{{ authItem.label }}</span>
      </router-link>
    </div>

    <div class="divider"></div>

    <RouterLink to="/settings" class="nav-item">
      <span class="nav-icon"><i class="fa-solid fa-gear"></i></span>
      <span :class="['nav-label', { hidden:collapsed }]">Settings</span>
    </RouterLink>

    <div class="divider"></div>

    <div class="nav-item collapse-btn" @click="collapsed = !collapsed">
      <span class="nav-icon">
        <i :class="collapsed ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left'"></i>
      </span>
      <span :class="['nav-label', {hidden:collapsed}]">Collapse</span>
    </div>

  </nav>
</template>

<style>
/* Main Structural Layout Style */

  /* primary sidebar container*/
  .sideNav {
    width: 220px;
    min-width: 220px;
    height: 100vh;
    background: #0F1C2E;
    display: flex;
    flex-direction: column;
    /* smooth collapse animation */
    transition: width 0.25s ease, min-width 0.25s ease;
    /* dual overflow to stop horizontal layout tearing */
    overflow-y: hidden;
    overflow-x: hidden;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
  /* collapsed state width*/
  .sideNav.collapsed {
    width: 60px;
    min-width: 60px;
  }
  .divider {
    height: 0.5px;
    background: #1e3048;
    margin: 4px 16px;
  }

/* Logo Styles */
  .logo-icon {
    width: 32px;
    height: 32px;
    min-width: 32px;
    background: #F5C842;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #0F1C2E;
    flex-shrink: 0;
  }
  /*spins the logo when collapsed */
  .logo-icon i {
    transition: transform 0.4s ease;
  }
  .sideNav.collapsed .logo-icon i {
    transform: rotate(180deg);
  }
  /*logo texts */
  .logo-area {
    display: flex;
    align-items: center;
    padding: 20px 16px;
    cursor: pointer;
    user-select: none;
    gap: 0;
  }
  .logo-text{
    margin-left: 10px;
  }
  .logo-name {
    font-size: 15px;
    font-weight: 500;
    color: #F5C842;
    flex-direction: column;
    display: flex;
  }
  .logo-sub {
    font-size: 11px;
    color: #6a849e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

/* Navigation Items & Interactions */
  .nav-items {
    flex: 1; /* flex 1 fills remaining space between the logo and settings */
    display: flex;
    flex-direction: column;
    padding: 4px 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .nav-item {
    display: flex;
    align-items: center;
    color: #7a9ab5;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-left 0.12s;
    padding: 10px 16px 10px 13px; /* padding calculation to balance left border offset */
    border-left: 3px solid transparent; /* transparent border prevents jiggle on hover*/

    gap:0;
  }
  .nav-item:hover {
    background: #162840;
    color: #c8dcea;
    border-left: 3px solid rgba(245, 200, 66, 0.3);
  }
  /* vue-router automatically adds this class to the current page link */
  .nav-item.router-link-active {
    background: #162840;
    color: #F5C842;
    border-left: 3px solid #F5C842;
  }
  .nav-icon{
    font-size: 16px;
    min-width: 28px;
    max-width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: transparent;
  }
  .collapse-btn {
    color: #3D5a73;
  }
  .collapse-btn:hover{
    color: #c8dcea;
  }

/* Aniamtions, collapsed overrieds and utilities*/
  /* fade transition for all text in sidebar */
  .nav-label, .badge, .logo-text {
    opacity: 1;
    white-space: nowrap;
    background-color: transparent;
    /* Matched to sidenav width transition speed (0.25s) */
    transition: opacity 0.2s ease, width 0.25s ease, margin-left 0.25s ease;
  }
  .badge {
    background: #F5C842;
    color: #0F1C2E;
    font-size: 10px;
    font-weight: 500;
    padding: 1px 6px;
    border-radius: 10px;
    /* pushes the badge to the far right */
    margin-left: auto;
  }
  .hidden {
    opacity: 0;
    width: 0;
    transition: opacity 0.1s ease;
    overflow:hidden;
  }
  .sideNav.collapsed .nav-item{
    padding-left: 0;
    padding-right: 0;
    gap: 0;
    justify-content: center;
  }
  .sideNav.collapsed .nav-icon{
    min-width: 100%;
  }
</style>
