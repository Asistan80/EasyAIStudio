<script setup>
import { computed, ref } from "vue";
import { useGifStore } from "../../stores/gifStore";

const gifStore = useGifStore();

const fileInput = ref(null);

const selectedFrame = computed(() => gifStore.selectedFrame);

const previewImage = computed(() => {

    if (!selectedFrame.value) return null;

    return selectedFrame.value.image;

});

function openFileDialog() {

    if (!selectedFrame.value) return;

    fileInput.value?.click();

}

function onFileSelected(event) {

    const file = event.target.files?.[0];

    if (!file || !selectedFrame.value) return;

    const image = URL.createObjectURL(file);

    gifStore.updateFrameImage(
        selectedFrame.value.id,
        image
    );

    event.target.value = "";

}
</script>

<template>

<div class="preview">

    <div class="header">

        <h3>GIF Preview</h3>

        <button
            class="upload-btn"
            @click="openFileDialog"
        >
            📂 Select Image
        </button>

        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display:none"
            @change="onFileSelected"
        >

    </div>

    <div class="body">

        <div
            v-if="!previewImage"
            class="empty"
        >

            No image selected

        </div>

        <img
            v-else
            :src="previewImage"
            class="preview-image"
        >

    </div>

</div>

</template>

<style scoped>

.preview{
height:100%;
display:flex;
flex-direction:column;
background:#1b2230;
}

.header{
height:60px;
display:flex;
justify-content:space-between;
align-items:center;
padding:0 18px;
border-bottom:1px solid #2d3648;
}

.header h3{
margin:0;
font-size:18px;
font-weight:600;
color:white;
}

.upload-btn{
padding:10px 16px;
border:none;
border-radius:8px;
background:#4f8cff;
color:white;
cursor:pointer;
transition:.2s;
}

.upload-btn:hover{
background:#6ba0ff;
}

.body{
flex:1;
display:flex;
justify-content:center;
align-items:center;
padding:20px;
overflow:hidden;
}

.empty{
width:100%;
height:100%;
display:flex;
justify-content:center;
align-items:center;
border:2px dashed #3b455b;
border-radius:12px;
color:#8d97aa;
font-size:20px;
}

.preview-image{
max-width:100%;
max-height:100%;
object-fit:contain;
border-radius:12px;
box-shadow:0 10px 30px rgba(0,0,0,.35);
}

</style>