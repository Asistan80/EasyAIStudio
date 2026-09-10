<script setup>

import {
    ref,
    computed
} from "vue";

import {
    useVideoStore
} from "../../stores/videoStore";


const videoStore = useVideoStore();


/*
==========================================================
EXPORT SETTINGS
==========================================================
*/

const exportSettings = ref({

    format: "mp4",

    codec: "H264",

    fps: 60,

    resolution: "1920x1080",

    bitrate: 20,

    audioCodec: "AAC",

    audioBitrate: 320,

    useGPU: true,

    outputFolder: "",

    filename: "EasyAIStudio_Render"

});


/*
==========================================================
FORMATS
==========================================================
*/

const formats = [

    "mp4",

    "mov",

    "mkv",

    "webm"

];


/*
==========================================================
VIDEO CODECS
==========================================================
*/

const codecs = [

    "H264",

    "H265",

    "AV1",

    "ProRes"

];


/*
==========================================================
FPS
==========================================================
*/

const fpsOptions = [

    24,

    30,

    60,

    120

];


/*
==========================================================
RESOLUTION
==========================================================
*/

const resolutions = [

    "1280x720",

    "1920x1080",

    "2560x1440",

    "3840x2160",

    "7680x4320"

];


/*
==========================================================
AUDIO
==========================================================
*/

const audioCodecs = [

    "AAC",

    "MP3",

    "WAV",

    "FLAC"

];


/*
==========================================================
RENDER STATE
==========================================================
*/

const rendering = ref(false);

const progress = ref(0);

const estimatedTime = ref("--");

const estimatedSize = ref("--");


/*
==========================================================
EXPORT
==========================================================
*/

async function startExport(){

    if(rendering.value) return;

    rendering.value = true;

    progress.value = 0;

    await videoStore.startExport({

        ...exportSettings.value

    });

}


/*
==========================================================
CANCEL
==========================================================
*/

function cancelExport(){

    videoStore.cancelExport();

    rendering.value = false;

    progress.value = 0;

}


/*
==========================================================
OUTPUT
==========================================================
*/

async function chooseOutputFolder(){

    const folder = await videoStore.selectFolder();

    if(folder){

        exportSettings.value.outputFolder = folder;

    }

}


/*
==========================================================
ESTIMATION
==========================================================
*/

const estimatedFileSize = computed(()=>{

    return videoStore.calculateEstimatedSize(

        exportSettings.value

    );

});


const estimatedRenderTime = computed(()=>{

    return videoStore.calculateEstimatedTime(

        exportSettings.value

    );

});


/*
==========================================================
GPU
==========================================================
*/

function toggleGPU(){

    exportSettings.value.useGPU =

        !exportSettings.value.useGPU;

}


/*
==========================================================
WATCH EXPORT
==========================================================
*/

videoStore.onExportProgress(

    value=>{

        progress.value = value;

        if(value >= 100){

            rendering.value = false;

        }

    }

);

</script>


<template>

<div class="export-panel">

    <!-- ======================================================
         HEADER
    ====================================================== -->

    <div class="export-header">

        <h2>

            🚀 Export Project

        </h2>

    </div>


    <!-- ======================================================
         CONTENT
    ====================================================== -->

    <div class="export-content">


        <!-- FORMAT -->

        <div class="field">

            <label>

                Format

            </label>

            <select
                v-model="exportSettings.format"
            >

                <option
                    v-for="format in formats"
                    :key="format"
                    :value="format"
                >

                    {{ format.toUpperCase() }}

                </option>

            </select>

        </div>


        <!-- CODEC -->

        <div class="field">

            <label>

                Codec

            </label>

            <select
                v-model="exportSettings.codec"
            >

                <option
                    v-for="codec in codecs"
                    :key="codec"
                    :value="codec"
                >

                    {{ codec }}

                </option>

            </select>

        </div>


        <!-- FPS -->

        <div class="field">

            <label>

                FPS

            </label>

            <select
                v-model="exportSettings.fps"
            >

                <option
                    v-for="fps in fpsOptions"
                    :key="fps"
                    :value="fps"
                >

                    {{ fps }}

                </option>

            </select>

        </div>


        <!-- RESOLUTION -->

        <div class="field">

            <label>

                Resolution

            </label>

            <select
                v-model="exportSettings.resolution"
            >

                <option
                    v-for="resolution in resolutions"
                    :key="resolution"
                    :value="resolution"
                >

                    {{ resolution }}

                </option>

            </select>

        </div>


        <!-- VIDEO BITRATE -->

        <div class="field">

            <label>

                Video Bitrate (Mbps)

            </label>

            <input
                type="range"
                min="2"
                max="120"
                v-model="exportSettings.bitrate"
            />

            <div class="value">

                {{ exportSettings.bitrate }} Mbps

            </div>

        </div>


        <!-- AUDIO -->

        <div class="field">

            <label>

                Audio Codec

            </label>

            <select
                v-model="exportSettings.audioCodec"
            >

                <option
                    v-for="codec in audioCodecs"
                    :key="codec"
                    :value="codec"
                >

                    {{ codec }}

                </option>

            </select>

        </div>


        <!-- AUDIO BITRATE -->

        <div class="field">

            <label>

                Audio Bitrate

            </label>

            <input
                type="range"
                min="64"
                max="512"
                step="32"
                v-model="exportSettings.audioBitrate"
            />

            <div class="value">

                {{ exportSettings.audioBitrate }} kbps

            </div>

        </div>


        <!-- GPU -->

        <div class="field">

            <label>

                Rendering Device

            </label>

            <div class="gpu-toggle">

                <button
                    type="button"
                    :class="{
                        active: exportSettings.useGPU
                    }"
                    @click="toggleGPU"
                >

                    🚀 GPU

                </button>


                <button
                    type="button"
                    :class="{
                        active: !exportSettings.useGPU
                    }"
                    @click="toggleGPU"
                >

                    🖥️ CPU

                </button>

            </div>

        </div>


        <!-- OUTPUT -->

        <div class="field">

            <label>

                Output Folder

            </label>

            <div class="output-folder">

                <input
                    type="text"
                    readonly
                    :placeholder="'Choose export folder...'"
                    v-model="exportSettings.outputFolder"
                />

                <button
                    type="button"
                    @click="chooseOutputFolder"
                >

                    📁 Browse

                </button>

            </div>

        </div>


        <!-- FILE NAME -->

        <div class="field">

            <label>

                File Name

            </label>

            <input
                type="text"
                v-model="exportSettings.filename"
                placeholder="Render Name"
            />

        </div>


        <!-- ESTIMATION -->

        <div class="field">

            <label>

                Estimated Render Time

            </label>

            <div class="info-box">

                ⏱️ {{ estimatedRenderTime }}

            </div>

        </div>


        <div class="field">

            <label>

                Estimated File Size

            </label>

            <div class="info-box">

                💾 {{ estimatedFileSize }}

            </div>

        </div>


        <!-- ======================================================
             PROGRESS
        ====================================================== -->

        <div
            v-if="rendering"
            class="progress-section"
        >

            <div class="progress-header">

                <span>

                    Rendering...

                </span>

                <span>

                    {{ progress }}%

                </span>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    :style="{
                        width: progress + '%'
                    }"
                ></div>

            </div>

        </div>


        <!-- ======================================================
             STATUS
        ====================================================== -->

        <div
            v-if="videoStore.exportStatus"
            class="status-box"
            :class="videoStore.exportStatus.type"
        >

            {{ videoStore.exportStatus.message }}

        </div>


        <!-- ======================================================
             ACTIONS
        ====================================================== -->

        <div class="export-actions">

            <button
                type="button"
                class="export-btn"
                @click="startExport"
                :disabled="rendering"
            >

                ▶ Export

            </button>


            <button
                type="button"
                class="cancel-btn"
                @click="cancelExport"
                :disabled="!rendering"
            >

                ✕ Cancel

            </button>

        </div>

    </div>

</div>

</template>


<style scoped>

/* ====================================================== */
/* MAIN */
/* ====================================================== */

.export-panel{

    width:100%;

    height:100%;

    display:flex;

    flex-direction:column;

    overflow:hidden;

    background:#1c1c1c;

    color:#ffffff;

}


/* ====================================================== */
/* HEADER */
/* ====================================================== */

.export-header{

    padding:18px 22px;

    background:#262626;

    border-bottom:1px solid #3a3a3a;

}


.export-header h2{

    margin:0;

    font-size:22px;

    font-weight:600;

}


/* ====================================================== */
/* CONTENT */
/* ====================================================== */

.export-content{

    flex:1;

    overflow:auto;

    display:flex;

    flex-direction:column;

    gap:18px;

    padding:22px;

}


/* ====================================================== */
/* FIELD */
/* ====================================================== */

.field{

    display:flex;

    flex-direction:column;

    gap:8px;

}


.field label{

    font-size:13px;

    color:#c9c9c9;

    font-weight:500;

}


/* ====================================================== */
/* INPUT */
/* ====================================================== */

.field input,

.field select{

    width:100%;

    height:40px;

    padding:0 12px;

    border-radius:8px;

    border:1px solid #444;

    background:#313131;

    color:#ffffff;

    outline:none;

    transition:

        border-color .18s,

        box-shadow .18s;

}


.field input:focus,

.field select:focus{

    border-color:#3b82f6;

    box-shadow:

        0 0 0 2px

        rgba(59,130,246,.22);

}


/* ====================================================== */
/* RANGE */
/* ====================================================== */

.field input[type="range"]{

    height:auto;

    padding:0;

    accent-color:#3b82f6;

    cursor:pointer;

}


/* ====================================================== */
/* VALUE */
/* ====================================================== */

.value{

    font-size:12px;

    color:#7fc6ff;

    text-align:right;

}


/* ====================================================== */
/* GPU TOGGLE */
/* ====================================================== */

.gpu-toggle{

    display:flex;

    gap:10px;

}


.gpu-toggle button{

    flex:1;

    height:42px;

    border:none;

    border-radius:8px;

    background:#3a3a3a;

    color:#ffffff;

    cursor:pointer;

    transition:

        background .18s,

        transform .15s,

        box-shadow .18s;

}


.gpu-toggle button:hover{

    background:#4a4a4a;

}


.gpu-toggle button.active{

    background:#3b82f6;

    box-shadow:

        0 0 16px

        rgba(59,130,246,.35);

}


.gpu-toggle button:active{

    transform:scale(.96);

}


/* ====================================================== */
/* OUTPUT FOLDER */
/* ====================================================== */

.output-folder{

    display:flex;

    gap:10px;

}


.output-folder input{

    flex:1;

}


.output-folder button{

    min-width:110px;

    border:none;

    border-radius:8px;

    background:#3b82f6;

    color:#ffffff;

    cursor:pointer;

    transition:

        background .18s,

        transform .15s;

}


.output-folder button:hover{

    background:#2f74db;

}


.output-folder button:active{

    transform:scale(.96);

}


/* ====================================================== */
/* INFO BOX */
/* ====================================================== */

.info-box{

    display:flex;

    align-items:center;

    justify-content:space-between;

    min-height:42px;

    padding:10px 14px;

    border:1px solid #3d3d3d;

    border-radius:8px;

    background:#2d2d2d;

    color:#8fd0ff;

    font-size:13px;

}


/* ====================================================== */
/* PROGRESS */
/* ====================================================== */

.progress-section{

    display:flex;

    flex-direction:column;

    gap:10px;

    margin-top:8px;

}


.progress-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    font-size:13px;

    color:#d4d4d4;

}


.progress-bar{

    width:100%;

    height:12px;

    overflow:hidden;

    border-radius:999px;

    background:#303030;

}


.progress-fill{

    height:100%;

    width:0;

    background:linear-gradient(

        90deg,

        #3b82f6,

        #67b4ff

    );

    transition:width .25s ease;

}


/* ====================================================== */
/* ACTION BUTTONS */
/* ====================================================== */

.export-actions{

    display:flex;

    gap:12px;

    margin-top:10px;

}


.export-btn,

.cancel-btn{

    flex:1;

    height:44px;

    border:none;

    border-radius:8px;

    color:#ffffff;

    cursor:pointer;

    font-size:14px;

    font-weight:600;

    transition:

        transform .15s,

        background .18s,

        box-shadow .18s;

}


.export-btn{

    background:#16a34a;

}


.export-btn:hover{

    background:#15803d;

}


.cancel-btn{

    background:#dc2626;

}


.cancel-btn:hover{

    background:#b91c1c;

}


.export-btn:active,

.cancel-btn:active{

    transform:scale(.97);

}


/* ====================================================== */
/* STATUS BOX */
/* ====================================================== */

.status-box{

    display:flex;

    align-items:center;

    justify-content:center;

    min-height:46px;

    padding:12px 16px;

    border-radius:8px;

    font-size:13px;

    font-weight:500;

    border:1px solid transparent;

}


/* ====================================================== */
/* SUCCESS */
/* ====================================================== */

.status-box.success{

    color:#4caf50;

    background:rgba(76,175,80,.12);

    border-color:rgba(76,175,80,.30);

}


/* ====================================================== */
/* ERROR */
/* ====================================================== */

.status-box.error{

    color:#ef5350;

    background:rgba(239,83,80,.12);

    border-color:rgba(239,83,80,.30);

}


/* ====================================================== */
/* WARNING */
/* ====================================================== */

.status-box.warning{

    color:#ffca28;

    background:rgba(255,202,40,.12);

    border-color:rgba(255,202,40,.30);

}


/* ====================================================== */
/* INFO */
/* ====================================================== */

.status-box.info{

    color:#58b4ff;

    background:rgba(88,180,255,.12);

    border-color:rgba(88,180,255,.30);

}


/* ====================================================== */
/* LOADING OVERLAY */
/* ====================================================== */

.loading-overlay{

    position:absolute;

    inset:0;

    display:flex;

    align-items:center;

    justify-content:center;

    background:rgba(18,18,18,.72);

    backdrop-filter:blur(3px);

    z-index:100;

}


/* ====================================================== */
/* SPINNER */
/* ====================================================== */

.loading-spinner{

    width:46px;

    height:46px;

    border:4px solid rgba(255,255,255,.15);

    border-top-color:#3b82f6;

    border-radius:50%;

    animation:exportSpin .9s linear infinite;

}


@keyframes exportSpin{

    from{

        transform:rotate(0deg);

    }

    to{

        transform:rotate(360deg);

    }

}


/* ====================================================== */
/* EXPORT FINISHED */
/* ====================================================== */

.export-finished{

    color:#4caf50;

    font-weight:600;

    text-align:center;

    padding:12px;

}


/* ====================================================== */
/* EXPORT FAILED */
/* ====================================================== */

.export-failed{

    color:#ef5350;

    font-weight:600;

    text-align:center;

    padding:12px;

}


/* ====================================================== */
/* COMMON BUTTONS */
/* ====================================================== */

button{

    font-family:inherit;

    transition:

        background .18s,

        color .18s,

        transform .15s,

        box-shadow .18s;

}


button:active{

    transform:scale(.97);

}


button:disabled{

    opacity:.45;

    cursor:not-allowed;

}


/* ====================================================== */
/* INPUTS */
/* ====================================================== */

input,

select{

    outline:none;

    transition:

        border-color .18s,

        box-shadow .18s;

}


input:focus,

select:focus{

    border-color:#3b82f6;

    box-shadow:

        0 0 0 2px

        rgba(59,130,246,.22);

}


/* ====================================================== */
/* TEXT SELECTION */
/* ====================================================== */

::selection{

    background:#3b82f6;

    color:#ffffff;

}


/* ====================================================== */
/* RESPONSIVE */
/* ====================================================== */

@media (max-width:900px){

    .export-content{

        padding:16px;

        gap:16px;

    }


    .output-folder{

        flex-direction:column;

    }


    .output-folder button{

        width:100%;

    }


    .gpu-toggle{

        flex-direction:column;

    }


    .export-actions{

        flex-direction:column;

    }

}


@media (max-width:600px){

    .export-header{

        padding:16px;

    }


    .export-header h2{

        font-size:18px;

    }


    .field input,

    .field select{

        height:38px;

    }

}


/* ====================================================== */
/* ACCESSIBILITY */
/* ====================================================== */

button:focus-visible,

input:focus-visible,

select:focus-visible{

    outline:2px solid #58b4ff;

    outline-offset:2px;

}


/* ====================================================== */
/* HOVER EFFECTS */
/* ====================================================== */

.field{

    transition:

        transform .18s,

        background .18s;

}


.field:hover{

    transform:translateY(-1px);

}


.output-folder input:hover,

.field input:hover,

.field select:hover{

    border-color:#5a5a5a;

}


/* ====================================================== */
/* PROGRESS EFFECT */
/* ====================================================== */

.progress-fill{

    position:relative;

    overflow:hidden;

}


.progress-fill::after{

    content:"";

    position:absolute;

    inset:0;

    background:

        linear-gradient(

            90deg,

            transparent,

            rgba(255,255,255,.25),

            transparent

        );

    animation:progressShine 1.8s linear infinite;

}


@keyframes progressShine{

    from{

        transform:translateX(-100%);

    }

    to{

        transform:translateX(100%);

    }

}


/* ====================================================== */
/* OUTPUT BOX */
/* ====================================================== */

.output-folder{

    transition:

        transform .18s;

}


.output-folder:hover{

    transform:translateY(-1px);

}


/* ====================================================== */
/* GPU ACCELERATION */
/* ====================================================== */

.export-panel,

.export-content,

.progress-bar,

.progress-fill,

.status-box,

.export-actions{

    transform:translateZ(0);

    backface-visibility:hidden;

}


/* ====================================================== */
/* PERFORMANCE */
/* ====================================================== */

.export-content{

    contain:layout paint style;

}


.export-btn,

.cancel-btn,

.output-folder button,

.gpu-toggle button{

    will-change:

        transform,

        background;

}


/* ====================================================== */
/* SMOOTH SCROLL */
/* ====================================================== */

.export-content{

    scroll-behavior:smooth;

}


.export-content::-webkit-scrollbar{

    width:10px;

}


.export-content::-webkit-scrollbar-track{

    background:#202020;

}


.export-content::-webkit-scrollbar-thumb{

    background:#5b5b5b;

    border-radius:6px;

}


.export-content::-webkit-scrollbar-thumb:hover{

    background:#7a7a7a;

}


/* ====================================================== */
/* INFO ANIMATION */
/* ====================================================== */

.info-box{

    transition:

        border-color .18s,

        background .18s,

        transform .18s;

}


.info-box:hover{

    transform:translateY(-1px);

    border-color:#4c4c4c;

}


/* ====================================================== */
/* PERFORMANCE */
/* ====================================================== */

.export-panel,

.export-content,

.progress-bar,

.progress-fill,

.status-box,

.export-actions,

.output-folder,

.gpu-toggle{

    will-change:transform;

}


.field{

    contain:layout paint style;

}


/* ====================================================== */
/* USER SELECT */
/* ====================================================== */

.export-panel *{

    user-select:none;

    -webkit-user-select:none;

}


.field input{

    user-select:text;

    -webkit-user-select:text;

}


/* ====================================================== */
/* IMAGE RENDER */
/* ====================================================== */

.export-btn,

.cancel-btn{

    image-rendering:auto;

}


/* ====================================================== */
/* GPU LAYER */
/* ====================================================== */

.progress-fill,

.export-btn,

.cancel-btn,

.gpu-toggle button{

    transform:translateZ(0);

    backface-visibility:hidden;

}


/* ====================================================== */
/* REDUCE MOTION */
/* ====================================================== */

@media (prefers-reduced-motion: reduce){

    *{

        animation:none !important;

        transition:none !important;

        scroll-behavior:auto !important;

    }

}


/* ====================================================== */
/* PRINT */
/* ====================================================== */

@media print{

    .export-actions,
    .loading-overlay,
    .gpu-toggle,
    .output-folder button{

        display:none !important;

    }

}


/* ====================================================== */
/* GPU OPTIMIZATION */
/* ====================================================== */

.export-content{

    transform:translateZ(0);

}


.export-btn,
.cancel-btn,
.gpu-toggle button,
.output-folder button{

    backface-visibility:hidden;

}


/* ====================================================== */
/* SHADOW HELPERS */
/* ====================================================== */

.shadow-soft{

    box-shadow:

        0 8px 20px

        rgba(0,0,0,.22);

}


.shadow-medium{

    box-shadow:

        0 12px 28px

        rgba(0,0,0,.30);

}


.shadow-strong{

    box-shadow:

        0 18px 40px

        rgba(0,0,0,.40);

}


/* ====================================================== */
/* BORDER HELPERS */
/* ====================================================== */

.border-primary{

    border-color:#3b82f6 !important;

}


.border-success{

    border-color:#4caf50 !important;

}


.border-warning{

    border-color:#ffca28 !important;

}


.border-danger{

    border-color:#ef5350 !important;

}


/* ====================================================== */
/* COLOR HELPERS */
/* ====================================================== */

.text-primary{

    color:#3b82f6;

}


.text-success{

    color:#4caf50;

}


.text-warning{

    color:#ffca28;

}


.text-danger{

    color:#ef5350;

}


/* ====================================================== */
/* END */
/* ====================================================== */

</style>