<script setup>
const props = defineProps({

    fps:{
        type:Number,
        default:10,
    },

    loop:{
        type:Boolean,
        default:true,
    },

    quality:{
        type:Number,
        default:80,
    },

    width:{
        type:Number,
        default:512,
    },

    height:{
        type:Number,
        default:512,
    },

});

const emit = defineEmits([

    "update:fps",

    "update:loop",

    "update:quality",

    "update:width",

    "update:height",

]);
</script>

<template>

<div class="settings">

    <h2>

        GIF Settings

    </h2>

    <div class="group">

        <label>

            FPS

        </label>

        <input

            type="range"

            min="1"

            max="30"

            :value="fps"

            @input="emit('update:fps',Number($event.target.value))"

        >

        <span>

            {{ fps }}

        </span>

    </div>

    <div class="group">

        <label>

            Width

        </label>

        <input

            type="number"

            :value="width"

            @input="emit('update:width',Number($event.target.value))"

        >

    </div>

    <div class="group">

        <label>

            Height

        </label>

        <input

            type="number"

            :value="height"

            @input="emit('update:height',Number($event.target.value))"

        >

    </div>

    <div class="group">

        <label>

            Quality

        </label>

        <input

            type="range"

            min="1"

            max="100"

            :value="quality"

            @input="emit('update:quality',Number($event.target.value))"

        >

        <span>

            {{ quality }}%

        </span>

    </div>

    <div class="group checkbox">

        <input

            id="loop"

            type="checkbox"

            :checked="loop"

            @change="emit('update:loop',$event.target.checked)"

        >

        <label for="loop">

            Infinite Loop

        </label>

    </div>

</div>

</template>

<style scoped>

.settings{

display:flex;

flex-direction:column;

gap:20px;

padding:20px;

height:100%;

background:#1b2230;

border:1px solid #2d3648;

border-radius:14px;

}

.settings h2{

margin:0;

font-size:20px;

color:white;

}

.group{

display:flex;

flex-direction:column;

gap:8px;

}

.group label{

font-size:13px;

color:#94a3b8;

text-transform:uppercase;

letter-spacing:.08em;

}

.group input[type="number"]{

padding:10px;

border:none;

border-radius:8px;

background:#111827;

color:white;

}

.group input[type="range"]{

width:100%;

}

.group span{

font-size:14px;

color:white;

}

.checkbox{

flex-direction:row;

align-items:center;

gap:10px;

margin-top:auto;

}

.checkbox input{

width:18px;

height:18px;

}

</style>