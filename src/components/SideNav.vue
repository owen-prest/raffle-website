<script setup lang="ts">
  import { ref } from 'vue'
  import { RouterLink } from 'vue-router'

  interface NavItem{
    label: string
    icon: string
    path: string
    // ? means badge is optional - not every nav item needs one
    badge?:number
  }

  // ref() makes collapsed reactive so the template updates automatically
  const collapsed=ref(false)


  //web pages
  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-house', path: '/' },
    { label: 'Raffles', icon: 'fas fa-ticket-alt', path: '/raffles' },
    { label: 'Login', icon: 'fa-solid fa-user', path: '/Login' },
  ]
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
  .sideNav {
    width: 220px;
    min-width: 220px;
    height: 100vh;
    background: #0F1C2E;
    display: flex;
    flex-direction: column;
    /* smooth collapse animation */
    transition: width 0.25s ease, min-width 0.25s ease;
    /* overflow hidden clips the labels as they slide out during collapse */
    overflow: hidden;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
  .sideNav.collapsed {
    width: 60px;
    min-width: 60px;
  }
  .logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 16px;
    cursor: pointer;
    user-select: none;
  }
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
  .divider {
    height: 0.5px;
    background: #1e3048;
    margin: 4px 16px;
  }
  .nav-items {
    /* flex 1 fills remaining space between the logo and settings */
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 4px 0;
    overflow-y: auto;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: #7a9ab5;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.12s;
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
  .nav-icon i{
    background-color: transparent;
  }
  .nav-icon{
    font-size: 16px;
    min-width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: transparent;
  }
  .badge {
    background: #F5C842;
    color: #0F1C2E;
    font-size: 10px;
    font-weight: 500;
    padding: 1px 6px;
    border-radius: 10px;
    /* margin-left auto pushes the badge to the far right */
    margin-left: auto;
  }
  .collapse-btn {
    color: #3D5a73;
  }
  .collapse-btn:hover{
    color: #c8dcea;
  }
  /* fade transition for all text in sidebar */
  .nav-label, .badge, .logo-text {
    opacity: 1;
    white-space: nowrap;
    transition: opacity 0.4s ease 0.25s;
  }
  .hidden {
    opacity: 0;
    width: 0;
    transition: opacity 0.1s ease;
    overflow:hidden;
  }
</style>
