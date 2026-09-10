<script setup>

import { ref, computed, onMounted } from "vue";
import { useVideoStore } from "../../stores/videoStore";

const videoStore = useVideoStore();

const contextMenu = computed(() => {
    return contextMenu || {
        open: false,
        x: 0,
        y: 0,
        item: null
    };
});

   onMounted(async () => {
    await videoStore.loadBackendMedia();
});

function addToTimeline(item) {

    if (!item) {
        return;
    }

    const mediaType =
        item.type === "audio"
            ? "audio"
            : "video";

    let track = videoStore.tracks.find(
        existingTrack =>
            existingTrack.type === mediaType
    );

    if (!track) {

        track = videoStore.addTrack(
            mediaType
        );

    }

    if (!track) {
        return;
    }

    const clip = videoStore.addClip(
        track.id,
        item.id
    );

    if (clip) {

        videoStore.selectClip(
            track.id,
            clip.id
        );

    }

}

/*
==========================================================
VIEW
==========================================================
*/

const viewMode = ref("grid");

const search = ref("");

const sortBy = ref("name");

const selectedCategory = ref("all");

/*
==========================================================
CATEGORIES
==========================================================
*/

const categories = [

    {

        id:"all",

        name:"All",

        icon:"📁"

    },

    {

        id:"video",

        name:"Video",

        icon:"🎬"

    },

    {

        id:"image",

        name:"Images",

        icon:"🖼"

    },

    {

        id:"audio",

        name:"Audio",

        icon:"🎵"

    },

    {

        id:"gif",

        name:"GIF",

        icon:"🎨"

    },

    {

        id:"subtitle",

        name:"Subtitle",

        icon:"💬"

    },

    {

        id:"favorite",

        name:"Favorites",

        icon:"⭐"

    },

    {

        id:"trash",

        name:"Trash",

        icon:"🗑"

    }

];

/*
==========================================================
MEDIA
==========================================================
*/

function getMediaCategory(item) {

    const mime = String(item?.type || "").toLowerCase();
    const name = String(item?.name || item?.filename || "").toLowerCase();

    if (mime === "image/gif" || name.endsWith(".gif")) {
        return "gif";
    }

    if (mime.startsWith("video/")) {
        return "video";
    }

    if (mime.startsWith("image/")) {
        return "image";
    }

    if (mime.startsWith("audio/")) {
        return "audio";
    }

    if (
        mime.includes("subtitle") ||
        name.endsWith(".srt") ||
        name.endsWith(".vtt") ||
        name.endsWith(".ass")
    ) {
        return "subtitle";
    }

    return mime;
}

const media = computed(() => {

    return videoStore.media;

});

/*
==========================================================
FILTER
==========================================================
*/

const filteredMedia = computed(() => {

    let list = [...media.value];

    /*
    CATEGORY
    */

    if(

        selectedCategory.value !== "all"

    ){

        if(

            selectedCategory.value === "favorite"

        ){

            list = list.filter(

                item => item.favorite

            );

        }

        else if(

            selectedCategory.value === "trash"

        ){

            list = list.filter(

                item => item.deleted

            );

        }

        else{

            list = list.filter(

                item =>

                getMediaCategory(item) ===

                selectedCategory.value

            );

        }

    }

    /*
    SEARCH
    */

    if(

        search.value.trim()

    ){

        const q =

            search.value

            .toLowerCase();

        list = list.filter(

            item =>

            item.name

            .toLowerCase()

            .includes(q)

        );

    }

    /*
    SORT
    */

    switch(sortBy.value){

        case "name":

            list.sort(

                (a,b)=>

                a.name.localeCompare(

                    b.name

                )

            );

        break;

        case "date":

            list.sort(

                (a,b)=>

                b.createdAt -

                a.createdAt

            );

        break;

        case "size":

            list.sort(

                (a,b)=>

                b.size -

                a.size

            );

        break;

        case "duration":

            list.sort(

                (a,b)=>

                b.duration -

                a.duration

            );

        break;

    }

    return list;

});

/*
==========================================================
SELECTION
==========================================================
*/

const selectedMedia = ref([]);

function selectMedia(item, event){

    if(event?.ctrlKey){

        const index = selectedMedia.value.findIndex(

            media => media.id === item.id

        );

        if(index >= 0){

            selectedMedia.value.splice(index,1);

        }else{

            selectedMedia.value.push(item);

        }

    }else{

        selectedMedia.value = [item];

    }

}

/*
==========================================================
DRAG
==========================================================
*/

const draggingMedia = ref(null);

function startDrag(item, event){

    draggingMedia.value = item;

    if (!event?.dataTransfer) return;

    event.dataTransfer.effectAllowed = "copy";

    event.dataTransfer.setData(
        "application/x-easy-ai-media",
        String(item.id)
    );

    event.dataTransfer.setData(
        "text/plain",
        String(item.id)
    );

}

function stopDrag(){

    draggingMedia.value = null;

}

/*
==========================================================
IMPORT
==========================================================
*/

function importFiles(){

    videoStore.openImportDialog();

}

/*
==========================================================
FAVORITES
==========================================================
*/

function toggleFavorite(item){

    item.favorite = !item.favorite;

}

/*
==========================================================
TRASH
==========================================================
*/

function moveToTrash(item){

    item.deleted = true;

}

function restoreMedia(item){

    item.deleted = false;

}

function deleteForever(item){

    videoStore.deleteMedia(item.id);

}

/*
==========================================================
DUPLICATE
==========================================================
*/

function duplicateMedia(item){

    videoStore.duplicateMedia(item.id);

}

/*
==========================================================
RENAME
==========================================================
*/

function renameMedia(item){

    videoStore.renameMedia(item.id);

}

/*
==========================================================
PREVIEW
==========================================================
*/

function previewMedia(item){

    videoStore.previewMedia(item.id);

}

/*
==========================================================
TIMELINE
==========================================================
*/
  
</script>

<template>

<div class="media-library">

<!-- ====================================================== -->
<!-- SIDEBAR -->
<!-- ====================================================== -->

<div class="library-sidebar">

<div class="sidebar-header">

<h3>

Media Library

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

<div class="library-content">

<!-- ====================================================== -->
<!-- TOOLBAR -->
<!-- ====================================================== -->

<div class="library-toolbar">

<div class="toolbar-left">

<button

class="import-btn"

@click="importFiles"

>

📂 Import

</button>

<input

type="text"

v-model="search"

placeholder="Search media..."

class="search-input"

/>

</div>

<div class="toolbar-right">

<select

v-model="sortBy"

>

<option value="name">

Name

</option>

<option value="date">

Date

</option>

<option value="size">

Size

</option>

<option value="duration">

Duration

</option>

</select>

<button

:class="{

active:viewMode==='grid'

}"

@click="viewMode='grid'"

>

🔲

</button>

<button

:class="{

active:viewMode==='list'

}"

@click="viewMode='list'"

>

📋

</button>

</div>

</div>

<!-- ====================================================== -->
<!-- GRID VIEW -->
<!-- ====================================================== -->

<div

v-if="viewMode==='grid'"

class="media-grid"

>

<div

v-for="item in filteredMedia"

:key="item.id"

class="media-card"

:class="{

selected:

selectedMedia.some(

m=>m.id===item.id

)

}"

@click="selectMedia(item,$event)"

@dblclick="previewMedia(item)"

draggable="true"

@dragstart="startDrag(item, $event)"

@dragend="stopDrag"

>

<div class="media-thumb">

<img

v-if="item.thumbnail"

:src="item.thumbnail"

/>

<div

v-else

class="no-thumbnail"

>

{{ item.type==="video" ? "🎬" :

item.type==="image" ? "🖼" :

item.type==="audio" ? "🎵" :

item.type==="gif" ? "🎨" :

"📄" }}

</div>

<div

class="favorite"

@click.stop="toggleFavorite(item)"

>

{{ item.favorite ? "⭐" : "☆" }}

</div>

</div>

<div class="media-info">

<div class="media-name">

{{ item.name }}

</div>

<div class="media-meta">

{{ item.duration }} s

•

{{ item.size }}

</div>

<div class="media-resolution">

{{ item.width }}×{{ item.height }}

</div>

</div>

<div class="media-actions">

    <button
        class="timeline-btn"
        @click.stop="addToTimeline(item)"
    >
        + Timeline
    </button>

</div>

</div>

</div>

<!-- ====================================================== -->
<!-- LIST VIEW -->
<!-- ====================================================== -->

<div

v-else

class="media-list"

>

<div

v-for="item in filteredMedia"

:key="item.id"

class="media-row"

:class="{

selected:

selectedMedia.some(

m=>m.id===item.id

)

}"

@click="selectMedia(item,$event)"

@dblclick="previewMedia(item)"

draggable="true"

@dragstart="startDrag(item)"

@dragend="stopDrag"

>

<div class="media-row-icon">

{{ item.type==="video" ? "🎬" :

item.type==="image" ? "🖼" :

item.type==="audio" ? "🎵" :

item.type==="gif" ? "🎨" :

"📄" }}

</div>

<div class="media-row-name">

{{ item.name }}

</div>

<div class="media-row-duration">

{{ item.duration }} s

</div>

<div class="media-row-size">

{{ item.size }}

</div>

<div class="media-row-resolution">

{{ item.width }}×{{ item.height }}

</div>

<div class="media-row-favorite">

<button

@click.stop="toggleFavorite(item)"

>

{{ item.favorite ? "⭐" : "☆" }}

</button>

</div>

</div>

</div>

<!-- ====================================================== -->
<!-- CONTEXT MENU -->
<!-- ====================================================== -->

<div

v-if="contextMenu.open"

class="context-menu"

:style="{

left:contextMenu.x+'px',

top:contextMenu.y+'px'

}"

>

<div

class="context-item"

@click="previewMedia(contextMenu.item)"

>

👁 Preview

</div>

<div

class="context-item"

@click="addToTimeline(contextMenu.item)"

>

🎬 Add To Timeline

</div>

<div

class="context-item"

@click="duplicateMedia(contextMenu.item)"

>

📄 Duplicate

</div>

<div

class="context-item"

@click="renameMedia(contextMenu.item)"

>

✏ Rename

</div>

<div

class="context-item"

@click="toggleFavorite(contextMenu.item)"

>

⭐ Favorite

</div>

<div

class="context-item"

@click="videoStore.revealMedia(contextMenu.item.id)"

>

📂 Reveal In Folder

</div>

<div

class="context-item"

@click="videoStore.showMediaProperties(contextMenu.item.id)"

>

ℹ Properties

</div>

<div class="context-divider"></div>

<div

class="context-item danger"

@click="moveToTrash(contextMenu.item)"

>

🗑 Move To Trash

</div>

</div>

<!-- ====================================================== -->
<!-- FOOTER -->
<!-- ====================================================== -->

<div class="library-footer">

<div>

Media

<strong>

{{ filteredMedia.length }}

</strong>

</div>

<div>

Selected

<strong>

{{ selectedMedia.length }}

</strong>

</div>

<div>

Timeline

<strong>

{{ videoStore.timelineMediaCount }}

</strong>

</div>

</div>

</div>

</div>

</template>

<style scoped>

/* ====================================================== */
/* MAIN */
/* ====================================================== */

.media-library{

    display:flex;

    width:100%;

    height:100%;

    overflow:hidden;

    background:#1d1d1d;

    color:#ffffff;

}

/* ====================================================== */
/* SIDEBAR */
/* ====================================================== */

.library-sidebar{

    width:150px;

    flex:0 0 150px;

    min-width:0;

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

    background:#1976d2;

}

.category-icon{

    width:24px;

    text-align:center;

}

/* ====================================================== */
/* CONTENT */
/* ====================================================== */

.library-content{

    flex:1;

    display:flex;

    flex-direction:column;

    overflow:hidden;

}

/* ====================================================== */
/* TOOLBAR */
/* ====================================================== */

.library-toolbar{

    display:flex;

    flex-wrap:wrap;

    align-items:center;

    gap:8px;

    padding:8px;

    background:#282828;

    border-bottom:1px solid #3a3a3a;

}

.toolbar-left,
.toolbar-right{

    display:flex;

    align-items:center;

    gap:6px;

    min-width:0;

}

.toolbar-left{
    flex:1 1 auto;
}

.toolbar-right{
    flex:0 0 auto;
}

.import-btn{

    background:#1976d2;

    color:#fff;

    border:none;

    border-radius:6px;

    padding:8px 14px;

    cursor:pointer;

    transition:.2s;

}

.import-btn:hover{

    background:#1565c0;

}

.search-input{

    width:100%;

    min-width:80px;

    max-width:140px;

    padding:7px 8px;

    border-radius:6px;

    border:1px solid #444;

    background:#333;

    color:#fff;

    box-sizing:border-box;

}

.toolbar-right select{

    padding:8px;

    border-radius:6px;

    border:1px solid #444;

    background:#333;

    color:#fff;

}

.toolbar-right button{

    width:36px;

    height:36px;

    border:none;

    border-radius:6px;

    background:#333;

    color:#fff;

    cursor:pointer;

    transition:.2s;

}

.toolbar-right button:hover{

    background:#4b4b4b;

}

.toolbar-right button.active{

    background:#1976d2;

}

/* ====================================================== */
/* GRID */
/* ====================================================== */

.media-grid{

    flex:1;

    min-width:0;

    overflow:auto;

    display:grid;

    grid-template-columns:
        repeat(
            auto-fill,
            minmax(140px,1fr)
        );

    gap:10px;

    padding:10px;

}

/* ====================================================== */
/* CARD */
/* ====================================================== */

.media-card{

    display:flex;

    flex-direction:column;

    background:#2a2a2a;

    border:1px solid #3b3b3b;

    border-radius:10px;

    overflow:hidden;

    cursor:pointer;

    transition:

        transform .18s,

        box-shadow .18s,

        border-color .18s;

}

.media-card:hover{

    transform:translateY(-4px);

    border-color:#5c9dff;

    box-shadow:

        0 10px 22px

        rgba(0,0,0,.35);

}

.media-card.selected{

    border-color:#ffd54f;

    box-shadow:

        0 0 0 2px

        rgba(255,213,79,.35);

}

/* ====================================================== */
/* THUMBNAIL */
/* ====================================================== */

.media-thumb{
    position:relative;
    width:100%;
    aspect-ratio:16 / 9;
    height:auto;
    min-height:0;
    background:#111;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
}

.media-thumb img{
    width:100%;
    height:100%;
    object-fit:contain;
    display:block;
    background:#111;
}

.no-thumbnail{

    font-size:42px;

    opacity:.85;

}

/* ====================================================== */
/* FAVORITE */
/* ====================================================== */

.favorite{

    position:absolute;

    top:8px;

    right:8px;

    width:28px;

    height:28px;

    display:flex;

    align-items:center;

    justify-content:center;

    background:rgba(0,0,0,.45);

    border-radius:50%;

    cursor:pointer;

    transition:.2s;

}

.favorite:hover{

    transform:scale(1.15);

    background:#ffca28;

    color:#222;

}

/* ====================================================== */
/* INFO */
/* ====================================================== */

.media-info{

    padding:10px;

    display:flex;

    flex-direction:column;

    gap:4px;

}

.media-name{

    font-size:14px;

    font-weight:600;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:ellipsis;

}

.media-meta,

.media-resolution{

    font-size:12px;

    color:#b8b8b8;

}

.media-actions{
    display:flex;
    padding:0 10px 10px;
}

.timeline-btn{
    width:100%;
    border:none;
    border-radius:6px;
    padding:7px 10px;
    background:#1976d2;
    color:#ffffff;
    font-size:12px;
    font-weight:600;
    cursor:pointer;
}

.timeline-btn:hover{
    background:#2196f3;
}

.timeline-btn:active{
    transform:scale(.98);
}

/* ====================================================== */
/* GRID SCROLLBAR */
/* ====================================================== */

.media-grid::-webkit-scrollbar{

    width:10px;

}

.media-grid::-webkit-scrollbar-track{

    background:#202020;

}

.media-grid::-webkit-scrollbar-thumb{

    background:#565656;

    border-radius:6px;

}

.media-grid::-webkit-scrollbar-thumb:hover{

    background:#757575;

}

/* ====================================================== */
/* LIST */
/* ====================================================== */

.media-list{

    flex:1;

    overflow:auto;

    display:flex;

    flex-direction:column;

    padding:12px;

    gap:6px;

}

/* ====================================================== */
/* ROW */
/* ====================================================== */

.media-row{

    display:grid;

    grid-template-columns:

        50px

        1.8fr

        110px

        110px

        140px

        60px;

    align-items:center;

    gap:12px;

    padding:10px 14px;

    background:#2b2b2b;

    border:1px solid #3b3b3b;

    border-radius:8px;

    cursor:pointer;

    transition:

        background .18s,

        border-color .18s,

        transform .18s;

}

.media-row:hover{

    background:#353535;

    border-color:#5c9dff;

    transform:translateX(3px);

}

.media-row.selected{

    border-color:#ffd54f;

    box-shadow:

        inset 0 0 0 1px

        rgba(255,213,79,.45);

}

/* ====================================================== */
/* LIST CELLS */
/* ====================================================== */

.media-row-icon{

    display:flex;

    align-items:center;

    justify-content:center;

    font-size:24px;

}

.media-row-name{

    font-size:14px;

    font-weight:600;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:ellipsis;

}

.media-row-duration,

.media-row-size,

.media-row-resolution{

    font-size:13px;

    color:#b8b8b8;

}

.media-row-favorite{

    display:flex;

    justify-content:center;

}

.media-row-favorite button{

    width:34px;

    height:34px;

    border:none;

    border-radius:50%;

    background:#3b3b3b;

    color:#ffffff;

    cursor:pointer;

    transition:.18s;

}

.media-row-favorite button:hover{

    background:#ffca28;

    color:#222;

    transform:scale(1.08);

}

/* ====================================================== */
/* LIST SCROLLBAR */
/* ====================================================== */

.media-list::-webkit-scrollbar{

    width:10px;

}

.media-list::-webkit-scrollbar-track{

    background:#202020;

}

.media-list::-webkit-scrollbar-thumb{

    background:#575757;

    border-radius:6px;

}

.media-list::-webkit-scrollbar-thumb:hover{

    background:#767676;

}

/* ====================================================== */
/* CONTEXT MENU */
/* ====================================================== */

.context-menu{

    position:fixed;

    min-width:220px;

    background:#2b2b2b;

    border:1px solid #444;

    border-radius:10px;

    overflow:hidden;

    box-shadow:

        0 12px 28px

        rgba(0,0,0,.45);

    z-index:9999;

    animation:

        contextFade .15s ease;

}

/* ====================================================== */
/* CONTEXT ITEMS */
/* ====================================================== */

.context-item{

    padding:11px 14px;

    cursor:pointer;

    font-size:14px;

    transition:

        background .18s,

        padding-left .18s;

}

.context-item:hover{

    background:#3b82f6;

    padding-left:18px;

}

.context-item.danger:hover{

    background:#d32f2f;

    color:#ffffff;

}

.context-divider{

    height:1px;

    background:#444;

    margin:4px 0;

}

/* ====================================================== */
/* FOOTER */
/* ====================================================== */

.library-footer{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:10px 16px;

    background:#262626;

    border-top:1px solid #3a3a3a;

    font-size:13px;

    color:#c2c2c2;

}

.library-footer strong{

    color:#ffffff;

}

/* ====================================================== */
/* ANIMATION */
/* ====================================================== */

@keyframes contextFade{

    from{

        opacity:0;

        transform:

            translateY(-6px)

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

        rgba(59,130,246,.25);

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

    .library-sidebar{

        width:190px;

    }

    .search-input{

        width:180px;

    }

}

@media (max-width:900px){

    .media-library{

        flex-direction:column;

    }

    .library-sidebar{

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

        white-space:nowrap;

        flex-shrink:0;

    }

    .library-toolbar{

        flex-direction:column;

        align-items:stretch;

        gap:10px;

    }

    .toolbar-left,

    .toolbar-right{

        width:100%;

        justify-content:space-between;

    }

    .search-input{

        flex:1;

    }

}

@media (max-width:650px){

    .media-grid{

        grid-template-columns:

            repeat(

                auto-fill,

                minmax(140px,1fr)

            );

    }

    .media-row{

        grid-template-columns:

            40px

            1fr;

        row-gap:6px;

    }

    .media-row-duration,

    .media-row-size,

    .media-row-resolution,

    .media-row-favorite{

        display:none;

    }

}

/* ====================================================== */
/* DRAG STATES */
/* ====================================================== */

.media-card.dragging,
.media-row.dragging{

    opacity:.55;

    transform:scale(.97);

    cursor:grabbing;

}

/* ====================================================== */
/* DROP TARGET */
/* ====================================================== */

.drop-target{

    outline:2px dashed #3b82f6;

    outline-offset:-4px;

    background:rgba(59,130,246,.08);

}

/* ====================================================== */
/* FAVORITE ANIMATION */
/* ====================================================== */

.favorite{

    transition:

        transform .18s,

        background .18s,

        color .18s;

}

.favorite:active{

    transform:scale(.90);

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

    background:rgba(20,20,20,.65);

    backdrop-filter:blur(3px);

    z-index:20;

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
/* EMPTY LIBRARY */
/* ====================================================== */

.empty-library{

    flex:1;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    color:#8a8a8a;

    gap:14px;

}

.empty-library .icon{

    font-size:56px;

}

/* ====================================================== */
/* TOOLTIPS */
/* ====================================================== */

[data-tooltip]{

    position:relative;

}

[data-tooltip]:hover::after{

    content:attr(data-tooltip);

    position:absolute;

    bottom:110%;

    left:50%;

    transform:translateX(-50%);

    white-space:nowrap;

    background:#101010;

    color:#fff;

    padding:5px 8px;

    border-radius:5px;

    font-size:11px;

    border:1px solid #444;

    pointer-events:none;

    z-index:100;

}

/* ====================================================== */
/* SMOOTH SCROLL */
/* ====================================================== */

.media-grid,
.media-list,
.category-list{

    scroll-behavior:smooth;

}

/* ====================================================== */
/* PERFORMANCE */
/* ====================================================== */

.media-library,
.library-sidebar,
.library-content,
.media-grid,
.media-list,
.media-card,
.media-row{

    will-change:transform;

}

/* ====================================================== */
/* USER SELECT */
/* ====================================================== */

.media-library *{

    user-select:none;

    -webkit-user-select:none;

}

.search-input{

    user-select:text;

    -webkit-user-select:text;

}

/* ====================================================== */
/* IMAGE RENDER */
/* ====================================================== */

.media-thumb img{

    image-rendering:auto;

    backface-visibility:hidden;

    transform:translateZ(0);

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
/* PRINT */
/* ====================================================== */

@media print{

    .library-sidebar,

    .library-toolbar,

    .library-footer,

    .context-menu{

        display:none !important;

    }

}

/* ====================================================== */
/* END */
/* ====================================================== */

</style>