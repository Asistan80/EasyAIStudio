<script setup>

const emit = defineEmits([

    "add-frame",

    "remove-frame",

    "move-up",

    "move-down",

    "clear",

    "generate",

]);

</script>

<template>

<div class="toolbar">

    <button
        @click="emit('add-frame')"
    >
        ➕ Add Frame
    </button>

    <button
        @click="emit('remove-frame')"
    >
        🗑 Remove
    </button>

    <button
        @click="emit('move-up')"
    >
        ⬆ Up
    </button>

    <button
        @click="emit('move-down')"
    >
        ⬇ Down
    </button>

    <button
        @click="emit('clear')"
    >
        🧹 Clear
    </button>

    <div class="spacer"></div>

    <button
        class="generate"
        @click="emit('generate')"
    >
        🎞 Generate GIF
    </button>

</div>

</template>

<style scoped>

.toolbar{

display:flex;

align-items:center;

gap:12px;

padding:18px;

background:#1b2230;

border:1px solid #2d3648;

border-radius:14px;

}

.toolbar button{

padding:10px 16px;

border:none;

border-radius:10px;

background:#293244;

color:white;

cursor:pointer;

transition:.2s;

font-size:14px;

}

.toolbar button:hover{

background:#3b4862;

}

.spacer{

flex:1;

}

.generate{

background:#2563eb !important;

font-weight:700;

}

.generate:hover{

background:#1d4ed8 !important;

}

</style>