<script setup>
import { ref } from "vue";

const videoFile = ref(null);
const videoPreviewUrl = ref("");
const uploadedFilename = ref("");
const uploading = ref(false);

const start = ref(0);
const duration = ref(3);
const fps = ref(12);
const width = ref(480);

const generating = ref(false);
const errorMessage = ref("");
const resultGif = ref(null);

async function onFileChange(event) {

    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    videoFile.value = file;
    videoPreviewUrl.value = URL.createObjectURL(file);
    resultGif.value = null;
    errorMessage.value = "";

    uploading.value = true;

    try {

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            "http://127.0.0.1:8000/api/files/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data?.detail || "Video yüklenemedi."
            );
        }

        uploadedFilename.value = data.filename;

    } catch (error) {

        console.error("Auto GIF Upload Error:", error);

        errorMessage.value =
            error?.message ||
            "Video yüklenirken bir hata oluştu.";

    } finally {

        uploading.value = false;
    }
}

async function generateAutoGif() {

    if (!uploadedFilename.value) {
        errorMessage.value = "Önce bir video seç.";
        return;
    }

    generating.value = true;
    errorMessage.value = "";
    resultGif.value = null;

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/gif/auto-generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    filename: uploadedFilename.value,
                    start: Number(start.value),
                    duration: Number(duration.value),
                    fps: Number(fps.value),
                    width: Number(width.value)
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data?.message ||
                "GIF oluşturulamadı."
            );
        }

        resultGif.value = data;

    } catch (error) {

        console.error("Auto GIF Generation Error:", error);

        errorMessage.value =
            error?.message ||
            "GIF üretimi sırasında bir hata oluştu.";

    } finally {

        generating.value = false;
    }
}

async function downloadGif() {

    if (!resultGif.value?.output) {
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000" + resultGif.value.output
        );

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = resultGif.value.filename || "gif.gif";
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);

    } catch (error) {

        console.error("GIF download error:", error);

        errorMessage.value = "GIF indirilemedi.";
    }
}

</script>

<template>

<div class="auto-gif">

    <h3>⚡ Otomatik GIF</h3>

    <p class="subtitle">
        Bir video seç, aralığı belirle, tek tuşla GIF'e çevir.
    </p>

    <div class="row">

        <label class="file-btn">
            🎬 Video Seç
            <input
                type="file"
                accept="video/*"
                @change="onFileChange"
                hidden
            />
        </label>

        <span v-if="uploading" class="hint">Yükleniyor...</span>
        <span v-else-if="uploadedFilename" class="hint success-hint">
            ✅ {{ videoFile?.name }}
        </span>

    </div>

    <video
        v-if="videoPreviewUrl"
        :src="videoPreviewUrl"
        controls
        class="preview-video"
    />

    <div class="row inputs">

        <div class="field">
            <label>Başlangıç (sn)</label>
            <input type="number" min="0" step="0.5" v-model.number="start" />
        </div>

        <div class="field">
            <label>Süre (sn)</label>
            <input type="number" min="0.5" max="30" step="0.5" v-model.number="duration" />
        </div>

        <div class="field">
            <label>FPS</label>
            <input type="number" min="1" max="30" v-model.number="fps" />
        </div>

        <div class="field">
            <label>Genişlik (px)</label>
            <input type="number" min="64" max="1280" step="10" v-model.number="width" />
        </div>

    </div>

    <button
        class="generate-btn"
        :disabled="generating || uploading || !uploadedFilename"
        @click="generateAutoGif"
    >
        {{ generating ? "Oluşturuluyor..." : "⚡ GIF Oluştur" }}
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="resultGif && resultGif.output" class="result">

        <img
            :src="'http://127.0.0.1:8000' + resultGif.output"
            class="result-img"
        />

                <button
            type="button"
            class="download-btn"
            @click="downloadGif"
        >
            ⬇️ İndir
        </button>

    </div>

</div>

</template>

<style scoped>

.auto-gif {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

h3 {
    margin: 0;
}

.subtitle {
    margin: 0;
    color: #9ca3af;
    font-size: 13px;
}

.row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.file-btn {
    background: #2563eb;
    color: white;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
}

.file-btn:hover {
    background: #1d4ed8;
}

.hint {
    font-size: 12px;
    color: #9ca3af;
}

.success-hint {
    color: #4ade80;
}

.preview-video {
    max-width: 100%;
    max-height: 140px;
    border-radius: 8px;
    background: black;
}

.inputs {
    gap: 10px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 80px;
}

.field label {
    font-size: 11px;
    color: #9ca3af;
}

.field input {
    background: #111827;
    border: 1px solid #374151;
    color: white;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 13px;
}

.generate-btn {
    height: 42px;
    border: none;
    border-radius: 10px;
    background: #16a34a;
    color: white;
    font-weight: bold;
    cursor: pointer;
}

.generate-btn:hover {
    background: #15803d;
}

.generate-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.error {
    color: #f87171;
    font-size: 13px;
    margin: 0;
}

.result {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
}

.result-img {
    max-width: 100%;
    border-radius: 8px;
    border: 1px solid #2d3648;
}

.download-btn {
    background: #356df3;
    color: white;
    padding: 8px 14px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
}

.download-btn:hover {
    background: #2554c7;
}

</style>