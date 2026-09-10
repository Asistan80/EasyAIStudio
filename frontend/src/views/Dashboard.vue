<script setup>
import { ref } from "vue";

import PromptPanel from "../components/PromptPanel.vue";
import PreviewPanel from "../components/PreviewPanel.vue";
import HistoryPanel from "../components/HistoryPanel.vue";

const generatedImage = ref(null);
const reuseImage = ref(null);

const historyPanel = ref(null);

function handleHistoryImage(image){

    generatedImage.value = {

        image: image.filename,

        provider: image.metadata?.provider,

        prompt: image.metadata?.prompt,

        negative_prompt: image.metadata?.negative_prompt,

        model: image.metadata?.model,

        width: image.metadata?.width,

        height: image.metadata?.height,

        steps: image.metadata?.steps,

        cfg: image.metadata?.cfg,

        seed: image.metadata?.seed,

    };

console.log("Dashboard Image:", generatedImage.value);

}
function handleImageGenerated(data) {
    generatedImage.value = data;
}

function handleImageDeleted() {

    generatedImage.value = null;

    historyPanel.value?.loadHistory();

}

function handleUseAgain(image){

    reuseImage.value = image;

}

</script>

<template>

<div class="dashboard">

    <section class="left-column">

        <PromptPanel
    :reuse-image="reuseImage"
    @image-generated="handleImageGenerated"
/>

    </section>

    <section class="right-column">

       <PreviewPanel
    :key="generatedImage?.image"
    :image="generatedImage"
    @image-deleted="handleImageDeleted"
/>

    </section>

    <section class="history-column">

       <HistoryPanel
    ref="historyPanel"
    @image-selected="handleHistoryImage"
    @use-again="handleUseAgain"
/>

    </section>

</div>

</template>

<style scoped>

.dashboard{

width:100%;

height:100%;

display:grid;

grid-template-columns:420px 1fr;

grid-template-rows:1fr 320px;

gap:20px;

}

.left-column,
.right-column{

    background:#1b2230;

    border:1px solid #2d3648;

    border-radius:14px;

    overflow:hidden;

    box-shadow:0 8px 24px rgba(0,0,0,.25);

}

.history-column{

    background:#1b2230;

    border:1px solid #2d3648;

    border-radius:14px;

    overflow:hidden;

    box-shadow:0 8px 24px rgba(0,0,0,.25);

    grid-column:1 / span 2;

}

@media (max-width:1100px){

.dashboard{

    grid-template-columns:1fr;

    grid-template-rows:auto auto 350px;

}

.history-column{

    grid-column:auto;

}

}

</style>