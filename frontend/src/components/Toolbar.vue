<script setup>
import { ref } from "vue";

const search = ref("");
</script>

<template>
  <div class="toolbar">

    <div class="left">

      <h2>Dashboard</h2>

    </div>

    <div class="center">

      <input
        v-model="search"
        type="text"
        placeholder="Ara..."
      />

    </div>

    <div class="right">

      <button class="icon-btn">🔔</button>

      <button class="icon-btn">🌙</button>

      <div class="avatar">
        M
      </div>

    </div>

  </div>
</template>

<style scoped>

.toolbar{

    height:70px;

    display:flex;

    align-items:center;

    justify-content:space-between;

    padding:0 20px;

}

.left h2{

    font-size:22px;

    font-weight:600;

}

.center{

    flex:1;

    display:flex;

    justify-content:center;

}

.center input{

    width:420px;

    padding:10px 16px;

    border:none;

    border-radius:10px;

    outline:none;

    background:#2b3142;

    color:white;

}

.center input::placeholder{

    color:#9aa3b2;

}

.right{

    display:flex;

    align-items:center;

    gap:12px;

}

.icon-btn{

    width:40px;

    height:40px;

    border:none;

    border-radius:10px;

    background:#2b3142;

    color:white;

    cursor:pointer;

    transition:.2s;

    font-size:18px;

}

.icon-btn:hover{

    background:#3a4258;

}

.avatar{

    width:42px;

    height:42px;

    border-radius:50%;

    background:#4f8cff;

    display:flex;

    justify-content:center;

    align-items:center;

    font-weight:bold;

    font-size:18px;

}

</style>