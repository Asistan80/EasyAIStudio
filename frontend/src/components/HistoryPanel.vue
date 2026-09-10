<script setup>
import { ref, computed, onMounted } from "vue";

const API = "http://127.0.0.1:8000";

const loading = ref(false);

const images = ref([]);

const search = ref("");

const favoritesOnly = ref(false);

const selectedImage = ref(null);

const emit = defineEmits([
    "image-selected",
    "use-again",
]);

async function loadHistory(){

    loading.value = true;

    try{

        const response = await fetch(

            API + "/api/gallery",

            {

                cache: "no-store"

            }

        );

        const data = await response.json();

        images.value = data.images || [];

    }

    catch(error){

        console.error(error);

    }

    finally{

        loading.value = false;

    }

}

const filteredImages = computed(() => {

    if (!search.value.trim()) {

    if (!favoritesOnly.value){

        return images.value;

    }

    return images.value.filter(

        image => image.metadata.favorite

    );

}

    const text = search.value.toLowerCase();

    return images.value.filter((image) => {

    if (

        favoritesOnly.value &&

        !image.metadata.favorite

    ){

        return false;

    }

    const prompt =
        image.metadata?.prompt?.toLowerCase() || "";

    const filename =
        image.filename.toLowerCase();

    return (

        prompt.includes(text) ||

        filename.includes(text)

    );

});

});

function imageUrl(image){

    return API + "/api/gallery/" + image.filename;

}

function selectImage(image){

    selectedImage.value = image.filename;

    emit("image-selected", image);

}

async function toggleFavorite(image){

    await fetch(

        API +
        "/api/gallery/" +
        image.filename +
        "/favorite",

        {
            method: "PUT",

            headers: {

                "Content-Type": "application/json",

            },

            body: JSON.stringify(

                !image.metadata.favorite

            ),

        }

    );

    image.metadata.favorite =
        !image.metadata.favorite;

}

async function copyPrompt(image){

console.log(image);
console.log(image.metadata);
console.log(image.metadata?.prompt);

    const prompt =
        image.metadata?.prompt || "";

    if(!prompt){

        alert("Bu resimde prompt bulunamadı.");

        return;

    }

    await navigator.clipboard.writeText(
        prompt
    );

    alert("Prompt panoya kopyalandı.");
}

defineExpose({

    loadHistory,

});

onMounted(loadHistory);

</script>

<template>

<div class="history-panel">

    <div class="history-header">

        <h2>

            History

        </h2>

        <button

            @click="loadHistory"

        >

            🔄 Refresh

        </button>

    </div>

<div class="filter-buttons">

    <button
        :class="{ active: !favoritesOnly }"
        @click="favoritesOnly = false"
    >
        All
    </button>

    <button
        :class="{ active: favoritesOnly }"
        @click="favoritesOnly = true"
    >
        ⭐ Favorites
    </button>

</div>


<div class="search-box">

    <input
        v-model="search"
        type="text"
        placeholder="🔍 Search prompt or filename..."
    >

</div>

    <div

        v-if="loading"

        class="loading"

    >

        Loading...

    </div>


    <div

        v-else-if="images.length===0"

        class="empty"

    >

        <div class="empty-icon">

            🖼️

        </div>

        <h3>

            No Images Yet

        </h3>

        <p>

            Generate your first AI image.

        </p>

    </div>

    <div

        v-else

        class="history-grid"

    >

        <div

    v-for="image in filteredImages"

    :key="image.filename"

    class="history-card"

    :class="{

        selected: selectedImage === image.filename

    }"

>

            <img
    :src="imageUrl(image)"
    @click="selectImage(image)"
>

<button
    class="favorite-button"
    @click.stop="toggleFavorite(image)"
>
    {{ image.metadata.favorite ? "⭐" : "☆" }}
</button>

<button
    class="reuse-button"
    @click.stop="emit('use-again', image)"
>
    🔁 Use Again
</button>

<button
    class="copy-button"
    @click.stop="copyPrompt(image)"
    title="Copy Prompt"
>
    📋
</button>

        </div>

    </div>

</div>

</template>

<style scoped>

.history-panel{

display:flex;

flex-direction:column;

background:#1b2230;

border:1px solid #2d3648;

border-radius:14px;

padding:20px;

height:100%;

}

.history-header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:20px;

}

.history-header h2{

margin:0;

font-size:22px;

}

.history-header button{

background:#2563eb;

color:white;

border:none;

padding:10px 18px;

border-radius:10px;

cursor:pointer;

transition:.2s;

}

.history-header button:hover{

background:#1d4ed8;

}

.loading{

display:flex;

justify-content:center;

align-items:center;

flex:1;

color:#94a3b8;

}

.empty{

display:flex;

flex-direction:column;

justify-content:center;

align-items:center;

flex:1;

text-align:center;

color:#94a3b8;

}

.empty-icon{

font-size:70px;

margin-bottom:20px;

}

.history-grid{

display:grid;

grid-template-columns:repeat(auto-fill,minmax(120px,1fr));

gap:15px;

overflow-y:auto;

}

.history-card{

position:relative;

background:#111827;

border:1px solid #374151;

border-radius:12px;

overflow:hidden;

cursor:pointer;

transition:.25s;

}

.history-card:hover{

transform:translateY(-4px);

border-color:#3b82f6;

}

.history-card img{

width:100%;

aspect-ratio:1;

object-fit:cover;

display:block;

}

.history-card.selected{

border:2px solid #3b82f6;

box-shadow:0 0 12px rgba(59,130,246,.6);

transform:scale(1.03);

}

.reuse-button{

    width:100%;

    border:none;

    border-top:1px solid #374151;

    background:#1f2937;

    color:white;

    padding:10px;

    cursor:pointer;

    transition:.2s;

}

.reuse-button:hover{

    background:#2563eb;

}

.search-box{

    margin-bottom:20px;

}

.search-box input{

    width:100%;

    padding:12px 14px;

    border:1px solid #374151;

    border-radius:10px;

    background:#111827;

    color:white;

    font-size:14px;

    outline:none;

    transition:.2s;

    box-sizing:border-box;

}

.search-box input:focus{

    border-color:#3b82f6;

    box-shadow:0 0 0 3px rgba(59,130,246,.2);

}

.favorite-button{

position:absolute;

top:8px;

right:8px;

width:34px;

height:34px;

border:none;

border-radius:50%;

background:#111827dd;

color:#ffd43b;

font-size:18px;

cursor:pointer;

transition:.2s;

}

.favorite-button:hover{

background:#2563eb;

}

.filter-buttons{

display:flex;

gap:10px;

margin-bottom:20px;

}

.filter-buttons button{

padding:10px 18px;

border:none;

border-radius:10px;

background:#1f2937;

color:white;

cursor:pointer;

transition:.2s;

}

.filter-buttons button.active{

background:#2563eb;

}

.copy-button{

position:absolute;

bottom:10px;

right:10px;

width:34px;

height:34px;

border:none;

border-radius:8px;

background:#1f2937;

color:white;

cursor:pointer;

display:flex;

align-items:center;

justify-content:center;

font-size:16px;

transition:.2s;

}

.copy-button:hover{

background:#0f766e;

transform:scale(1.08);

}

</style>