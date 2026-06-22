<script etup lang="ts">
  const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">

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

  </footer>
</template>

<style>
  .footer{
    background-color: #16263A;
    color: white;
    padding: 32px;
    margin-top: 64px;

  }
  .footer-content{
    display: flex;
    justify-content: space-between;
    max-width:1200px;
    margin: auto;
    gap: 32px;
  }
  .links{
    display: flex;
    gap:24px;
  }
  .links a{
    color: white;
    text-decoration: none;
  }
  .links a:hover{
    opacity: 0.7s;
  }

</style>
