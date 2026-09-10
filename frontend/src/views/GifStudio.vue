<script setup>
import { ref } from "vue";

import FrameList from "../components/gif/FrameList.vue";
import PreviewPanel from "../components/gif/PreviewPanel.vue";
import SettingsPanel from "../components/gif/SettingsPanel.vue";
import Timeline from "../components/gif/Timeline.vue";

const frames = ref([]);

const selectedFrame = ref(null);

function handleFrameSelected(frame) {

    selectedFrame.value = frame;

}

function handleFramesUpdated(list) {

    frames.value = list;

}
</script>

<template>

<div class="gif-layout">

    <div class="left">

        <FrameList

            @frame-selected="handleFrameSelected"

            @frames-updated="handleFramesUpdated"

        />

    </div>

    <div class="center">

        <PreviewPanel

            :selected-frame="selectedFrame"

        />

    </div>

    <div class="right">

        <SettingsPanel />

    </div>

    <div class="bottom">

        <Timeline />

    </div>

</div>

</template>

<style scoped>

.gif-layout{

width:100%;
height:100%;

display:grid;

grid-template-columns:260px 1fr 300px;
grid-template-rows:1fr 180px;

gap:16px;

}

.left,
.center,
.right,
.bottom{

background:#1b2230;

border:1px solid #2d3648;

border-radius:12px;

overflow:hidden;

}

.bottom{

grid-column:1 / span 3;

}

</style>