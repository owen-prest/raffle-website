<script setup lang="ts">
  import SideNav from './components/SideNav.vue'
  import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class ="layout">
    <SideNav />
    <main class="main">
      <router-view />
      <AppFooter/>
    </main>
  </div>
</template>

<style>
  /* Resets default browser margins & padding*/
  *{
    margin:0;
    padding:0;
    box-sizing:border-box;
    background-color: #0B1220;
  }
  body{
    overflow:hidden;
  }
  .layout{
    display:flex; height:100vh; overflow: visible;
  }
  .main{
    flex:1; overflow-y:auto;
  }
</style>
