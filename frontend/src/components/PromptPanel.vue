<script setup>
import { ref, watch } from "vue";
import axios from "axios";

const props = defineProps({

    reuseImage: {

        type: Object,

        default: null,

    },

});

const prompt = ref("");
const negativePrompt = ref("");

const provider = ref("ComfyUI");
const model = ref("Flux Dev");

const width = ref(1024);
const height = ref(1024);
const steps = ref(30);
const cfg = ref(7.5);
const seed = ref(-1);

const loading = ref(false);

const emit = defineEmits([
    "image-generated",
]);

watch(

    () => props.reuseImage,

    (image) => {

        if (!image) return;

        prompt.value = image.metadata?.prompt ?? "";
        negativePrompt.value = image.metadata?.negative_prompt ?? "";

        provider.value = image.metadata?.provider ?? "ComfyUI";
        model.value = image.metadata?.model ?? "Flux Dev";

        width.value = image.metadata?.width ?? 1024;
        height.value = image.metadata?.height ?? 1024;

        steps.value = image.metadata?.steps ?? 30;
        cfg.value = image.metadata?.cfg ?? 7.5;
        seed.value = image.metadata?.seed ?? -1;

    },

    {

        immediate: true,

    }

);

async function generateImage() {
    loading.value = true;

    try {
        console.log("POST başladı");
        const response = await axios.post(
            "http://127.0.0.1:8000/api/images/generate",
            {
                provider: provider.value,
                model: model.value,
                prompt: prompt.value,
                negative_prompt: negativePrompt.value,
                width: Number(width.value),
                height: Number(height.value),
                steps: Number(steps.value),
                cfg: Number(cfg.value),
                seed: Number(seed.value)
            }
        );

console.log("POST bitti", response.data);

console.log(response.data);

emit(
    "image-generated",
    response.data
);

await new Promise(resolve => setTimeout(resolve, 500));

window.dispatchEvent(
    new Event("gallery-refresh")
);

window.dispatchEvent(

    new Event(

        "gallery-refresh"

    )

);

alert("Image generated successfully.");

    } catch (error) {

        console.error(error);

        alert("Generation failed.");

    } finally {

        loading.value = false;

    }
}
</script>


<template>

<div class="panel">

    <h2>Image Generation</h2>


    <div class="group">

        <label>Provider</label>

        <select v-model="provider">

            <option>ComfyUI</option>
            <option>Ollama (Text Only)</option>
            <option>OpenAI</option>

        </select>

    </div>


    <div class="group">

        <label>Model</label>

        <select v-model="model">

            <option>Flux Dev</option>
            <option>Stable Diffusion XL</option>
            <option>Stable Diffusion 1.5</option>

        </select>

    </div>


    <div class="group">

        <label>Prompt</label>

        <textarea
            v-model="prompt"
            placeholder="Describe the image you want..."
        />

    </div>


    <div class="group">

        <label>Negative Prompt</label>

        <textarea
            v-model="negativePrompt"
            placeholder="Things you don't want..."
        />

    </div>


    <div class="row">

        <div class="group">

            <label>Width</label>

            <input
                type="number"
                v-model="width"
            >

        </div>


        <div class="group">

            <label>Height</label>

            <input
                type="number"
                v-model="height"
            >

        </div>

    </div>


    <div class="row">

        <div class="group">

            <label>Steps</label>

            <input
                type="number"
                v-model="steps"
            >

        </div>


        <div class="group">

            <label>CFG</label>

            <input
                type="number"
                step="0.5"
                v-model="cfg"
            >

        </div>

    </div>


    <div class="group">

        <label>Seed</label>

        <input
            type="number"
            v-model="seed"
        >

    </div>


    <button
        @click="generateImage"
        :disabled="loading"
    >
        {{ loading ? "Generating..." : "🚀 Generate Image" }}
    </button>


</div>

</template>


<style scoped>

.panel {

    display:flex;
    flex-direction:column;
    gap:18px;
    height:100%;

}

h2 {

    font-size:24px;

}

.group {

    display:flex;
    flex-direction:column;
    gap:8px;

}

.row {

    display:grid;
    grid-template-columns:1fr 1fr;
    gap:16px;

}

textarea {

    height:120px;
    resize:none;
    padding:12px;
    background:#111827;
    border:1px solid #374151;
    color:white;
    border-radius:10px;

}

input,
select {

    height:42px;
    padding:0 12px;
    background:#111827;
    border:1px solid #374151;
    color:white;
    border-radius:10px;

}

button {

    margin-top:auto;
    height:52px;
    border:none;
    border-radius:12px;
    background:#2563eb;
    color:white;
    font-size:16px;
    font-weight:bold;
    cursor:pointer;
    transition:.2s;

}

button:hover {

    background:#1d4ed8;

}

</style>