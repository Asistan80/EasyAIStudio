<script setup>

import { ref } from "vue";

const resolution = ref("1920 × 1080");

const fps = ref(30);

const zoom = ref("100%");

const duration = ref("00:00:00");

</script>

<template>

<div class="status-bar">

    <div class="left">

        <span>

            Resolution :
            {{ resolution }}

        </span>

        <span>

            FPS :
            {{ fps }}

        </span>

    </div>

    <div class="center">

        <span>

            Duration :
            {{ duration }}

        </span>

    </div>

    <div class="right">

        <span>

            Zoom :
            {{ zoom }}

        </span>

    </div>

</div>

</template>

<style scoped>

.status-bar{

height:32px;

display:flex;

align-items:center;

justify-content:space-between;

padding:0 16px;

background:#111827;

border-top:1px solid #2d3648;

color:#94a3b8;

font-size:12px;

flex-shrink:0;

}

.left{

display:flex;

gap:18px;

}

.center{

display:flex;

justify-content:center;

flex:1;

}

.right{

display:flex;

justify-content:flex-end;

min-width:120px;

}

span{

white-space:nowrap;

}

</style>