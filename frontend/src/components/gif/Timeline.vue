<script setup>
import { useGifStore } from "../../stores/gifStore";

const gifStore = useGifStore();

function selectFrame(frame) {

    gifStore.selectFrame(frame.id);

}

function updateDuration(frame, event) {

    gifStore.updateFrameDuration(

        frame.id,

        event.target.value

    );

}

</script>

<template>

<div class="timeline">

    <div class="header">

        <h3>Timeline</h3>

    </div>

    <div class="frames">

        <div

            v-for="frame in gifStore.frames"

            :key="frame.id"

            class="frame"

            :class="{

                active: gifStore.selectedFrameId === frame.id

            }"

            @click="selectFrame(frame)"

        >

            <div class="thumb">

                <img

                    v-if="frame.image"

                    :src="frame.image"

                    alt="Frame"

                >

                <span v-else>

                    {{ frame.id }}

                </span>

            </div>

            <div class="name">

                {{ frame.name }}

            </div>

           <div class="duration">

    <label>Duration</label>

    <input
        type="number"
        min="10"
        step="10"
        :value="frame.duration"
        @input="updateDuration(frame, $event)"
    >

    <span>ms</span>

</div>

        </div>

    </div>

</div>

</template>

<style scoped>

.timeline{

height:100%;

display:flex;

flex-direction:column;

background:#1b2230;

}

.duration{

display:flex;

align-items:center;

gap:8px;

margin-top:8px;

}

.duration label{

font-size:12px;

color:#9ca3af;

}

.duration input{

width:70px;

padding:4px 6px;

border-radius:6px;

border:1px solid #374151;

background:#111827;

color:white;

}

.duration span{

font-size:12px;

color:#9ca3af;

}

.header{

height:50px;

display:flex;

align-items:center;

padding:0 18px;

border-bottom:1px solid #2d3648;

}

.header h3{

margin:0;

color:white;

font-size:18px;

font-weight:600;

}

.frames{

flex:1;

display:flex;

gap:14px;

padding:16px;

overflow-x:auto;

overflow-y:hidden;

align-items:flex-start;

}

.frame{

width:110px;

flex-shrink:0;

cursor:pointer;

border:2px solid transparent;

border-radius:10px;

padding:8px;

background:#222b3d;

transition:.2s;

}

.frame:hover{

background:#2b3750;

}

.frame.active{

border-color:#4f8cff;

background:#2f4168;

}

.thumb{

width:100%;

height:70px;

border-radius:8px;

background:#111827;

display:flex;

justify-content:center;

align-items:center;

overflow:hidden;

}

.thumb img{

width:100%;

height:100%;

object-fit:cover;

}

.thumb span{

color:white;

font-size:18px;

font-weight:bold;

}

.name{

margin-top:8px;

text-align:center;

font-size:13px;

color:white;

}

</style>