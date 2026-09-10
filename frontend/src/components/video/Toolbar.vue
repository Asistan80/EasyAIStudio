<script setup>

import { ref } from "vue";


/*
==========================================================
EVENTS
==========================================================
*/

const emit = defineEmits([
    "open-export"
]);


/*
==========================================================
PROJECT
==========================================================
*/

const projectName = ref("Untitled Video");

</script>


<template>

<div class="toolbar">

    <div class="left">

        <h2>🎬 Video Studio</h2>

    </div>


    <div class="center">

        <input

            v-model="projectName"

            class="project-name"

            placeholder="Project Name"

        >

    </div>


    <div class="right">

        <button
            type="button"
            class="tool-btn"
        >

            📂 Open

        </button>


        <button
            type="button"
            class="tool-btn"
        >

            💾 Save

        </button>


        <button
            type="button"
            class="tool-btn export"
            @click="emit('open-export')"
        >

            🚀 Export

        </button>

    </div>

</div>

</template>


<style scoped>

.toolbar{

height:60px;

display:flex;

align-items:center;

justify-content:space-between;

padding:0 18px;

background:#1b2230;

border-bottom:1px solid #2d3648;

flex-shrink:0;

}


.left{

display:flex;

align-items:center;

}


.left h2{

margin:0;

font-size:20px;

font-weight:700;

color:white;

}


.center{

flex:1;

display:flex;

justify-content:center;

}


.project-name{

width:320px;

height:38px;

padding:0 14px;

border-radius:8px;

border:1px solid #374151;

background:#111827;

color:white;

font-size:14px;

outline:none;

}


.project-name:focus{

border-color:#3b82f6;

}


.right{

display:flex;

gap:10px;

}


.tool-btn{

height:38px;

padding:0 16px;

border:none;

border-radius:8px;

background:#374151;

color:white;

font-weight:600;

cursor:pointer;

transition:.2s;

}


.tool-btn:hover{

background:#4b5563;

}


.export{

background:#2563eb;

}


.export:hover{

background:#1d4ed8;

}

</style>