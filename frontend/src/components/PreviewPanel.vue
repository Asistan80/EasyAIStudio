<script setup>
import { computed } from "vue";

const props = defineProps({

    image: {

        type: Object,

        default: null,

    },

});

const emit = defineEmits([

    "image-deleted",

]);

const imageUrl = computed(() => {

    if (!props.image?.image) return null;

    return `http://127.0.0.1:8000/api/gallery/${props.image.image}`;

});

function removeImage() {

    emit("image-deleted");

}

</script>

<template>

<div class="preview-panel">

    <div class="header">

        <h3>Preview</h3>

    </div>

    <div class="content">

        <div
            v-if="!image"
            class="empty"
        >

            <span>Henüz resim oluşturulmadı.</span>

        </div>

        <div
            v-else
            class="viewer"
        >

            <img
                :src="imageUrl"
                alt="Generated Image"
            />

            <div class="info">

                <div><strong>Provider:</strong> {{ image.provider || "-" }}</div>

                <div><strong>Model:</strong> {{ image.model || "-" }}</div>

                <div><strong>Size:</strong> {{ image.width }} × {{ image.height }}</div>

                <div><strong>Steps:</strong> {{ image.steps }}</div>

                <div><strong>CFG:</strong> {{ image.cfg }}</div>

                <div><strong>Seed:</strong> {{ image.seed }}</div>

            </div>

            <button
                class="delete-btn"
                @click="removeImage"
            >

                Remove Preview

            </button>

        </div>

    </div>

</div>

</template>

<style scoped>

.preview-panel{

height:100%;

display:flex;

flex-direction:column;

background:#1b2230;

color:white;

}

.header{

height:60px;

display:flex;

align-items:center;

padding:0 20px;

border-bottom:1px solid #2d3648;

}

.header h3{

margin:0;

font-size:20px;

font-weight:600;

}

.content{

flex:1;

padding:20px;

overflow:auto;

display:flex;

justify-content:center;

align-items:center;

}

.empty{

width:100%;

height:100%;

display:flex;

justify-content:center;

align-items:center;

border:2px dashed #3b455b;

border-radius:12px;

color:#9aa3b2;

font-size:18px;

}

.viewer{

width:100%;

display:flex;

flex-direction:column;

align-items:center;

gap:18px;

}

.viewer img{

max-width:100%;

max-height:500px;

border-radius:12px;

box-shadow:0 8px 24px rgba(0,0,0,.35);

}

.info{

width:100%;

background:#111827;

border-radius:10px;

padding:15px;

display:grid;

gap:8px;

font-size:14px;

}

.delete-btn{

padding:12px 22px;

border:none;

border-radius:10px;

background:#ef4444;

color:white;

font-size:15px;

cursor:pointer;

transition:.2s;

}

.delete-btn:hover{

background:#dc2626;

}

</style>