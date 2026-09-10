<script setup>

import {

    ref,

    computed,

    watch

} from "vue";

import {

    useVideoStore

} from "../../stores/videoStore";

const videoStore = useVideoStore();

/*
==========================================================
VIEW
==========================================================
*/

const search = ref("");

const selectedCategory = ref("all");

const selectedTransition = ref(null);

const draggingTransition = ref(null);

const previewingTransitionId = ref(null);

const inspectorDuration = ref(1);

const inspectorCurve = ref("Linear");

const inspectorDirection = ref("Center");

/*
==========================================================
STORE STATE
==========================================================
*/

const transitions = computed(() =>

    videoStore.transitionPresets.map(

        transition => ({

            ...transition,

            category:
                transition.id === "fade" ||
                transition.id === "crossfade" ||
                transition.id === "dipblack" ||
                transition.id === "dipwhite"
                    ? "fade"
                    : transition.id === "slide" ||
                      transition.id === "wipe"
                        ? "slide"
                        : transition.id === "zoom"
                            ? "zoom"
                            : transition.id === "blur" ||
                              transition.id === "flash"
                                ? "stylize"
                                : "stylize",

            icon:
                transition.id === "fade"
                    ? "🌫"
                    : transition.id === "crossfade"
                        ? "🔀"
                        : transition.id === "slide"
                            ? "➡️"
                            : transition.id === "zoom"
                                ? "🔍"
                                : transition.id === "blur"
                                    ? "🌁"
                                    : transition.id === "flash"
                                        ? "⚡"
                                        : transition.id === "wipe"
                                            ? "◧"
                                            : transition.id === "dipblack"
                                                ? "⬛"
                                                : "⬜"

        })

    )

);

const tracks = computed(() =>

    videoStore.tracks

);

const selectedTrackId = computed(() =>

    videoStore.selectedTrackId

);

const selectedClipId = computed(() =>

    videoStore.selectedClipId

);

/*
==========================================================
SELECTED CLIP / TARGET
==========================================================
*/

const selectedTrack = computed(() => {

    if (selectedTrackId.value === null) {
        return null;
    }

    return tracks.value.find(

        track =>
            track.id ===
            selectedTrackId.value

    ) || null;

});

const selectedClip = computed(() => {

    if (!selectedTrack.value || selectedClipId.value === null) {
        return null;
    }

    return selectedTrack.value.clips.find(

        clip =>
            clip.id ===
            selectedClipId.value

    ) || null;

});

const transitionTarget = computed(() => {

    if (!selectedTrack.value || !selectedClip.value) {
        return null;
    }

    const clips = [

        ...selectedTrack.value.clips

    ].sort(

        (a,b) =>
            (Number(a.start) || 0) -
            (Number(b.start) || 0)

    );

    const index = clips.findIndex(

        clip =>
            clip.id ===
            selectedClip.value.id

    );

    if (index === -1 || index >= clips.length - 1) {
        return null;
    }

    return {

        fromClip: clips[index],

        toClip: clips[index + 1]

    };

});

const appliedTransition = computed(() => {

    if (!transitionTarget.value) {
        return null;
    }

    return videoStore.getTransitionBetween(

        transitionTarget.value.fromClip.id,

        transitionTarget.value.toClip.id

    );

});

const hasTarget = computed(() =>

    Boolean(transitionTarget.value)

);

/*
==========================================================
CATEGORIES
==========================================================
*/

const categories = [

    {

        id:"all",

        name:"All",

        icon:"🎬"

    },

    {

        id:"fade",

        name:"Fade",

        icon:"🌫"

    },

    {

        id:"slide",

        name:"Slide",

        icon:"➡️"

    },

    {

        id:"zoom",

        name:"Zoom",

        icon:"🔍"

    },

    {

        id:"stylize",

        name:"Stylize",

        icon:"✨"

    },

    {

        id:"favorites",

        name:"Favorites",

        icon:"⭐"

    }

];

/*
==========================================================
FILTER
==========================================================
*/

const filteredTransitions = computed(() => {

    let list = [...transitions.value];

    if (selectedCategory.value !== "all") {

        if (selectedCategory.value === "favorites") {

            list = list.filter(

                transition =>
                    transition.favorite

            );

        } else {

            list = list.filter(

                transition =>
                    transition.category ===
                    selectedCategory.value

            );

        }

    }

    if (search.value.trim()) {

        const q =
            search.value
                .trim()
                .toLowerCase();

        list = list.filter(

            transition =>
                transition.name
                    .toLowerCase()
                    .includes(q)

        );

    }

    return list;

});

/*
==========================================================
SELECT
==========================================================
*/

function selectTransition(transition) {

    selectedTransition.value = transition;

    syncInspector(transition);

}

function syncInspector(transition) {

    const applied = appliedTransition.value;

    inspectorDuration.value = Math.max(

        1,

        Number(applied?.duration) || 1

    );

    inspectorCurve.value =
        applied?.curve ||
        "Linear";

    inspectorDirection.value =
        applied?.direction ||
        "Center";

}

/*
==========================================================
WATCH
==========================================================
*/

watch(

    appliedTransition,

    () => {

        if (selectedTransition.value) {
            syncInspector(
                selectedTransition.value
            );
        }

    }

);

/*
==========================================================
FAVORITE
==========================================================
*/

function toggleFavorite(transition) {

    transition.favorite =
        !transition.favorite;

}

/*
==========================================================
DRAG
==========================================================
*/

function startDrag(transition) {

    draggingTransition.value = transition;

}

function stopDrag() {

    draggingTransition.value = null;

}

/*
==========================================================
PREVIEW
==========================================================
*/

function previewTransition(transition) {

    if (!hasTarget.value) {
        return;
    }

    previewingTransitionId.value =
        transition.id;

    window.clearTimeout(
        previewTransition.timer
    );

    previewTransition.timer =
        window.setTimeout(

            () => {

                previewingTransitionId.value =
                    null;

            },

            900

        );

}

/*
==========================================================
APPLY
==========================================================
*/

function applyTransition(transition) {

    if (!transitionTarget.value) {
        return;
    }

    const fromClipId =
        transitionTarget.value.fromClip.id;

    const toClipId =
        transitionTarget.value.toClip.id;

    const existing =
        videoStore.getTransitionBetween(
            fromClipId,
            toClipId
        );

    if (existing) {

        videoStore.updateTransition(

            existing.id,

            {

                type: transition.id,

                duration:
                    Math.max(
                        1,
                        Number(existing.duration) || 1
                    ),

                enabled:true

            }

        );

        selectedTransition.value = transition;

        syncInspector(transition);

        return;

    }

    const created =
        videoStore.addTransition(

            fromClipId,

            toClipId,

            transition.id,

            1

        );

    if (created) {

        selectedTransition.value = transition;

        syncInspector(transition);

    }

}

/*
==========================================================
REMOVE
==========================================================
*/

function removeTransition() {

    if (!appliedTransition.value) {
        return;
    }

    videoStore.removeTransition(

        appliedTransition.value.id

    );

}

/*
==========================================================
RESET
==========================================================
*/

function resetTransition() {

    if (!appliedTransition.value) {
        return;
    }

    videoStore.updateTransition(

        appliedTransition.value.id,

        {

            duration:1,

            curve:"Linear",

            direction:"Center",

            enabled:true

        }

    );

}

/*
==========================================================
DUPLICATE
==========================================================
*/

function duplicateTransition() {

    if (
        !appliedTransition.value ||
        !selectedTrack.value
    ) {
        return;
    }

    const clips = [

        ...selectedTrack.value.clips

    ].sort(

        (a,b) =>
            (Number(a.start) || 0) -
            (Number(b.start) || 0)

    );

    const currentIndex = clips.findIndex(

        clip =>
            clip.id ===
            transitionTarget.value?.fromClip.id

    );

    const nextFrom =
        clips[currentIndex + 1];

    const nextTo =
        clips[currentIndex + 2];

    if (!nextFrom || !nextTo) {
        return;
    }

    videoStore.addTransition(

        nextFrom.id,

        nextTo.id,

        appliedTransition.value.type,

        Math.max(
            1,
            Number(appliedTransition.value.duration) || 1
        )

    );

}

/*
==========================================================
INSPECTOR UPDATE
==========================================================
*/

function updateInspector(values) {

    if (!appliedTransition.value) {
        return;
    }

    videoStore.updateTransition(

        appliedTransition.value.id,

        values

    );

}

function onDurationChange(event) {

    inspectorDuration.value = Math.max(

        1,

        Number(event.target.value) || 1

    );

    updateInspector({

        duration:inspectorDuration.value

    });

}

function onCurveChange(event) {

    inspectorCurve.value =
        event.target.value;

    updateInspector({

        curve:inspectorCurve.value

    });

}

function onDirectionChange(event) {

    inspectorDirection.value =
        event.target.value;

    updateInspector({

        direction:inspectorDirection.value

    });

}

</script>

<template>

<div class="transition-library">

<!-- ====================================================== -->
<!-- SIDEBAR -->
<!-- ====================================================== -->

<div class="transition-sidebar">

<div class="sidebar-header">

<h3>

Transitions

</h3>

</div>

<div class="category-list">

<div

v-for="category in categories"

:key="category.id"

class="category-item"

:class="{

active:selectedCategory===category.id

}"

@click="selectedCategory=category.id"

>

<span class="category-icon">

{{ category.icon }}

</span>

<span>

{{ category.name }}

</span>

</div>

</div>

</div>

<!-- ====================================================== -->
<!-- CONTENT -->
<!-- ====================================================== -->

<div class="transition-content">

<!-- ====================================================== -->
<!-- TOOLBAR -->
<!-- ====================================================== -->

<div class="transition-toolbar">

<div class="toolbar-left">

<input

type="text"

v-model="search"

placeholder="Search transitions..."

class="search-input"

/>

</div>

<div class="toolbar-right">

<span
    :class="{
        'text-success':hasTarget,
        'text-danger':!hasTarget
    }"
>
    {{
        hasTarget
            ? 'Target ready'
            : 'Select a clip with a following clip'
    }}
</span>

<span>

{{ filteredTransitions.length }}

Transitions

</span>

</div>

</div>

<!-- ====================================================== -->
<!-- TRANSITION GRID -->
<!-- ====================================================== -->

<div class="transition-grid">

<div
    v-if="filteredTransitions.length===0"
    class="empty-library"
>
    <div class="icon">🎞️</div>
    <h3>No transitions found</h3>
    <p>Try another search or category.</p>
</div>

<div

v-for="transition in filteredTransitions"

:key="transition.id"

class="transition-card"

:class="{

selected:

selectedTransition?.id===transition.id

}"

@click="selectTransition(transition)"

@dblclick="applyTransition(transition)"

draggable="true"

@dragstart="startDrag(transition)"

@dragend="stopDrag"

>

<div class="transition-icon">

{{ transition.icon }}

</div>

<div class="transition-name">

{{ transition.name }}

</div>

<div class="transition-category">

{{ transition.category }}

</div>

<!-- ====================================================== -->
<!-- TRANSITION ACTIONS -->
<!-- ====================================================== -->

<div class="transition-actions">

<button

class="preview-btn"

:disabled="!hasTarget"

@click="previewTransition(transition)"

>

👁 Preview

</button>

<button

class="apply-btn"

:disabled="!hasTarget"

@click="applyTransition(transition)"

>

➕ Apply

</button>

<button

class="remove-btn"

:disabled="!appliedTransition"

@click="removeTransition()"

>

➖ Remove

</button>

<button

class="favorite-btn"

@click.stop="toggleFavorite(transition)"

>

{{ transition.favorite ? "⭐" : "☆" }}

</button>

</div>

</div>

</div>

<!-- ====================================================== -->
<!-- INSPECTOR -->
<!-- ====================================================== -->

<div

v-if="selectedTransition"

class="transition-inspector"

>

<div class="inspector-header">

<h3>

{{ selectedTransition.name }}

</h3>

</div>

<div class="inspector-body">

<!-- Duration -->

<div class="field">

<label>

Duration

</label>

<input

type="range"

min="1"

max="120"

:value="inspectorDuration"

@input="onDurationChange"

:disabled="!appliedTransition"

/>

<div class="field-value">

{{ inspectorDuration }}

Frames

</div>

</div>

<!-- Curve -->

<div class="field">

<label>

Curve

</label>

<select

:value="inspectorCurve"

@change="onCurveChange"

:disabled="!appliedTransition"

>

<option>

Linear

</option>

<option>

Ease In

</option>

<option>

Ease Out

</option>

<option>

Ease In Out

</option>

<option>

Bezier

</option>

</select>

</div>

<!-- Direction -->

<div class="field">

<label>

Direction

</label>

<select

:value="inspectorDirection"

@change="onDirectionChange"

:disabled="!appliedTransition"

>

<option>

Left

</option>

<option>

Right

</option>

<option>

Top

</option>

<option>

Bottom

</option>

<option>

Center

</option>

</select>

</div>

<!-- Buttons -->

<div class="transition-buttons">

<button

:disabled="!appliedTransition"

@click="resetTransition()"

>

🔄 Reset

</button>

<button

:disabled="!appliedTransition"

@click="duplicateTransition()"

>

📄 Duplicate

</button>

</div>

</div>

</div>

</div>

</div>

</template>

<style scoped>

/* ====================================================== */
/* MAIN */
/* ====================================================== */

.transition-library{

    width:100%;

    height:100%;

    display:flex;

    overflow:hidden;

    background:#1c1c1c;

    color:#ffffff;

}

/* ====================================================== */
/* SIDEBAR */
/* ====================================================== */

.transition-sidebar{

    width:220px;

    display:flex;

    flex-direction:column;

    background:#242424;

    border-right:1px solid #363636;

}

.sidebar-header{

    padding:18px;

    border-bottom:1px solid #363636;

}

.sidebar-header h3{

    margin:0;

    font-size:18px;

    font-weight:600;

}

/* ====================================================== */
/* CATEGORY */
/* ====================================================== */

.category-list{

    flex:1;

    overflow-y:auto;

    padding:8px;

}

.category-item{

    display:flex;

    align-items:center;

    gap:10px;

    padding:10px 12px;

    border-radius:8px;

    cursor:pointer;

    transition:.2s;

}

.category-item:hover{

    background:#343434;

}

.category-item.active{

    background:#3b82f6;

}

.category-icon{

    width:24px;

    text-align:center;

}

/* ====================================================== */
/* CONTENT */
/* ====================================================== */

.transition-content{

    flex:1;

    display:flex;

    flex-direction:column;

    overflow:hidden;

}

/* ====================================================== */
/* TOOLBAR */
/* ====================================================== */

.transition-toolbar{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:12px;

    background:#282828;

    border-bottom:1px solid #3a3a3a;

}

.toolbar-left,

.toolbar-right{

    display:flex;

    align-items:center;

    gap:10px;

}

.search-input{

    width:260px;

    padding:8px 10px;

    border-radius:6px;

    border:1px solid #444;

    background:#333;

    color:#fff;

    outline:none;

}

.search-input:focus{

    border-color:#3b82f6;

}

/* ====================================================== */
/* GRID */
/* ====================================================== */

.transition-grid{

    flex:1;

    overflow:auto;

    display:grid;

    grid-template-columns:

        repeat(

            auto-fill,

            minmax(180px,1fr)

        );

    gap:16px;

    padding:16px;

}

/* ====================================================== */
/* TRANSITION CARD */
/* ====================================================== */

.transition-card{

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    background:#2b2b2b;

    border:1px solid #3c3c3c;

    border-radius:10px;

    padding:16px;

    cursor:pointer;

    transition:

        transform .18s,

        border-color .18s,

        box-shadow .18s;

}

.transition-card:hover{

    transform:translateY(-4px);

    border-color:#3b82f6;

    box-shadow:

        0 10px 24px

        rgba(0,0,0,.35);

}

.transition-card.selected{

    border-color:#ffd54f;

    box-shadow:

        0 0 0 2px

        rgba(255,213,79,.30);

}

/* ====================================================== */
/* ICON */
/* ====================================================== */

.transition-icon{

    font-size:44px;

    margin-bottom:12px;

    transition:transform .2s;

}

.transition-card:hover .transition-icon{

    transform:scale(1.12);

}

/* ====================================================== */
/* NAME */
/* ====================================================== */

.transition-name{

    width:100%;

    margin-bottom:6px;

    text-align:center;

    font-size:14px;

    font-weight:600;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:ellipsis;

}

/* ====================================================== */
/* CATEGORY */
/* ====================================================== */

.transition-category{

    margin-bottom:12px;

    font-size:12px;

    color:#b5b5b5;

    text-transform:capitalize;

}

/* ====================================================== */
/* ACTIONS */
/* ====================================================== */

.transition-actions{

    display:flex;

    flex-wrap:wrap;

    justify-content:center;

    gap:6px;

    width:100%;

}

.transition-actions button{

    flex:1;

    min-width:60px;

    height:32px;

    border:none;

    border-radius:6px;

    background:#3a3a3a;

    color:#ffffff;

    cursor:pointer;

    font-size:12px;

    transition:

        background .18s,

        transform .15s;

}

.transition-actions button:hover{

    background:#3b82f6;

    transform:translateY(-1px);

}

.transition-actions button:active{

    transform:scale(.96);

}

/* ====================================================== */
/* FAVORITE */
/* ====================================================== */

.favorite-btn{

    max-width:38px;

    font-size:16px;

}

.favorite-btn:hover{

    background:#ffca28 !important;

    color:#222;

}

/* ====================================================== */
/* GRID SCROLLBAR */
/* ====================================================== */

.transition-grid::-webkit-scrollbar{

    width:10px;

}

.transition-grid::-webkit-scrollbar-track{

    background:#202020;

}

.transition-grid::-webkit-scrollbar-thumb{

    background:#5a5a5a;

    border-radius:6px;

}

.transition-grid::-webkit-scrollbar-thumb:hover{

    background:#777;

}

/* ====================================================== */
/* INSPECTOR */
/* ====================================================== */

.transition-inspector{

    width:320px;

    display:flex;

    flex-direction:column;

    background:#242424;

    border-left:1px solid #363636;

}

/* ====================================================== */
/* HEADER */
/* ====================================================== */

.inspector-header{

    padding:18px;

    border-bottom:1px solid #363636;

}

.inspector-header h3{

    margin:0;

    font-size:18px;

    font-weight:600;

}

/* ====================================================== */
/* BODY */
/* ====================================================== */

.inspector-body{

    flex:1;

    overflow:auto;

    padding:18px;

    display:flex;

    flex-direction:column;

    gap:18px;

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

    color:#cfcfcf;

}

.field-value{

    font-size:12px;

    color:#8fc8ff;

    text-align:right;

}

/* ====================================================== */
/* RANGE */
/* ====================================================== */

.field input[type="range"]{

    width:100%;

    accent-color:#3b82f6;

    cursor:pointer;

}

/* ====================================================== */
/* SELECT */
/* ====================================================== */

.field select{

    width:100%;

    padding:8px 10px;

    border-radius:6px;

    border:1px solid #444;

    background:#333;

    color:#ffffff;

    outline:none;

    transition:border-color .18s;

}

.field select:focus{

    border-color:#3b82f6;

}

/* ====================================================== */
/* BUTTONS */
/* ====================================================== */

.transition-buttons{

    display:flex;

    gap:10px;

}

.transition-buttons button{

    flex:1;

    height:38px;

    border:none;

    border-radius:8px;

    background:#3a3a3a;

    color:#ffffff;

    cursor:pointer;

    transition:

        background .18s,

        transform .15s;

}

.transition-buttons button:hover{

    background:#3b82f6;

    transform:translateY(-1px);

}

.transition-buttons button:active{

    transform:scale(.96);

}

/* ====================================================== */
/* SCROLLBAR */
/* ====================================================== */

.inspector-body::-webkit-scrollbar{

    width:10px;

}

.inspector-body::-webkit-scrollbar-track{

    background:#202020;

}

.inspector-body::-webkit-scrollbar-thumb{

    background:#5a5a5a;

    border-radius:6px;

}

.inspector-body::-webkit-scrollbar-thumb:hover{

    background:#777;

}

/* ====================================================== */
/* DRAG STATE */
/* ====================================================== */

.transition-card.dragging{

    opacity:.55;

    transform:scale(.96);

    cursor:grabbing;

}

/* ====================================================== */
/* DROP TARGET */
/* ====================================================== */

.transition-card.drop-target{

    border:2px dashed #3b82f6;

    background:rgba(59,130,246,.10);

    box-shadow:

        0 0 20px

        rgba(59,130,246,.25);

}

/* ====================================================== */
/* FAVORITE */
/* ====================================================== */

.favorite-btn{

    transition:

        transform .18s,

        background .18s,

        color .18s;

}

.favorite-btn:active{

    transform:scale(.88);

}

.favorite-btn.active{

    background:#ffca28;

    color:#222;

}

/* ====================================================== */
/* CARD ANIMATION */
/* ====================================================== */

.transition-card{

    animation:

        transitionFade .18s ease;

}

@keyframes transitionFade{

    from{

        opacity:0;

        transform:

            translateY(8px)

            scale(.96);

    }

    to{

        opacity:1;

        transform:

            translateY(0)

            scale(1);

    }

}

/* ====================================================== */
/* SELECTED */
/* ====================================================== */

.transition-card.selected .transition-name{

    color:#ffd54f;

}

.transition-card.selected .transition-icon{

    transform:scale(1.08);

}

/* ====================================================== */
/* APPLIED */
/* ====================================================== */

.transition-card.applied{

    border-color:#4caf50;

    box-shadow:

        0 0 18px

        rgba(76,175,80,.35);

}

/* ====================================================== */
/* DISABLED */
/* ====================================================== */

.transition-card.disabled{

    opacity:.45;

    filter:grayscale(100%);

    cursor:not-allowed;

}

.transition-card.disabled:hover{

    transform:none;

    box-shadow:none;

    border-color:#3c3c3c;

}

/* ====================================================== */
/* PREVIEW */
/* ====================================================== */

.transition-card.previewing{

    border-color:#00bcd4;

    box-shadow:

        0 0 20px

        rgba(0,188,212,.35);

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

@media (max-width:1200px){

    .transition-sidebar{

        width:190px;

    }

    .transition-inspector{

        width:280px;

    }

}

@media (max-width:900px){

    .transition-library{

        flex-direction:column;

    }

    .transition-sidebar{

        width:100%;

        border-right:none;

        border-bottom:1px solid #363636;

    }

    .category-list{

        display:flex;

        overflow-x:auto;

        overflow-y:hidden;

        gap:6px;

    }

    .category-item{

        flex-shrink:0;

        white-space:nowrap;

    }

    .transition-inspector{

        width:100%;

        border-left:none;

        border-top:1px solid #363636;

    }

}

@media (max-width:650px){

    .transition-grid{

        grid-template-columns:

            repeat(

                auto-fill,

                minmax(150px,1fr)

            );

    }

    .transition-actions{

        flex-direction:column;

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
/* LOADING */
/* ====================================================== */

.loading-overlay{

    position:absolute;

    inset:0;

    display:flex;

    align-items:center;

    justify-content:center;

    background:rgba(20,20,20,.72);

    backdrop-filter:blur(3px);

    z-index:50;

}

.loading-spinner{

    width:42px;

    height:42px;

    border:4px solid rgba(255,255,255,.15);

    border-top-color:#3b82f6;

    border-radius:50%;

    animation:spin .9s linear infinite;

}

@keyframes spin{

    from{

        transform:rotate(0deg);

    }

    to{

        transform:rotate(360deg);

    }

}

/* ====================================================== */
/* EMPTY STATE */
/* ====================================================== */

.empty-library{

    flex:1;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    gap:14px;

    color:#8b8b8b;

    text-align:center;

}

.empty-library .icon{

    font-size:56px;

}

.empty-library h3{

    margin:0;

    font-size:18px;

    color:#ffffff;

}

.empty-library p{

    margin:0;

    max-width:320px;

    line-height:1.5;

}

/* ====================================================== */
/* TOOLTIP */
/* ====================================================== */

[data-tooltip]{

    position:relative;

}

[data-tooltip]:hover::after{

    content:attr(data-tooltip);

    position:absolute;

    left:50%;

    bottom:110%;

    transform:translateX(-50%);

    white-space:nowrap;

    padding:6px 9px;

    border-radius:6px;

    border:1px solid #444;

    background:#111;

    color:#fff;

    font-size:11px;

    pointer-events:none;

    z-index:100;

}

/* ====================================================== */
/* SMOOTH SCROLL */
/* ====================================================== */

.transition-grid,

.category-list,

.inspector-body{

    scroll-behavior:smooth;

}

/* ====================================================== */
/* HOVER TRANSITIONS */
/* ====================================================== */

.transition-card,

.category-item,

.transition-actions button,

.transition-buttons button{

    transition:

        background .18s,

        border-color .18s,

        color .18s,

        transform .18s,

        box-shadow .18s;

}

/* ====================================================== */
/* PERFORMANCE */
/* ====================================================== */

.transition-library,
.transition-sidebar,
.transition-content,
.transition-grid,
.transition-card,
.transition-inspector{

    will-change:transform;

}

.transition-card{

    contain:layout paint style;

}

.transition-icon{

    backface-visibility:hidden;

    transform:translateZ(0);

}

/* ====================================================== */
/* USER SELECT */
/* ====================================================== */

.transition-library *{

    user-select:none;

    -webkit-user-select:none;

}

.search-input{

    user-select:text;

    -webkit-user-select:text;

}

/* ====================================================== */
/* DRAG CURSOR */
/* ====================================================== */

.transition-card{

    cursor:grab;

}

.transition-card:active{

    cursor:grabbing;

}

/* ====================================================== */
/* IMAGE RENDER */
/* ====================================================== */

.transition-icon{

    image-rendering:auto;

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

    .transition-sidebar,

    .transition-toolbar,

    .transition-actions,

    .transition-buttons,

    .loading-overlay{

        display:none !important;

    }

}

/* ====================================================== */
/* GPU OPTIMIZATION */
/* ====================================================== */

.transition-grid{

    transform:translateZ(0);

}

.transition-card,

.transition-actions button,

.transition-buttons button{

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
