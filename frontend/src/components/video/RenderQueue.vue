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
QUEUE
==========================================================
*/

const queue = computed(

    ()=>videoStore.renderQueue

);

/*
==========================================================
STATE
==========================================================
*/

const running = ref(false);

const paused = ref(false);

const selectedJob = ref(null);

/*
==========================================================
FILTER
==========================================================
*/

const filter = ref("all");

const search = ref("");

/*
==========================================================
SORT
==========================================================
*/

const sortBy = ref("date");

/*
==========================================================
VIEW
==========================================================
*/

const filteredQueue = computed(()=>{

    let list=[...queue.value];

    if(filter.value!=="all"){

        list=list.filter(

            item=>item.status===filter.value

        );

    }

    if(search.value.trim()){

        const q=

            search.value

            .toLowerCase();

        list=list.filter(item=>

            item.filename

            .toLowerCase()

            .includes(q)

        );

    }

    switch(sortBy.value){

        case "name":

            list.sort((a,b)=>

                a.filename.localeCompare(

                    b.filename

                )

            );

            break;

        case "progress":

            list.sort((a,b)=>

                b.progress-a.progress

            );

            break;

        default:

            list.sort((a,b)=>

                b.createdAt-a.createdAt

            );

    }

    return list;

});

/*
==========================================================
QUEUE CONTROL
==========================================================
*/

async function startQueue(){

    if(running.value) return;

    running.value = true;

    paused.value = false;

    await videoStore.startRenderQueue();

}

/*
==========================================================
PAUSE
==========================================================
*/

function pauseQueue(){

    paused.value = !paused.value;

    videoStore.pauseRenderQueue(

        paused.value

    );

}

/*
==========================================================
STOP
==========================================================
*/

function stopQueue(){

    running.value = false;

    paused.value = false;

    videoStore.stopRenderQueue();

}

/*
==========================================================
RETRY
==========================================================
*/

function retryJob(job){

    videoStore.retryRenderJob(

        job.id

    );

}

/*
==========================================================
REMOVE
==========================================================
*/

function removeJob(job){

    videoStore.removeRenderJob(

        job.id

    );

}

/*
==========================================================
CLEAR
==========================================================
*/

function clearQueue(){

    videoStore.clearRenderQueue();

}

/*
==========================================================
OPEN FILE
==========================================================
*/

function openOutput(job){

    videoStore.openOutputFile(

        job.id

    );

}

/*
==========================================================
SELECT
==========================================================
*/

function selectJob(job){

    selectedJob.value = job;

}

<template>

<div class="render-queue">

    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <div class="queue-header">

        <h2>🎬 Render Queue</h2>

    </div>

    <!-- ====================================================== -->
    <!-- TOOLBAR -->
    <!-- ====================================================== -->

    <div class="queue-toolbar">

        <input

            v-model="search"

            type="text"

            class="search-input"

            placeholder="Search render jobs..."

        />

        <select

            v-model="filter"

        >

            <option value="all">

                All

            </option>

            <option value="waiting">

                Waiting

            </option>

            <option value="rendering">

                Rendering

            </option>

            <option value="completed">

                Completed

            </option>

            <option value="failed">

                Failed

            </option>

        </select>

        <select

            v-model="sortBy"

        >

            <option value="date">

                Date

            </option>

            <option value="name">

                Name

            </option>

            <option value="progress">

                Progress

            </option>

        </select>

    </div>

    <!-- ====================================================== -->
    <!-- QUEUE LIST -->
    <!-- ====================================================== -->

    <div class="queue-list">

        <div

            v-for="job in filteredQueue"

            :key="job.id"

            class="queue-item"

            :class="job.status"

            @click="selectJob(job)"

        >

            <div class="job-left">

                <div class="job-icon">

                    🎬

                </div>

                <div class="job-info">

                    <div class="job-name">

                        {{ job.filename }}

                    </div>

                    <div class="job-status">

                        {{ job.status }}

                    </div>

                </div>

            </div>

            <div class="job-right">

                {{ job.progress }}%

            </div>

        </div>

    </div>

        <!-- ====================================================== -->
        <!-- JOB PROGRESS -->
        <!-- ====================================================== -->

        <div
            v-if="selectedJob"
            class="job-details"
        >

            <div class="details-title">

                {{ selectedJob.filename }}

            </div>

            <div class="progress-section">

                <div class="progress-header">

                    <span>Status</span>

                    <span>{{ selectedJob.progress }}%</span>

                </div>

                <div class="progress-bar">

                    <div

                        class="progress-fill"

                        :style="{

                            width:selectedJob.progress+'%'

                        }"

                    ></div>

                </div>

            </div>

            <!-- ====================================================== -->
            <!-- ACTIONS -->
            <!-- ====================================================== -->

            <div class="job-actions">

                <button
                    class="retry-btn"
                    @click="retryJob(selectedJob)"
                >

                    🔄 Retry

                </button>

                <button
                    class="open-btn"
                    @click="openOutput(selectedJob)"
                >

                    📂 Open

                </button>

                <button
                    class="remove-btn"
                    @click="removeJob(selectedJob)"
                >

                    🗑 Remove

                </button>

            </div>

        </div>

    </div>

    <!-- ====================================================== -->
    <!-- FOOTER -->
    <!-- ====================================================== -->

    <div class="queue-footer">

        <button
            class="start-btn"
            @click="startQueue"
        >

            ▶ Start

        </button>

        <button
            class="pause-btn"
            @click="pauseQueue"
        >

            ⏸ Pause

        </button>

        <button
            class="stop-btn"
            @click="stopQueue"
        >

            ⏹ Stop

        </button>

        <button
            class="clear-btn"
            @click="clearQueue"
        >

            🧹 Clear

        </button>

    </div>

</div>

</template>

<style scoped>

/* ====================================================== */
/* MAIN */
/* ====================================================== */

.render-queue{

    width:100%;

    height:100%;

    display:flex;

    flex-direction:column;

    overflow:hidden;

    background:#1d1d1d;

    color:#ffffff;

}

/* ====================================================== */
/* HEADER */
/* ====================================================== */

.queue-header{

    padding:18px 22px;

    border-bottom:1px solid #363636;

    background:#262626;

}

.queue-header h2{

    margin:0;

    font-size:22px;

    font-weight:600;

}

/* ====================================================== */
/* TOOLBAR */
/* ====================================================== */

.queue-toolbar{

    display:flex;

    gap:12px;

    padding:18px 22px;

    border-bottom:1px solid #333;

    background:#222;

}

.queue-toolbar input,

.queue-toolbar select{

    height:40px;

    padding:0 12px;

    border:1px solid #444;

    border-radius:8px;

    background:#313131;

    color:#ffffff;

    outline:none;

    transition:

        border-color .18s,

        box-shadow .18s;

}

.queue-toolbar input{

    flex:1;

}

.queue-toolbar input:focus,

.queue-toolbar select:focus{

    border-color:#3b82f6;

    box-shadow:

        0 0 0 2px

        rgba(59,130,246,.22);

}

/* ====================================================== */
/* QUEUE LIST */
/* ====================================================== */

.queue-list{

    flex:1;

    overflow:auto;

    display:flex;

    flex-direction:column;

    gap:10px;

    padding:20px;

}

/* ====================================================== */
/* QUEUE ITEM */
/* ====================================================== */

.queue-item{

    display:flex;

    align-items:center;

    justify-content:space-between;

    padding:14px 16px;

    border:1px solid #3b3b3b;

    border-radius:10px;

    background:#2b2b2b;

    cursor:pointer;

    transition:
        transform .18s,
        border-color .18s,
        box-shadow .18s,
        background .18s;

}

.queue-item:hover{

    transform:translateY(-2px);

    border-color:#3b82f6;

    box-shadow:
        0 10px 22px
        rgba(0,0,0,.28);

}

.queue-item.selected{

    border-color:#ffd54f;

    box-shadow:
        0 0 0 2px
        rgba(255,213,79,.28);

}

/* ====================================================== */
/* LEFT SIDE */
/* ====================================================== */

.job-left{

    display:flex;

    align-items:center;

    gap:14px;

}

.job-icon{

    width:46px;

    height:46px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:10px;

    background:#363636;

    font-size:22px;

}

.job-info{

    display:flex;

    flex-direction:column;

    gap:4px;

}

.job-name{

    font-size:14px;

    font-weight:600;

    color:#ffffff;

}

.job-status{

    font-size:12px;

    color:#a9a9a9;

    text-transform:capitalize;

}

/* ====================================================== */
/* RIGHT SIDE */
/* ====================================================== */

.job-right{

    min-width:70px;

    text-align:right;

    font-size:13px;

    font-weight:600;

    color:#7fc6ff;

}

/* ====================================================== */
/* STATUS COLORS */
/* ====================================================== */

.queue-item.waiting{

    border-left:4px solid #9e9e9e;

}

.queue-item.rendering{

    border-left:4px solid #3b82f6;

}

.queue-item.completed{

    border-left:4px solid #4caf50;

}

.queue-item.failed{

    border-left:4px solid #ef5350;

}

/* ====================================================== */
/* JOB DETAILS */
/* ====================================================== */

.job-details{

    margin:18px 20px 0;

    padding:18px;

    border:1px solid #3b3b3b;

    border-radius:10px;

    background:#262626;

}

.details-title{

    margin-bottom:16px;

    font-size:16px;

    font-weight:600;

    color:#ffffff;

    word-break:break-word;

}

/* ====================================================== */
/* PROGRESS */
/* ====================================================== */

.progress-section{

    display:flex;

    flex-direction:column;

    gap:10px;

}

.progress-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    font-size:13px;

    color:#d0d0d0;

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
/* JOB ACTIONS */
/* ====================================================== */

.job-actions{

    display:flex;

    gap:10px;

    margin-top:18px;

}

.job-actions button{

    flex:1;

    height:40px;

    border:none;

    border-radius:8px;

    color:#ffffff;

    cursor:pointer;

    font-size:13px;

    font-weight:600;

    transition:

        background .18s,

        transform .15s;

}

.retry-btn{

    background:#3b82f6;

}

.retry-btn:hover{

    background:#2f74db;

}

.open-btn{

    background:#16a34a;

}

.open-btn:hover{

    background:#15803d;

}

.remove-btn{

    background:#dc2626;

}

.remove-btn:hover{

    background:#b91c1c;

}

.job-actions button:active{

    transform:scale(.97);

}

/* ====================================================== */
/* FOOTER */
/* ====================================================== */

.queue-footer{

    display:flex;

    gap:12px;

    padding:18px 22px;

    border-top:1px solid #363636;

    background:#242424;

}

.queue-footer button{

    flex:1;

    height:44px;

    border:none;

    border-radius:8px;

    color:#ffffff;

    cursor:pointer;

    font-size:14px;

    font-weight:600;

    transition:

        background .18s,

        transform .15s;

}

.start-btn{

    background:#16a34a;

}

.start-btn:hover{

    background:#15803d;

}

.pause-btn{

    background:#f59e0b;

}

.pause-btn:hover{

    background:#d97706;

}

.stop-btn{

    background:#dc2626;

}

.stop-btn:hover{

    background:#b91c1c;

}

.clear-btn{

    background:#4b5563;

}

.clear-btn:hover{

    background:#374151;

}

.queue-footer button:active{

    transform:scale(.97);

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

    background:rgba(20,20,20,.72);

    backdrop-filter:blur(3px);

    z-index:100;

}

.loading-spinner{

    width:48px;

    height:48px;

    border:4px solid rgba(255,255,255,.15);

    border-top-color:#3b82f6;

    border-radius:50%;

    animation:queueSpin .9s linear infinite;

}

@keyframes queueSpin{

    from{

        transform:rotate(0deg);

    }

    to{

        transform:rotate(360deg);

    }

}

/* ====================================================== */
/* STATUS BOX */
/* ====================================================== */

.status-box{

    margin:18px 20px;

    padding:14px 16px;

    border-radius:8px;

    border:1px solid transparent;

    font-size:13px;

    font-weight:500;

    text-align:center;

}

.status-box.success{

    color:#4caf50;

    background:rgba(76,175,80,.12);

    border-color:rgba(76,175,80,.28);

}

.status-box.error{

    color:#ef5350;

    background:rgba(239,83,80,.12);

    border-color:rgba(239,83,80,.28);

}

.status-box.warning{

    color:#ffca28;

    background:rgba(255,202,40,.12);

    border-color:rgba(255,202,40,.28);

}

.status-box.info{

    color:#58b4ff;

    background:rgba(88,180,255,.12);

    border-color:rgba(88,180,255,.28);

}

/* ====================================================== */
/* RESPONSIVE */
/* ====================================================== */

@media (max-width:900px){

    .queue-toolbar{

        flex-direction:column;

    }

    .queue-toolbar input,

    .queue-toolbar select{

        width:100%;

    }

    .job-actions{

        flex-direction:column;

    }

    .queue-footer{

        flex-direction:column;

    }

}

@media (max-width:600px){

    .queue-header{

        padding:16px;

    }

    .queue-header h2{

        font-size:18px;

    }

    .queue-list{

        padding:14px;

    }

    .queue-item{

        flex-direction:column;

        align-items:flex-start;

        gap:12px;

    }

    .job-right{

        width:100%;

        text-align:left;

    }

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
/* HOVER */
/* ====================================================== */

.queue-item{

    transition:
        transform .18s,
        border-color .18s,
        box-shadow .18s,
        background .18s;

}

.queue-item:hover{

    background:#303030;

}

.job-actions button:hover,
.queue-footer button:hover{

    box-shadow:
        0 6px 16px
        rgba(0,0,0,.25);

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
/* PERFORMANCE */
/* ====================================================== */

.render-queue,
.queue-list,
.queue-item,
.job-details,
.progress-bar,
.progress-fill{

    transform:translateZ(0);

    backface-visibility:hidden;

}

.queue-item{

    contain:layout paint style;

}

.queue-footer button,
.job-actions button{

    will-change:
        transform,
        background,
        box-shadow;

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

            rgba(255,255,255,.22),

            transparent

        );

    animation:queueProgressShine 1.8s linear infinite;

}

@keyframes queueProgressShine{

    from{

        transform:translateX(-100%);

    }

    to{

        transform:translateX(100%);

    }

}

/* ====================================================== */
/* SMOOTH SCROLL */
/* ====================================================== */

.queue-list{

    scroll-behavior:smooth;

}

.queue-list::-webkit-scrollbar{

    width:10px;

}

.queue-list::-webkit-scrollbar-track{

    background:#202020;

}

.queue-list::-webkit-scrollbar-thumb{

    background:#5c5c5c;

    border-radius:6px;

}

.queue-list::-webkit-scrollbar-thumb:hover{

    background:#7b7b7b;

}

/* ====================================================== */
/* DETAILS ANIMATION */
/* ====================================================== */

.job-details{

    animation:detailsFade .18s ease;

}

@keyframes detailsFade{

    from{

        opacity:0;

        transform:
            translateY(6px);

    }

    to{

        opacity:1;

        transform:
            translateY(0);

    }

}

/* ====================================================== */
/* STATUS ANIMATION */
/* ====================================================== */

.status-box{

    animation:statusAppear .2s ease;

}

@keyframes statusAppear{

    from{

        opacity:0;

        transform:translateY(-4px);

    }

    to{

        opacity:1;

        transform:translateY(0);

    }

}

/* ====================================================== */
/* USER SELECT */
/* ====================================================== */

.render-queue *{

    user-select:none;

    -webkit-user-select:none;

}

.queue-toolbar input{

    user-select:text;

    -webkit-user-select:text;

}

/* ====================================================== */
/* GPU LAYER */
/* ====================================================== */

.queue-item,
.job-details,
.progress-fill,
.queue-footer button,
.job-actions button{

    transform:translateZ(0);

    backface-visibility:hidden;

}

/* ====================================================== */
/* IMAGE RENDER */
/* ====================================================== */

.job-icon{

    image-rendering:auto;

}

/* ====================================================== */
/* REDUCED MOTION */
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

    .queue-toolbar,
    .queue-footer,
    .job-actions,
    .loading-overlay{

        display:none !important;

    }

}

/* ====================================================== */
/* EMPTY QUEUE */
/* ====================================================== */

.queue-empty{

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    gap:14px;

    flex:1;

    color:#9d9d9d;

    text-align:center;

}

.queue-empty .icon{

    font-size:56px;

}

.queue-empty h3{

    margin:0;

    color:#ffffff;

    font-size:18px;

}

.queue-empty p{

    margin:0;

    max-width:340px;

    line-height:1.5;

}

/* ====================================================== */
/* GPU OPTIMIZATION */
/* ====================================================== */

.queue-list{

    transform:translateZ(0);

}

.queue-item,
.job-details,
.queue-footer button,
.job-actions button{

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
/* TEXT HELPERS */
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