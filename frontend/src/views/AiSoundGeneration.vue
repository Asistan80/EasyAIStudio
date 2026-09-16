<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useVideoStore } from "../stores/videoStore";

const router = useRouter();
const videoStore = useVideoStore();

const prompt = ref("");

const durationOptions = [
    { label: "Otomatik", value: null },
    { label: "2 sn", value: 2 },
    { label: "3 sn", value: 3 },
    { label: "5 sn", value: 5 },
    { label: "10 sn", value: 10 }
];

const duration = ref(3);
const promptInfluence = ref(0.5);

const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const generatedSound = ref(null);

async function generateSound() {

    if (!prompt.value.trim()) {
        errorMessage.value = "Lütfen bir prompt girin.";
        return;
    }

    loading.value = true;
    errorMessage.value = "";
    successMessage.value = "";
    generatedSound.value = null;

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/audio/generate-sfx",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
               body: JSON.stringify({
                    prompt: prompt.value,
                    duration: duration.value,
                    prompt_influence: promptInfluence.value
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data?.message ||
                "Ses efekti üretimi başarısız oldu."
            );
        }

        generatedSound.value = data;

        await videoStore.addRemoteAudio(data);

        successMessage.value =
            "Ses efekti üretildi ve Video Studio'ya eklendi.";

    } catch (error) {

        console.error("AI Sound Generation Error:", error);

        errorMessage.value =
            error?.message ||
            "Ses üretimi sırasında bir hata oluştu.";

    } finally {

        loading.value = false;
    }
}

function goToVideoStudio() {
    router.push("/video");
}
</script>

<template>

<div class="page">

    <h1>🔊 AI Sound Effects</h1>

    <p class="subtitle">
        Kuş sesi, kapı sesi, rüzgar sesi gibi ortam seslerini metinden üret.
    </p>

    <div class="layout">

        <div class="panel">

            <div class="group">

                <label>Prompt</label>

                <textarea
                    v-model="prompt"
                    placeholder="Örn: kuş cıvıltısı, kapı gıcırtısı, rüzgar esintisi..."
                />

            </div>

            <div class="group">

                <label>Süre</label>

                <div class="toggle-row">

                    <button
                        v-for="option in durationOptions"
                        :key="option.label"
                        type="button"
                        class="toggle-btn"
                        :class="{ active: duration === option.value }"
                        @click="duration = option.value"
                    >
                        {{ option.label }}
                    </button>

                </div>

            </div>

            <div class="group">

                <label>
                    Prompt Sadakati: {{ promptInfluence }}
                </label>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    v-model.number="promptInfluence"
                />

                <p class="hint">
                    Düşük: daha yaratıcı/rastgele — Yüksek: prompt'a daha sadık
                </p>

            </div>

            <button
                class="generate-btn"
                :disabled="loading"
                @click="generateSound"
            >
                {{ loading ? "Üretiliyor..." : "🚀 Ses Üret" }}
            </button>

            <p
                v-if="errorMessage"
                class="error"
            >
                {{ errorMessage }}
            </p>

            <p
                v-if="successMessage"
                class="success"
            >
                {{ successMessage }}
            </p>

        </div>

        <div class="preview">

            <div
                v-if="loading"
                class="preview-placeholder"
            >
                <div class="spinner"></div>
                <p>Ses üretiliyor...</p>
            </div>

            <div
                v-else-if="generatedSound && generatedSound.output"
                class="preview-result"
            >
                <audio
                    :src="'http://127.0.0.1:8000' + generatedSound.output"
                    controls
                    class="preview-audio"
                />

                <button
                    class="studio-btn"
                    @click="goToVideoStudio"
                >
                    🎬 Video Studio'ya Git
                </button>

            </div>

            <div
                v-else
                class="preview-placeholder"
            >
                <p>Üretilen ses burada görünecek.</p>
            </div>

        </div>

    </div>

</div>

</template>

<style scoped>

.page {
    padding: 30px;
}

h1 {
    margin-bottom: 6px;
}

.subtitle {
    color: #9ca3af;
    margin-bottom: 24px;
}

.layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
}

.panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    background: #151b27;
    border: 1px solid #2d3648;
    border-radius: 14px;
    padding: 24px;
}

.group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

label {
    color: #d5d8e2;
    font-size: 14px;
    font-weight: 600;
}

textarea {
    height: 90px;
    resize: none;
    padding: 12px;
    background: #111827;
    border: 1px solid #374151;
    color: white;
    border-radius: 10px;
    font-family: inherit;
}

.toggle-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.toggle-btn {
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid #374151;
    background: #111827;
    color: #d5d8e2;
    cursor: pointer;
    transition: .2s;
    font-size: 14px;
}

.toggle-btn:hover {
    background: #232d40;
}

.toggle-btn.active {
    background: #356df3;
    border-color: #356df3;
    color: white;
}

.generate-btn {
    margin-top: 6px;
    height: 52px;
    border: none;
    border-radius: 12px;
    background: #2563eb;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: .2s;
}

.generate-btn:hover {
    background: #1d4ed8;
}

.generate-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.error {
    color: #f87171;
    font-size: 14px;
    margin: 0;
}

.success {
    color: #4ade80;
    font-size: 14px;
    margin: 0;
}

.preview {
    background: #151b27;
    border: 1px solid #2d3648;
    border-radius: 14px;
    padding: 24px;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: #9ca3af;
    text-align: center;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #2d3648;
    border-top-color: #356df3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.preview-result {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.preview-audio {
    width: 100%;
}

.studio-btn {
    height: 48px;
    border: none;
    border-radius: 12px;
    background: #16a34a;
    color: white;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: .2s;
}

.studio-btn:hover {
    background: #15803d;
}

</style>