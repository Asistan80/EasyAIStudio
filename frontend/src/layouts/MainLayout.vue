<script setup>
import Sidebar from "../components/Sidebar.vue";
import Toolbar from "../components/Toolbar.vue";
</script>

<template>
  <div class="layout">

    <Sidebar />

    <div class="main">

      <Toolbar />

      <main class="page">

        <router-view />

      </main>

    </div>

  </div>
</template>

<style scoped>

.layout{
    display:flex;
    width:100vw;
    height:100vh;
    overflow:hidden;
    background:#111827;
}

.main{
    flex:1;
    display:flex;
    flex-direction:column;
    min-width:0;
}

.page{
    flex:1;
    overflow:auto;
    padding:0;
}

</style>