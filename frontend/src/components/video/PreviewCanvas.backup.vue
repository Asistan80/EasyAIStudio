<script setup>

import {

    ref,

    computed,

    onMounted,

    onUnmounted

} from "vue";

import {

    useVideoStore

} from "../../stores/videoStore";

const videoStore = useVideoStore();

/*
==========================================================
CANVAS
==========================================================
*/

const previewCanvas = ref(null);

const canvasWrapper = ref(null);

/*
==========================================================
VIEW
==========================================================
*/

const zoom = ref(100);

const panX = ref(0);

const panY = ref(0);

const isPanning = ref(false);

const lastMouseX = ref(0);

const lastMouseY = ref(0);

/*
==========================================================
OVERLAYS
==========================================================
*/

const showGrid = ref(true);

const showSafeArea = ref(true);

const showGuides = ref(true);

const showSelection = ref(true);

const showCrop = ref(false);

/*
==========================================================
PLAYBACK
==========================================================
*/

const isPlaying = computed(()=>

    videoStore.isPlaying

);

const currentFrame = computed(()=>

    videoStore.currentFrame

);

const currentTime = computed(()=>

    videoStore.currentTime

);

/*
==========================================================
PROJECT
==========================================================
*/

const project = computed(()=>

    videoStore.project

);

/*
==========================================================
SELECTED
==========================================================
*/

const selectedClip = computed(()=>

    videoStore.selectedClip

);

/*
==========================================================
QUALITY
==========================================================
*/

const previewQuality = ref("full");

const background = ref("checker");

const snapEnabled = ref(true);

const fitMode = ref("fit");

/*
==========================================================
ZOOM
==========================================================
*/

function zoomIn(){

    zoom.value = Math.min(

        zoom.value + 10,

        800

    );

}

function zoomOut(){

    zoom.value = Math.max(

        zoom.value - 10,

        10

    );

}

function zoom100(){

    zoom.value = 100;

}

function fitScreen(){

    fitMode.value = "fit";

    zoom.value = 100;

    panX.value = 0;

    panY.value = 0;

}

function resetView(){

    zoom.value = 100;

    panX.value = 0;

    panY.value = 0;

}

/*
==========================================================
MOUSE WHEEL
==========================================================
*/

function handleWheel(e){

    e.preventDefault();

    if(e.deltaY < 0){

        zoom.value = Math.min(

            zoom.value + 5,

            800

        );

    }

    else{

        zoom.value = Math.max(

            zoom.value - 5,

            10

        );

    }

}

/*
==========================================================
PAN
==========================================================
*/

function startPan(e){

    if(!isPanning.value)

        return;

    lastMouseX.value = e.clientX;

    lastMouseY.value = e.clientY;

}

function movePan(e){

    if(!isPanning.value)

        return;

    const dx =

        e.clientX -

        lastMouseX.value;

    const dy =

        e.clientY -

        lastMouseY.value;

    panX.value += dx;

    panY.value += dy;

    lastMouseX.value = e.clientX;

    lastMouseY.value = e.clientY;

}

function endPan(){

    isPanning.value = false;

}

/*
==========================================================
KEYBOARD
==========================================================
*/

function handleKeyDown(e){

    if(e.code==="Space"){

        e.preventDefault();

        isPanning.value = true;

    }

}

function handleKeyUp(e){

    if(e.code==="Space"){

        isPanning.value = false;

    }

}

/*
==========================================================
CANVAS
==========================================================
*/

function resizeCanvas(){

    if(!previewCanvas.value)

        return;

    const canvas = previewCanvas.value;

    const wrapper = canvasWrapper.value;

    if(!wrapper)

        return;

    canvas.width = wrapper.clientWidth;

    canvas.height = wrapper.clientHeight;

}

/*
==========================================================
RENDER
==========================================================
*/

let animationFrame = null;
let lastFrameTime = null;

const imageCache = new Map();

const videoCache = new Map();

function loadVideo(url){

    if(!url)
        return null;


    if(videoCache.has(url)){

        return videoCache.get(url);

    }


    const video =
        document.createElement(
            "video"
        );


    video.preload =
        "auto";

    video.muted =
        true;

    video.playsInline =
        true;

    video.crossOrigin =
        "anonymous";


    /*
    ==================================================
    EVENTS
    ==================================================
    */

    video.addEventListener(
        "loadedmetadata",
        () => {

            console.log(
                "VIDEO METADATA LOADED",
                {
                    url,
                    width:
                        video.videoWidth,
                    height:
                        video.videoHeight,
                    duration:
                        video.duration,
                    readyState:
                        video.readyState
                }
            );

        }
    );


    video.addEventListener(
        "loadeddata",
        () => {

            console.log(
                "VIDEO LOADED DATA",
                {
                    url,
                    readyState:
                        video.readyState,
                    videoWidth:
                        video.videoWidth,
                    videoHeight:
                        video.videoHeight,
                    duration:
                        video.duration
                }
            );

        }
    );


    video.addEventListener(
        "canplay",
        () => {

            console.log(
                "VIDEO CAN PLAY",
                {
                    url,
                    readyState:
                        video.readyState,
                    videoWidth:
                        video.videoWidth,
                    videoHeight:
                        video.videoHeight
                }
            );

        }
    );


    video.addEventListener(
        "error",
        () => {

            console.error(
                "VIDEO LOAD ERROR",
                {
                    url,
                    error:
                        video.error
                }
            );

        }
    );


    /*
    ==================================================
    SOURCE
    ==================================================
    */

    video.src =
        url;


    videoCache.set(
        url,
        video
    );


    video.load();


    return video;

}

function getMediaForClip(clip){

    if(!clip || clip.mediaId == null)
        return null;

    return videoStore.media.find(
        item => item.id === clip.mediaId
    ) || null;

}

function loadImage(url){

    if(!url)
        return null;

    if(imageCache.has(url))
        return imageCache.get(url);

    const image = new Image();

    image.src = url;

    imageCache.set(url, image);

    return image;

}

function renderPreview(timestamp){

    if(!previewCanvas.value){

        lastFrameTime = null;

        return;

    }

    const canvas =
        previewCanvas.value;

    const ctx =
        canvas.getContext("2d");

    if(!ctx)
        return;


    /*
    ==========================================================
    PLAYBACK CLOCK
    ==========================================================
    */

    if(lastFrameTime === null){

        lastFrameTime =
            timestamp ??
            performance.now();

    }

    const now =
        timestamp ??
        performance.now();

    const delta =
        Math.min(
            (now - lastFrameTime) / 1000,
            0.1
        );

    lastFrameTime =
        now;

    videoStore.updatePlayback(
        delta
    );


    /*
    ==========================================================
    BACKGROUND
    ==========================================================
    */

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle =
        "#181818";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
    ==========================================================
    ACTIVE CLIP
    ==========================================================
    */

    const activeClip =
        videoStore.tracks
            .flatMap(
                track =>
                    track.clips || []
            )
            .find(
                clip => {

                    const start =
                        Number(
                            clip.start ?? 0
                        );

                    const duration =
                        Number(
                            clip.duration ?? 0
                        );

                    const end =
                        start +
                        duration;

                    return (
                        currentTime.value >= start &&
                        currentTime.value <= end &&
                        clip.visible !== false
                    );

                }
            );


    if(!activeClip){

        animationFrame =
            requestAnimationFrame(
                renderPreview
            );

        return;

    }


    const clip =
        activeClip;


    const time =
        currentTime.value;

    const clipStart =
        Number(
            clip.start ?? 0
        );

    const clipDuration =
        Number(
            clip.duration ?? 0
        );

    const clipEnd =
        clipStart +
        clipDuration;


    if(
        time < clipStart ||
        time > clipEnd
    ){

        animationFrame =
            requestAnimationFrame(
                renderPreview
            );

        return;

    }


    /*
    ==========================================================
    MEDIA
    ==========================================================
    */

    const media =
        getMediaForClip(
            clip
        );


    if(!media){

        animationFrame =
            requestAnimationFrame(
                renderPreview
            );

        return;

    }


    /*
    ==========================================================
    COMMON TRANSFORM VALUES
    ==========================================================
    */

    const positionX =
        Number(
            clip.positionX ?? 0
        );

    const positionY =
        Number(
            clip.positionY ?? 0
        );

    const centerX =
        canvas.width / 2 +
        positionX;

    const centerY =
        canvas.height / 2 +
        positionY;

    const rotation =
        Number(
            clip.rotation ?? 0
        ) *
        Math.PI /
        180;

    const opacity =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    clip.opacity ?? 100
                )
            )
        ) / 100;


    /*
    ==========================================================
    IMAGE / GIF
    ==========================================================
    */

    if(
        media.type === "image" ||
        media.type === "gif"
    ){

        const image =
            loadImage(
                media.url
            );


        if(
            image &&
            image.complete &&
            image.naturalWidth > 0 &&
            image.naturalHeight > 0
        ){

            const imageWidth =
                image.naturalWidth;

            const imageHeight =
                image.naturalHeight;


            const scaleX =
                canvas.width /
                imageWidth;

            const scaleY =
                canvas.height /
                imageHeight;

            const baseScale =
                Math.min(
                    scaleX,
                    scaleY
                );


            const userScale =
                Number(
                    clip.scale ?? 100
                ) / 100;


            const drawScale =
                baseScale *
                userScale;


            const drawWidth =
                imageWidth *
                drawScale;

            const drawHeight =
                imageHeight *
                drawScale;

    /*
    ==========================================================
    VIDEO
    ==========================================================
    */

    if(
        media.type === "video" ||
        media.type?.startsWith("video/")
    ){

        const video =
            loadVideo(
                media.url
            );

        if(video){
          
console.log(
    "=== VIDEO RUNTIME DEBUG ===",
    {
        url: media.url,
        readyState: video.readyState,
        networkState: video.networkState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
        ended: video.ended,
        error: video.error
    }
);

            /*
            ==================================================
            VIDEO TIME
            ==================================================
            */

            const videoTime =
                Math.max(
                    0,
                    time -
                    clipStart +
                    Number(
                        clip.offset ?? 0
                    )
                );


            /*
            ==================================================
            SEEK
            ==================================================
            */

            if(
                Number.isFinite(
                    videoTime
                ) &&
                video.readyState >= 1 &&
                Math.abs(
                    video.currentTime -
                    videoTime
                ) > 0.05
            ){

                try{

                    video.currentTime =
                        videoTime;

                }
                catch(error){

                    console.warn(
                        "Video seek error:",
                        error
                    );

                }

            }


            /*
            ==================================================
            VIDEO READY
            ==================================================
            */

            if(
                video.readyState >= 2 &&
                video.videoWidth > 0 &&
                video.videoHeight > 0
            ){

                const videoWidth =
                    video.videoWidth;

                const videoHeight =
                    video.videoHeight;


                /*
                ==============================================
                FIT VIDEO
                ==============================================
                */

                const scaleX =
                    canvas.width /
                    videoWidth;

                const scaleY =
                    canvas.height /
                    videoHeight;


                const baseScale =
                    Math.min(
                        scaleX,
                        scaleY
                    );


                const userScale =
                    Number(
                        clip.scale ?? 100
                    ) / 100;


                const drawScale =
                    baseScale *
                    userScale;


                const drawWidth =
                    videoWidth *
                    drawScale;

                const drawHeight =
                    videoHeight *
                    drawScale;


                /*
                ==============================================
                DRAW VIDEO
                ==============================================
                */

ctx.save();

ctx.setTransform(
    1,
    0,
    0,
    1,
    0,
    0
);

ctx.globalAlpha = 1;

console.log(
    "=== RAW VIDEO DRAW TEST ===",
    {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        readyState: video.readyState
    }
);

ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
);

ctx.fillStyle = "#ff0000";

ctx.fillRect(
    20,
    20,
    200,
    100
);

ctx.restore();

            /*
            ==================================================
            VIDEO PLAYBACK
            ==================================================
            */

            if(
                isPlaying.value
            ){

                if(
                    video.paused &&
                    video.readyState >= 2
                ){

                    video.play().catch(
                        error => {

                            console.warn(
                                "Video play error:",
                                error
                            );

                        }
                    );

                }

            }
            else{

                if(
                    !video.paused
                ){

                    video.pause();

                }

            }

        }

    }


    /*
    ==========================================================
    NEXT FRAME
    ==========================================================
    */

    animationFrame =
        requestAnimationFrame(
            renderPreview
        );

}

/*
==========================================================
LIFECYCLE
==========================================================
*/

onMounted(()=>{

    resizeCanvas();

    renderPreview();

    window.addEventListener(

        "resize",

        resizeCanvas

    );

    window.addEventListener(

        "keydown",

        handleKeyDown

    );

    window.addEventListener(

        "keyup",

        handleKeyUp

    );

});

onUnmounted(()=>{

    cancelAnimationFrame(

        animationFrame

    );

    window.removeEventListener(

        "resize",

        resizeCanvas

    );

    window.removeEventListener(

        "keydown",

        handleKeyDown

    );

    window.removeEventListener(

        "keyup",

        handleKeyUp

    );

});

</script>

<template>

<div class="preview-canvas">

<!-- ====================================================== -->
<!-- TOP TOOLBAR -->
<!-- ====================================================== -->

<div class="preview-toolbar">

<div class="toolbar-left">

<button @click="zoomOut">

➖

</button>

<button @click="zoom100">

100%

</button>

<button @click="zoomIn">

➕

</button>

<button @click="fitScreen">

Fit

</button>

<button @click="resetView">

Reset

</button>

</div>

<div class="toolbar-center">

<span>

{{ project.resolution }}

</span>

<span>

•

</span>

<span>

{{ project.fps }} FPS

</span>

<span>

•

</span>

<span>

{{ previewQuality }}

</span>

</div>

<div class="toolbar-right">

<label>

<input

type="checkbox"

v-model="showGrid"

/>

Grid

</label>

<label>

<input

type="checkbox"

v-model="showSafeArea"

/>

Safe

</label>

<label>

<input

type="checkbox"

v-model="showGuides"

/>

Guides

</label>

</div>

</div>

<!-- ====================================================== -->
<!-- CANVAS AREA -->
<!-- ====================================================== -->

<div

ref="canvasWrapper"

class="canvas-wrapper"

@wheel.prevent="handleWheel"

@mousedown="startPan"

@mousemove="movePan"

@mouseup="endPan"

@mouseleave="endPan"

>

<canvas

ref="previewCanvas"

class="preview-screen"

:style="{

transform:

'translate('+

panX+

'px,'+

panY+

'px) scale('+

zoom/100+

')'

}"

>

</canvas>

</div>

<!-- ====================================================== -->
<!-- PLAYBACK BAR -->
<!-- ====================================================== -->

<div class="preview-playback">

<div class="playback-left">

<button

@click="videoStore.goToFirstFrame()"

title="First Frame"

>

⏮

</button>

<button

@click="videoStore.previousFrame()"

title="Previous Frame"

>

◀|

</button>

<button

v-if="!isPlaying"

@click="videoStore.play()"

title="Play"

>

▶

</button>

<button

v-else

@click="videoStore.pause()"

title="Pause"

>

⏸

</button>

<button

@click="videoStore.nextFrame()"

title="Next Frame"

>

|▶

</button>

<button

@click="videoStore.goToLastFrame()"

title="Last Frame"

>

⏭

</button>

</div>

<!-- ====================================================== -->
<!-- TIMECODE -->
<!-- ====================================================== -->

<div class="playback-center">

<div class="timecode">

{{ currentTime.toFixed(2) }}

s

</div>

<div class="frame">

Frame

{{ currentFrame }}

</div>

</div>

<!-- ====================================================== -->
<!-- ZOOM -->
<!-- ====================================================== -->

<div class="playback-right">

<span>

Zoom

</span>

<strong>

{{ zoom }}%

</strong>

</div>

</div>

</div>

</template>

<style scoped>

/* ====================================================== */
/* MAIN */
/* ====================================================== */

.preview-canvas{

    width:100%;

    height:100%;

    display:flex;

    flex-direction:column;

    background:#1b1b1b;

    color:#ffffff;

    overflow:hidden;

}

/* ====================================================== */
/* TOOLBAR */
/* ====================================================== */

.preview-toolbar{

    height:50px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:0 14px;

    background:#272727;

    border-bottom:1px solid #3a3a3a;

}

.toolbar-left,

.toolbar-center,

.toolbar-right{

    display:flex;

    align-items:center;

    gap:10px;

}

.toolbar-center{

    font-size:13px;

    color:#bfbfbf;

}

.toolbar-right label{

    display:flex;

    align-items:center;

    gap:6px;

    font-size:13px;

    cursor:pointer;

}

.toolbar-right input{

    cursor:pointer;

}

/* ====================================================== */
/* BUTTONS */
/* ====================================================== */

.preview-toolbar button{

    min-width:42px;

    height:34px;

    border:none;

    border-radius:6px;

    background:#353535;

    color:#ffffff;

    cursor:pointer;

    transition:.18s;

}

.preview-toolbar button:hover{

    background:#3b82f6;

    transform:translateY(-1px);

}

.preview-toolbar button:active{

    transform:scale(.96);

}

/* ====================================================== */
/* CANVAS */
/* ====================================================== */

.canvas-wrapper{

    flex:1;

    position:relative;

    overflow:hidden;

    display:flex;

    align-items:center;

    justify-content:center;

    background:#101010;

}

.preview-screen{

    background:#181818;

    border:1px solid #444;

    box-shadow:

        0 15px 40px

        rgba(0,0,0,.45);

    transform-origin:center center;

    transition:transform .08s linear;

}

/* ====================================================== */
/* PLAYBACK BAR */
/* ====================================================== */

.preview-playback{

    height:56px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:0 16px;

    background:#262626;

    border-top:1px solid #3a3a3a;

}

/* ====================================================== */
/* PLAYBACK GROUPS */
/* ====================================================== */

.playback-left,

.playback-center,

.playback-right{

    display:flex;

    align-items:center;

    gap:10px;

}

/* ====================================================== */
/* PLAYBACK BUTTONS */
/* ====================================================== */

.preview-playback button{

    width:38px;

    height:38px;

    border:none;

    border-radius:8px;

    background:#353535;

    color:#ffffff;

    cursor:pointer;

    transition:

        background .18s,

        transform .15s;

}

.preview-playback button:hover{

    background:#3b82f6;

    transform:translateY(-1px);

}

.preview-playback button:active{

    transform:scale(.96);

}

/* ====================================================== */
/* TIMECODE */
/* ====================================================== */

.timecode{

    font-size:14px;

    font-weight:600;

    color:#ffffff;

    min-width:90px;

    text-align:center;

}

.frame{

    font-size:13px;

    color:#b8b8b8;

    min-width:90px;

    text-align:center;

}

/* ====================================================== */
/* ZOOM INFO */
/* ====================================================== */

.playback-right{

    font-size:13px;

    color:#b8b8b8;

}

.playback-right strong{

    color:#ffffff;

    font-size:14px;

}

/* ====================================================== */
/* STATUS */
/* ====================================================== */

.playback-center{

    background:#2f2f2f;

    padding:6px 12px;

    border-radius:8px;

}

/* ====================================================== */
/* OVERLAYS */
/* ====================================================== */

.canvas-wrapper{

    position:relative;

}

/* ====================================================== */
/* GRID OVERLAY */
/* ====================================================== */

.canvas-wrapper::before{

    content:"";

    position:absolute;

    inset:0;

    pointer-events:none;

    opacity:0.12;

    background-image:

        linear-gradient(

            rgba(255,255,255,.18) 1px,

            transparent 1px

        ),

        linear-gradient(

            90deg,

            rgba(255,255,255,.18) 1px,

            transparent 1px

        );

    background-size:

        40px 40px;

}

/* ====================================================== */
/* CENTER CROSS */
/* ====================================================== */

.canvas-wrapper::after{

    content:"";

    position:absolute;

    left:50%;

    top:50%;

    width:24px;

    height:24px;

    transform:translate(-50%,-50%);

    pointer-events:none;

    background:

        linear-gradient(

            #ff5252,

            #ff5252

        ) center/2px 24px no-repeat,

        linear-gradient(

            90deg,

            #ff5252,

            #ff5252

        ) center/24px 2px no-repeat;

    opacity:.75;

}

/* ====================================================== */
/* SAFE AREA */
/* ====================================================== */

.safe-area{

    position:absolute;

    left:10%;

    top:10%;

    width:80%;

    height:80%;

    border:2px dashed

        rgba(255,255,255,.45);

    pointer-events:none;

    box-sizing:border-box;

}

/* ====================================================== */
/* TITLE SAFE */
/* ====================================================== */

.title-safe{

    position:absolute;

    left:20%;

    top:20%;

    width:60%;

    height:60%;

    border:1px dashed

        rgba(59,130,246,.75);

    pointer-events:none;

    box-sizing:border-box;

}

/* ====================================================== */
/* CROP OVERLAY */
/* ====================================================== */

.crop-overlay{

    position:absolute;

    inset:0;

    pointer-events:none;

    background:

        rgba(0,0,0,.35);

    border:2px solid

        rgba(255,255,255,.55);

}

/* ====================================================== */
/* GUIDE LINES */
/* ====================================================== */

.guide-horizontal,

.guide-vertical{

    position:absolute;

    background:#00e5ff;

    opacity:.8;

    pointer-events:none;

}

.guide-horizontal{

    width:100%;

    height:1px;

}

.guide-vertical{

    width:1px;

    height:100%;

}

/* ====================================================== */
/* TRANSFORM GIZMO */
/* ====================================================== */

.selection-box{

    position:absolute;

    border:2px solid #3b82f6;

    box-sizing:border-box;

    pointer-events:none;

}

.selection-box::before{

    content:"";

    position:absolute;

    inset:0;

    background:rgba(59,130,246,.08);

}

/* ====================================================== */
/* RESIZE HANDLES */
/* ====================================================== */

.resize-handle{

    position:absolute;

    width:10px;

    height:10px;

    background:#ffffff;

    border:2px solid #3b82f6;

    border-radius:50%;

    pointer-events:auto;

    box-sizing:border-box;

}

/* Köşeler */

.handle-nw{

    top:-6px;

    left:-6px;

    cursor:nwse-resize;

}

.handle-ne{

    top:-6px;

    right:-6px;

    cursor:nesw-resize;

}

.handle-sw{

    bottom:-6px;

    left:-6px;

    cursor:nesw-resize;

}

.handle-se{

    bottom:-6px;

    right:-6px;

    cursor:nwse-resize;

}

/* Kenarlar */

.handle-n{

    top:-6px;

    left:50%;

    transform:translateX(-50%);

    cursor:ns-resize;

}

.handle-s{

    bottom:-6px;

    left:50%;

    transform:translateX(-50%);

    cursor:ns-resize;

}

.handle-e{

    right:-6px;

    top:50%;

    transform:translateY(-50%);

    cursor:ew-resize;

}

.handle-w{

    left:-6px;

    top:50%;

    transform:translateY(-50%);

    cursor:ew-resize;

}

/* ====================================================== */
/* ROTATION HANDLE */
/* ====================================================== */

.rotation-line{

    position:absolute;

    left:50%;

    top:-28px;

    width:2px;

    height:20px;

    background:#3b82f6;

    transform:translateX(-50%);

}

.rotation-handle{

    position:absolute;

    left:50%;

    top:-40px;

    transform:translateX(-50%);

    width:14px;

    height:14px;

    border-radius:50%;

    background:#ffca28;

    border:2px solid #222;

    cursor:grab;

}

.rotation-handle:active{

    cursor:grabbing;

}

/* ====================================================== */
/* TRANSFORM ORIGIN */
/* ====================================================== */

.transform-origin{

    position:absolute;

    left:50%;

    top:50%;

    width:8px;

    height:8px;

    border-radius:50%;

    background:#ff5252;

    transform:translate(-50%,-50%);

    pointer-events:none;

}

/* ====================================================== */
/* TRANSPARENCY BACKGROUND */
/* ====================================================== */

.preview-transparent{

    background-color:#2d2d2d;

    background-image:

        linear-gradient(45deg,#3a3a3a 25%,transparent 25%),

        linear-gradient(-45deg,#3a3a3a 25%,transparent 25%),

        linear-gradient(45deg,transparent 75%,#3a3a3a 75%),

        linear-gradient(-45deg,transparent 75%,#3a3a3a 75%);

    background-size:24px 24px;

    background-position:

        0 0,

        0 12px,

        12px -12px,

        -12px 0;

}

/* ====================================================== */
/* CINEMATIC LETTERBOX */
/* ====================================================== */

.letterbox-top,

.letterbox-bottom{

    position:absolute;

    left:0;

    width:100%;

    height:12%;

    background:#000;

    pointer-events:none;

    opacity:.92;

    z-index:20;

}

.letterbox-top{

    top:0;

}

.letterbox-bottom{

    bottom:0;

}

/* ====================================================== */
/* ZOOM INDICATOR */
/* ====================================================== */

.zoom-indicator{

    position:absolute;

    right:18px;

    bottom:18px;

    padding:6px 10px;

    border-radius:8px;

    background:rgba(20,20,20,.85);

    border:1px solid #444;

    color:#ffffff;

    font-size:12px;

    font-weight:600;

    pointer-events:none;

    z-index:30;

}

/* ====================================================== */
/* PREVIEW INFO */
/* ====================================================== */

.preview-info{

    position:absolute;

    left:18px;

    bottom:18px;

    display:flex;

    gap:10px;

    padding:6px 10px;

    border-radius:8px;

    background:rgba(20,20,20,.85);

    border:1px solid #444;

    color:#d0d0d0;

    font-size:12px;

    pointer-events:none;

    z-index:30;

}

/* ====================================================== */
/* GPU RENDER HINT */
/* ====================================================== */

.preview-screen{

    will-change:transform;

    backface-visibility:hidden;

    transform-style:preserve-3d;

    image-rendering:auto;

}

/* ====================================================== */
/* SMOOTH ANIMATION */
/* ====================================================== */

.preview-screen,

.selection-box,

.rotation-handle,

.resize-handle{

    transition:

        transform .08s linear,

        opacity .15s ease;

}

/* ====================================================== */
/* RESPONSIVE */
/* ====================================================== */

@media (max-width:1200px){

    .preview-toolbar{

        padding:0 10px;

    }

    .toolbar-left,

    .toolbar-center,

    .toolbar-right{

        gap:6px;

    }

    .preview-playback{

        padding:0 10px;

    }

}

@media (max-width:900px){

    .preview-toolbar{

        flex-wrap:wrap;

        height:auto;

        padding:10px;

        gap:10px;

    }

    .toolbar-left,

    .toolbar-center,

    .toolbar-right{

        width:100%;

        justify-content:center;

    }

    .preview-playback{

        flex-wrap:wrap;

        height:auto;

        padding:10px;

        gap:10px;

    }

    .playback-left,

    .playback-center,

    .playback-right{

        width:100%;

        justify-content:center;

    }

}

@media (max-width:600px){

    .preview-toolbar button,

    .preview-playback button{

        width:34px;

        height:34px;

        font-size:12px;

    }

    .toolbar-center,

    .playback-center{

        font-size:12px;

    }

    .zoom-indicator,

    .preview-info{

        font-size:11px;

        padding:5px 8px;

    }

}

/* ====================================================== */
/* ACCESSIBILITY */
/* ====================================================== */

.preview-toolbar button:focus-visible,

.preview-playback button:focus-visible,

.toolbar-right input:focus-visible{

    outline:2px solid #58b4ff;

    outline-offset:2px;

}

/* ====================================================== */
/* USER SELECT */
/* ====================================================== */

.preview-canvas *{

    user-select:none;

    -webkit-user-select:none;

}

/* ====================================================== */
/* SCROLL BEHAVIOR */
/* ====================================================== */

.preview-canvas{

    scroll-behavior:smooth;

}

/* ====================================================== */
/* PERFORMANCE */
/* ====================================================== */

.preview-canvas,
.canvas-wrapper,
.preview-screen,
.selection-box,
.resize-handle,
.rotation-handle{

    will-change:transform;

}

.preview-screen{

    contain:layout paint size;

}

/* ====================================================== */
/* CURSORS */
/* ====================================================== */

.canvas-wrapper{

    cursor:default;

}

.canvas-wrapper.panning{

    cursor:grab;

}

.canvas-wrapper.panning:active{

    cursor:grabbing;

}

/* ====================================================== */
/* PRINT */
/* ====================================================== */

@media print{

    .preview-toolbar,

    .preview-playback,

    .zoom-indicator,

    .preview-info,

    .letterbox-top,

    .letterbox-bottom{

        display:none !important;

    }

}

/* ====================================================== */
/* REDUCE MOTION */
/* ====================================================== */

@media (prefers-reduced-motion: reduce){

    *{

        animation:none !important;

        transition:none !important;

    }

}

/* ====================================================== */
/* END */
/* ====================================================== */

</style>