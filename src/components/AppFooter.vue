<script setup lang="ts">
  const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-wrap">

      <div class="footer-content">
        <h3 class="site-title">Winna Raffle</h3>
        <p>Are you a winner?</p>
      </div>

      <div class="links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/Raffles">Raffles</RouterLink>
        <RouterLink to="/Winners">Winners</RouterLink>
        <RouterLink to="/Raffles">Login</RouterLink>
      </div>

      <div class="bottom">
        <p>© {{ year }} Winna Raffle. All rights reserved.</p>
      </div>

    </div>


  </footer>
</template>

<style>
  /* Adds padding to all footer content */
  .footer-wrap{
    padding: 12px 12px;
    display: flex;
    flex-wrap: wrap;
    column-gap: 60px;
    background-color: #0B1220;
  }
  .footer{
    color: #6a849e;
  }
  .site-title{
    color: #F5C842;
  }
  .footer-content{
    max-width:100%;
  }
  .footer .links{
    display: flex;
    align-items: center;
  }
  .footer .links a{
    color: #6a849e;
    text-decoration: underline;
    transition: opacity 0.3s ease;
    padding: 0 12px;
    border-right: 1px solid rgba(245, 200, 66, 0.5);
  }
  .footer .links a:first-child{
    padding-left: 0;
  }
  .footer .links a:last-child{
    border-right:none;
    padding-right: 0;
  }
  .footer .links a:hover{
    opacity: 0.7s;
    color: #F5C842;
  }
  .bottom{
    width: 100%;
    padding-top: 12px;
    color:grey;
  }
</style>
