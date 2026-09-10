<script setup>
import { computed } from "vue";

const props = defineProps({

    frame: {
        type: Object,
        default: null,
    },

    playing: {
        type: Boolean,
        default: false,
    },

});

const emit = defineEmits([

    "play",
    "stop",

]);

const hasFrame = computed(() => {

    return props.frame !== null;

});

function togglePlayback(){

    if(props.playing){

        emit("stop");

    }

    else{

        emit("play");

    }

}
</script>

<template>

<div class="preview">

    <div class="preview-header">

        <h2>

            GIF Preview

        </h2>

        <button

            class="play-button"

            @click="togglePlayback"

        >

            {{ playing ? "⏸" : "▶" }}

        </button>

    </div>

    <div

        v-if="hasFrame"

        class="preview-body"

    >

        <img

            :src="frame.thumbnail"

            draggable="false"

        >

    </div>

    <div

        v-else

        class="empty"

    >

        <div class="icon">

            🎬

        </div>

        <h3>

            No Preview

        </h3>

        <p>

            Add frames to preview your GIF.

        </p>

    </div>

</div>

</template>

<style scoped>

.preview{

display:flex;

flex-direction:column;

height:100%;

background:#1b2230;

border:1px solid #2d3648;

border-radius:14px;

overflow:hidden;

}

.preview-header{

display:flex;

justify-content:space-between;

align-items:center;

padding:18px;

border-bottom:1px solid #2d3648;

}

.preview-header h2{

margin:0;

font-size:20px;

font-weight:700;

color:white;

}

.play-button{

width:42px;

height:42px;

border:none;

border-radius:10px;

background:#2563eb;

color:white;

font-size:18px;

cursor:pointer;

transition:.2s;

}

.play-button:hover{

background:#1d4ed8;

}

.preview-body{

flex:1;

display:flex;

justify-content:center;

align-items:center;

padding:25px;

overflow:hidden;

}

.preview-body img{

max-width:100%;

max-height:100%;

border-radius:14px;

box-shadow:0 15px 35px rgba(0,0,0,.35);

object-fit:contain;

}

.empty{

flex:1;

display:flex;

flex-direction:column;

justify-content:center;

align-items:center;

text-align:center;

color:#94a3b8;

padding:30px;

}

.icon{

font-size:72px;

margin-bottom:20px;

}

.empty h3{

margin:0 0 12px;

color:white;

font-size:26px;

}

.empty p{

margin:0;

line-height:1.6;

}

</style>