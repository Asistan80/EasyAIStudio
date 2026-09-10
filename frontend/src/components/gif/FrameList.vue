<script setup>
import { onMounted } from "vue";
import { useGifStore } from "../../stores/gifStore";

const gifStore = useGifStore();

function createFrame() {

    gifStore.addFrame();

}

function selectFrame(frame) {

    gifStore.selectFrame(frame.id);

}

onMounted(() => {

    if (gifStore.frames.length === 0) {

        gifStore.addFrame();

    }

});
</script>

<template>

<div class="frame-list">

    <div class="header">

        <h3>Frames</h3>

        <button
            class="add-btn"
            @click="createFrame"
        >

            +

        </button>

    </div>

    <div class="frames">

        <div

            v-for="frame in gifStore.frames"

            :key="frame.id"

            class="frame"

            :class="{

                active: gifStore.selectedFrameId === frame.id

            }"

            @click="selectFrame(frame)"

        >

            <div class="thumb">

                <img
                    v-if="frame.image"
                    :src="frame.image"
                    class="thumb-image"
                >

                <span v-else>

                    {{ frame.id }}

                </span>

            </div>

            <div class="info">

                <span>{{ frame.name }}</span>

            </div>

        </div>

    </div>

</div>

</template>

<style scoped>

.frame-list{
height:100%;
display:flex;
flex-direction:column;
background:#1b2230;
}

.header{
height:56px;
display:flex;
justify-content:space-between;
align-items:center;
padding:0 12px;
border-bottom:1px solid #2d3648;
}

.header h3{
margin:0;
font-size:18px;
font-weight:600;
color:white;
}

.add-btn{
width:34px;
height:34px;
border:none;
border-radius:8px;
background:#4f8cff;
color:white;
font-size:20px;
cursor:pointer;
transition:.2s;
}

.add-btn:hover{
background:#6ba0ff;
}

.frames{
padding:10px;
display:flex;
flex-direction:column;
gap:10px;
overflow:auto;
}

.frame{
display:flex;
align-items:center;
gap:12px;
padding:10px;
border-radius:10px;
background:#222b3d;
cursor:pointer;
transition:.2s;
border:1px solid transparent;
}

.frame:hover{
background:#293347;
}

.frame.active{
border-color:#4f8cff;
background:#293b63;
}

.thumb{
width:46px;
height:46px;
border-radius:8px;
background:#111827;
display:flex;
justify-content:center;
align-items:center;
overflow:hidden;
flex-shrink:0;
}

.thumb-image{
width:100%;
height:100%;
object-fit:cover;
}

.thumb span{
color:white;
font-weight:700;
}

.info{
display:flex;
flex-direction:column;
}

.info span{
font-size:14px;
font-weight:600;
color:white;
}

</style>