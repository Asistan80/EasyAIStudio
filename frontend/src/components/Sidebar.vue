<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const menu = [

    {
        icon: "🏠",
        title: "Dashboard",
        path: "/",
    },

    {
        icon: "🖼",
        title: "Image Generation",
        path: "/images",
    },

    {
        icon: "🖼️",
        title: "Gallery",
        path: "/gallery",
    },

    {
       icon: "🎞️",
       title: "GIF Studio",
       path: "/gif",
    },

    {
        icon: "🤖",
        title: "AI Video",
        path: "/ai-video",
    },

    {
        icon: "🔊",
        title: "AI Sound",
        path: "/ai-sound",
    },

    {
       icon: "🎬",
       title: "Video Studio",
       path: "/video",
    },

    {
        icon: "💬",
        title: "AI Chat",
        path: "/chat",
    },

];
</script>

<template>

<aside class="sidebar">

    <div class="logo">

        <h2>Easy AI Studio</h2>

    </div>

    <nav>

        <RouterLink

            v-for="item in menu"

            :key="item.path"

            :to="item.path"

            class="menu-item"

            :class="{

                active: route.path===item.path

            }"

        >

            <span>{{ item.icon }}</span>

            <span>{{ item.title }}</span>

        </RouterLink>

    </nav>

</aside>

</template>

<style scoped>

.sidebar{

width:260px;

height:100vh;

background:#151b27;

border-right:1px solid #2d3648;

display:flex;

flex-direction:column;

}

.logo{

padding:25px;

font-size:18px;

font-weight:700;

}

.logo h2{

margin:0;

font-size:22px;

}

nav{

display:flex;

flex-direction:column;

padding:10px;

gap:8px;

}

.menu-item{

display:flex;

gap:12px;

align-items:center;

padding:14px;

border-radius:10px;

text-decoration:none;

color:#d5d8e2;

transition:.2s;

}

.menu-item:hover{

background:#232d40;

}

.menu-item.active{

background:#356df3;

color:white;

}

</style>