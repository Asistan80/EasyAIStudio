<script setup>
import { ref } from "vue";
import { useGifStore } from "../../stores/gifStore";
import { exportGif } from "../../services/gifExport";

const gifStore = useGifStore();

const exporting = ref(false);

function play() {

    gifStore.play();

}

function pause() {

    gifStore.pause();

}

function stop() {

    gifStore.stop();

}

async function exportCurrentGif() {

    if (!gifStore.frames.length) {

        alert("Frame bulunamadı.");

        return;

    }

    exporting.value = true;

    try {

        const blob = await exportGif(

            gifStore.frames,

            {

                width:512,

                height:512,

                quality:10,

            }

        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "easy-ai-first.gif";

        link.click();

        URL.revokeObjectURL(url);

    }

    catch(err){

        console.error(err);

        alert("GIF oluşturulamadı.");

    }

    finally{

        exporting.value = false;

    }

}
</script>

<template>

<div class="settings">

    <div class="header">

        <h3>Playback</h3>

    </div>

    <div class="buttons">

        <button
            class="play"
            @click="play"
        >
            ▶ Play
        </button>

        <button
            class="pause"
            @click="pause"
        >
            ⏸ Pause
        </button>

        <button
            class="stop"
            @click="stop"
        >
            ⏹ Stop
        </button>


        <button
            class="export"
            @click="exportCurrentGif"
            :disabled="exporting"
        >

     {{ exporting ? "⏳ Export..." : "📦 Export GIF" }}

    </button>

    </div>

    <div class="fps">

        <label>

            FPS

        </label>

        <input

            type="range"

            min="1"

            max="60"

            v-model="gifStore.fps"

        >

        <span>

            {{ gifStore.fps }}

        </span>

    </div>

</div>

</template>

<style scoped>

.settings{

height:100%;

display:flex;

flex-direction:column;

padding:20px;

background:#1b2230;

}

.header{

margin-bottom:20px;

}

.header h3{

margin:0;

font-size:20px;

color:white;

}

.buttons{

display:flex;

flex-direction:column;

gap:12px;

margin-bottom:30px;

}

button{

height:46px;

border:none;

border-radius:10px;

font-size:16px;

font-weight:600;

cursor:pointer;

transition:.2s;

color:white;

}

.play{

background:#16a34a;

}

.play:hover{

background:#22c55e;

}

.pause{

background:#d97706;

}

.pause:hover{

background:#f59e0b;

}

.stop{

background:#dc2626;

}

.stop:hover{

background:#ef4444;

}

.fps{

display:flex;

flex-direction:column;

gap:10px;

color:white;

}

input{

width:100%;

}

span{

font-size:18px;

font-weight:bold;

}

.export{

height:46px;

border:none;

border-radius:10px;

font-size:16px;

font-weight:600;

cursor:pointer;

transition:.2s;

color:white;

background:#2563eb;

}

.export:hover{

background:#1d4ed8;

}

.export:disabled{

background:#6b7280;

cursor:not-allowed;

opacity:.7;

}

</style>