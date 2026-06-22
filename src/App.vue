<script setup lang="ts">
  import SideNav from './components/SideNav.vue'
  import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div style="display:flex; height:100vh; overflow: visible;">
    <SideNav />
    <main style="flex:1; overflow-y:auto;">
      <router-view />
    </main>
  </div>
<AppFooter/>
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
</style>
