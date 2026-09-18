<script setup>

import { ref } from "vue";
import { useVideoStore } from "../../stores/videoStore";

const videoStore = useVideoStore();

const fileInput = ref(null);


/*
==========================================================
EVENTS
==========================================================
*/

const emit = defineEmits([
    "open-export"
]);


/*
==========================================================
PROJECT
==========================================================
*/

const projectName = ref("Untitled Video");


function saveProject() {

    const snapshot = videoStore.createSnapshot();

    const json = JSON.stringify(snapshot, null, 2);

    const blob = new Blob(
        [json],
        { type: "application/json" }
    );

    const blobUrl = URL.createObjectURL(blob);

    const safeName =
        (projectName.value || "Untitled Video")
            .trim()
            .replace(/[^a-zA-Z0-9_\-]+/g, "_") ||
        "Untitled_Video";

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${safeName}.json`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
    }, 1000);
}

function triggerOpen() {
    fileInput.value?.click();
}

async function onFileSelected(event) {

    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    try {

        const text = await file.text();

        videoStore.loadProject(text);

        const nameWithoutExt =
            file.name.replace(/\.json$/i, "");

        projectName.value =
            nameWithoutExt || "Untitled Video";

    } catch (error) {

        console.error("Open Project Error:", error);

        alert("Proje dosyası açılamadı. Geçerli bir Easy AI Studio proje dosyası olduğundan emin ol.");

    } finally {

        event.target.value = "";
    }
}

</script>


<template>

<div class="toolbar">

    <div class="left">

        <h2>🎬 Video Studio</h2>

    </div>


    <div class="center">

        <input

            v-model="projectName"

            class="project-name"

            placeholder="Project Name"

        >

    </div>


    <div class="right">

        <input
            ref="fileInput"
            type="file"
            accept="application/json"
            hidden
            @change="onFileSelected"
        >

        <button
            type="button"
            class="tool-btn"
            @click="triggerOpen"
        >

            📂 Open

        </button>


        <button
            type="button"
            class="tool-btn"
            @click="saveProject"
        >

            💾 Save

        </button>


        <button
            type="button"
            class="tool-btn export"
            @click="emit('open-export')"
        >

            🚀 Export

        </button>

    </div>

</div>

</template>


<style scoped>

.toolbar{

height:60px;

display:flex;

align-items:center;

justify-content:space-between;

padding:0 18px;

background:#1b2230;

border-bottom:1px solid #2d3648;

flex-shrink:0;

}


.left{

display:flex;

align-items:center;

}


.left h2{

margin:0;

font-size:20px;

font-weight:700;

color:white;

}


.center{

flex:1;

display:flex;

justify-content:center;

}


.project-name{

width:320px;

height:38px;

padding:0 14px;

border-radius:8px;

border:1px solid #374151;

background:#111827;

color:white;

font-size:14px;

outline:none;

}


.project-name:focus{

border-color:#3b82f6;

}


.right{

display:flex;

gap:10px;

}


.tool-btn{

height:38px;

padding:0 16px;

border:none;

border-radius:8px;

background:#374151;

color:white;

font-weight:600;

cursor:pointer;

transition:.2s;

}


.tool-btn:hover{

background:#4b5563;

}


.export{

background:#2563eb;

}


.export:hover{

background:#1d4ed8;

}

</style>
