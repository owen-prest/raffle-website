<script setup lang="ts">
  import SideNav from './components/SideNav.vue'
  import AppFooter from './components/AppFooter.vue'
  import { useAuth } from './composables/useAuth'

  const { isLoading } = useAuth()
</script>

<template>
  <!-- Global loading state while restoring session from localStorage -->
  <div v-if="isLoading" class="loading-screen">
    <div class="spinner"></div>
  </div>

  <!-- Application layout renders once auth state is initialized -->
  <div v-else class="layout">
    <SideNav />
    <main class="main no-scrollbar">
      <div class="content-wrap">
        <router-view />
      </div>
      <AppFooter />
    </main>
  </div>
</template>

<style>
  /* Resets default browser margins & padding*/
  *{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body{
    background-color: #0B1220;
  }
  .layout{
    display: flex;
    height: 100vh;
    overflow: visible;
  }
  .main{
    flex: 1;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .content-wrap {
    flex: 1;
  }
  /* Loading Overlay Styles */
  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background-color: #0B1220;
  }

  .spinner {
    width: 44px;
    height: 44px;
    border: 3px solid rgba(245, 200, 66, 0.15);
    border-top-color: #F5C842;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
