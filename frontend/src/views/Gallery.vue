<template>

<div class="gallery-page">

    <div class="gallery-header">

        <div>

            <h1>Gallery</h1>

            <p>

                Easy AI Studio Gallery

            </p>

        </div>

        <button

            class="refresh-button"

            @click="loadGallery"

        >

            Refresh

        </button>

    </div>

    <div class="gallery-stats">

        <div class="stat-card">

            <span>

                Total Images

            </span>

            <strong>

                {{ images.length }}

            </strong>

        </div>

    </div>

    <div class="search-bar">

    <input

        v-model="searchText"

        type="text"

        placeholder="🔍 Search images..."

    />

</div>

    <div

        v-if="loading"

        class="loading"

    >

        Loading Gallery...

    </div>

    <div

        v-else

        class="gallery-grid"

    >

        <div

            v-for="image in filteredImages"

            :key="image.filename"

            class="gallery-card"

        >

            <div class="image-wrapper">

                <img

                    :src="imageUrl(image)"

                    :alt="image.filename"

                    @click="preview(image)"

                />

            </div>

            <div class="card-body">

                <h3>

                    {{ image.filename }}

                </h3>

                <div class="meta">

                    <span>

                        {{ formatSize(image.size) }}

                    </span>

                    <span>

                        {{ formatDate(image.modified) }}

                    </span>

                </div>

<div class="actions">

    <button

        class="view-btn"

        @click="preview(image)"

    >

        View

    </button>

    <button

        type="button"

        class="download-btn"

        @click="downloadImage(image)"

    >

        Download

    </button>

    <button

        class="delete-btn"

        @click="deleteImage(image)"

    >

        Delete

    </button>

</div>

            </div>

        </div>

    </div>

<div
    v-if="selectedImage"
    class="preview"
    @click.self="closePreview"
>

    <button
        class="close-button"
        @click="closePreview"
    >
        ✕
    </button>

    <div class="preview-content">

        <img
            :src="imageUrl(selectedImage)"
            :alt="selectedImage.filename"
        />

        <div class="metadata">

            <h3>Image Details</h3>

            <p><strong>Prompt:</strong> {{ selectedMetadata.prompt }}</p>

            <p><strong>Negative:</strong> {{ selectedMetadata.negative_prompt }}</p>

            <p><strong>Model:</strong> {{ selectedMetadata.model }}</p>

            <p><strong>Seed:</strong> {{ selectedMetadata.seed }}</p>

            <p><strong>CFG:</strong> {{ selectedMetadata.cfg }}</p>

            <p><strong>Steps:</strong> {{ selectedMetadata.steps }}</p>

            <p><strong>Width:</strong> {{ selectedMetadata.width }}</p>

            <p><strong>Height:</strong> {{ selectedMetadata.height }}</p>

            <p><strong>Provider:</strong> {{ selectedMetadata.provider }}</p>

        </div>

    </div>

</div></div>

</template>

<script setup>

import { ref, computed, onMounted, onUnmounted } from "vue";

const API="http://127.0.0.1:8000";

const loading=ref(true);

const images=ref([]);

const selectedImage = ref(null);

const showDetails = ref(false);

const selectedMetadata = ref({});

const searchText = ref("");

async function loadGallery(){

    loading.value=true;

    try{

        const response = await fetch(

    API + "/api/gallery?_=" + Date.now()

);

        const data=await response.json();

        images.value=data.images||[];

    }

    finally{

        loading.value=false;

    }

}

const filteredImages = computed(() => {

    return images.value.filter((image) =>

        image.filename
            .toLowerCase()
            .includes(
                searchText.value.toLowerCase()
            )

    );

});

function imageUrl(image){

    return API+"/api/gallery/"+image.filename;

}

async function downloadImage(image) {

    try {

        const response = await fetch(imageUrl(image));

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = image.filename || "image.png";
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);

    } catch (error) {

        console.error("Image download error:", error);
    }
}

function preview(image){

    selectedImage.value = image;

    selectedMetadata.value = image.metadata || {};

}

function closePreview(){

    selectedImage.value=null;

}

async function deleteImage(image){

    const confirmDelete = confirm(

        "Bu resmi silmek istediğine emin misin?"

    );

    if(!confirmDelete){

        return;

    }

    const response = await fetch(

        API + "/api/gallery/" + image.filename,

        {

            method: "DELETE",

        }

    );

    const result = await response.json();

    if(result.success){

        await loadGallery();

    }else{

        alert("Resim silinemedi.");

    }

}

function formatSize(size){

    return (size/1024).toFixed(1)+" KB";

}

function formatDate(time){

    return new Date(

        time*1000

    ).toLocaleString();

}

function openDetails(image) {

    selectedImage.value = image;

    showDetails.value = true;

}

function closeDetails() {

    showDetails.value = false;

    selectedImage.value = null;

}

function handleKey(event){

    if(

        event.key === "Escape"

    ){

        closePreview();

    }

}

function handleGalleryRefresh() {

    loadGallery();

}

onMounted(() => {

    loadGallery();

    window.addEventListener(

        "keydown",

        handleKey

    );

    window.addEventListener(
    "gallery-refresh",
    handleGalleryRefresh
  );

});

</script>

<style scoped>

.gallery-page{

    padding:30px;

    color:white;

    background:#101114;

    min-height:100vh;

}

.gallery-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:25px;

}

.gallery-header h1{

    margin:0;

    font-size:34px;

}

.gallery-header p{

    color:#888;

    margin-top:6px;

}

.refresh-button{

    background:#3b82f6;

    color:white;

    border:none;

    padding:12px 24px;

    border-radius:10px;

    cursor:pointer;

    transition:.25s;

}

.refresh-button:hover{

    transform:translateY(-2px);

}

.gallery-stats{

    display:flex;

    gap:20px;

    margin-bottom:30px;

}

.stat-card{

    background:#1b1d22;

    border:1px solid #2d3138;

    border-radius:14px;

    padding:20px;

    min-width:180px;

}

.stat-card span{

    display:block;

    color:#9ca3af;

    font-size:14px;

    margin-bottom:8px;

}

.stat-card strong{

    font-size:30px;

}

.loading{

    padding:50px;

    text-align:center;

    color:#9ca3af;

}

.gallery-grid{

    display:grid;

    grid-template-columns:repeat(auto-fill,minmax(320px,1fr));

    gap:24px;

}

.gallery-card{

    background:#1b1d22;

    border-radius:16px;

    overflow:hidden;

    border:1px solid #2d3138;

    transition:.25s;

}

.gallery-card:hover{

    transform:translateY(-6px);

    box-shadow:0 18px 45px rgba(0,0,0,.35);

}

.image-wrapper{

    overflow:hidden;

}

.image-wrapper img{

    width:100%;

    height:240px;

    object-fit:cover;

    cursor:pointer;

    transition:.35s;

}

.gallery-card:hover img{

    transform:scale(1.05);

}

.card-body{

    padding:18px;

}

.card-body h3{

    margin:0 0 12px 0;

    font-size:15px;

    word-break:break-all;

}

.meta{

    display:flex;

    justify-content:space-between;

    color:#9ca3af;

    font-size:13px;

    margin-bottom:18px;

}

.actions{

    display:flex;

    gap:10px;

}

.actions button,

.actions a{

    flex:1;

    text-align:center;

    text-decoration:none;

    border:none;

    border-radius:10px;

    padding:10px;

    cursor:pointer;

    font-weight:600;

}

.view-btn{

    background:#3b82f6;

    color:white;

}

.download-btn{

    background:#10b981;

    color:white;

}

.delete-btn{

    background:#ef4444;

    color:white;

}

.delete-btn:hover{

    background:#dc2626;

}

.preview{

    position:fixed;

    inset:0;

    background:rgba(0,0,0,.92);

    display:flex;

    justify-content:center;

    align-items:center;

    z-index:999;

}

.preview img{

    max-width:92%;

    max-height:92%;

    border-radius:16px;

    box-shadow:0 20px 60px rgba(0,0,0,.5);

}

@media (max-width:768px){

    .gallery-header{

        flex-direction:column;

        align-items:flex-start;

        gap:20px;

    }

    .gallery-grid{

        grid-template-columns:1fr;

    }

}

.close-button{

    position:absolute;

    top:20px;

    right:20px;

    width:48px;

    height:48px;

    border:none;

    border-radius:50%;

    background:rgba(255,255,255,.15);

    color:white;

    font-size:24px;

    cursor:pointer;

    transition:.25s;

}

.close-button:hover{

    background:#ef4444;

    transform:scale(1.1);

}

.preview{

    backdrop-filter:blur(10px);

    animation:fadeIn .25s ease;

}

@keyframes fadeIn{

    from{

        opacity:0;

    }

    to{

        opacity:1;

    }

}

</style>