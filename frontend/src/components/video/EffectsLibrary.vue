```vue
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
VIEW
==========================================================
*/

const search = ref("");
const selectedCategory = ref("all");
const selectedEffect = ref(null);
const draggingEffect = ref(null);
const previewingEffectId = ref(null);
const appliedEffectIds = ref([]);

/*
==========================================================
CATEGORIES
==========================================================
*/

const categories = [

    {
        id: "all",
        name: "All",
        icon: "🎨"
    },

    {
        id: "color",
        name: "Color",
        icon: "🌈"
    },

    {
        id: "blur",
        name: "Blur",
        icon: "🌫"
    },

    {
        id: "distort",
        name: "Distortion",
        icon: "🌊"
    },

    {
        id: "stylize",
        name: "Stylize",
        icon: "✨"
    },

    {
        id: "light",
        name: "Lighting",
        icon: "💡"
    },

    {
        id: "favorites",
        name: "Favorites",
        icon: "⭐"
    }

];

/*
==========================================================
EFFECT LIBRARY
==========================================================
*/

const effectsLibrary = computed(() => {

    const presets =
        videoStore.effectPresets || [];

    return presets.map((preset, index) => {

        let category = "stylize";
        let icon = "✨";

        switch (preset.id) {

            case "brightness":
                category = "light";
                icon = "☀️";
                break;

            case "contrast":
                category = "color";
                icon = "◐";
                break;

            case "saturation":
                category = "color";
                icon = "🌈";
                break;

            case "blur":
                category = "blur";
                icon = "🌫";
                break;

            case "opacity":
                category = "light";
                icon = "👻";
                break;

            case "rotation":
                category = "distort";
                icon = "🔄";
                break;

            case "scale":
                category = "distort";
                icon = "🔍";
                break;

            case "crop":
                category = "stylize";
                icon = "✂️";
                break;

            case "flipH":
                category = "distort";
                icon = "↔️";
                break;

            case "flipV":
                category = "distort";
                icon = "↕️";
                break;
        }

        return {
            id: preset.id,
            name: preset.name,
            category,
            icon,
            favorite: false,
            intensity: 100,
            opacity: 100,
            blendMode: "Normal",
            order: index
        };

    });

});

/*
==========================================================
FILTER
==========================================================
*/

const filteredEffects = computed(() => {

    let list =
        effectsLibrary.value.map(effect => ({
            ...effect
        }));

    if (
        selectedCategory.value !== "all"
    ) {

        if (
            selectedCategory.value === "favorites"
        ) {

            list =
                list.filter(
                    effect =>
                        effect.favorite
                );

        } else {

            list =
                list.filter(
                    effect =>
                        effect.category ===
                        selectedCategory.value
                );

        }
    }

    const query =
        search.value
            .trim()
            .toLowerCase();

    if (query) {

        list =
            list.filter(effect =>
                effect.name
                    .toLowerCase()
                    .includes(query)
            );
    }

    return list;
});

/*
==========================================================
SELECT
==========================================================
*/

function selectEffect(effect) {

    selectedEffect.value = {
        ...effect
    };

}

/*
==========================================================
FAVORITE
==========================================================
*/

const favoriteEffects = ref(
    new Set()
);

function isFavorite(effect) {

    return favoriteEffects.value.has(
        effect.id
    );

}

function toggleFavorite(effect) {

    const favorites =
        new Set(
            favoriteEffects.value
        );

    if (
        favorites.has(effect.id)
    ) {

        favorites.delete(
            effect.id
        );

    } else {

        favorites.add(
            effect.id
        );

    }

    favoriteEffects.value =
        favorites;

    if (
        selectedEffect.value?.id ===
        effect.id
    ) {

        selectedEffect.value = {
            ...selectedEffect.value,
            favorite:
                favorites.has(effect.id)
        };

    }

}

/*
==========================================================
DRAG
==========================================================
*/

function startDrag(effect) {

    draggingEffect.value =
        effect;

}

function stopDrag() {

    draggingEffect.value =
        null;

}

/*
==========================================================
PREVIEW
==========================================================
*/

function previewEffect(effect) {

    if (!effect) {
        return;
    }

    previewingEffectId.value =
        effect.id;

    window.setTimeout(() => {

        if (
            previewingEffectId.value ===
            effect.id
        ) {

            previewingEffectId.value =
                null;

        }

    }, 1200);

}

/*
==========================================================
BUILD SETTINGS
==========================================================
*/

function buildEffectSettings(effect) {

    return {

        intensity:
            Number(effect.intensity ?? 100),

        opacity:
            Number(effect.opacity ?? 100),

        blendMode:
            effect.blendMode ||
            "Normal"

    };

}

/*
==========================================================
APPLY
==========================================================
*/

function applyEffect(effect) {

    if (!effect) {
        return;
    }

    const clip =
        videoStore.selectedClip;

    if (!clip) {
        return;
    }

    const created =
        videoStore.addEffect(
            clip.id,
            effect.id,
            buildEffectSettings(effect)
        );

    if (!created) {
        return;
    }

    const applied =
        new Set(
            appliedEffectIds.value
        );

    applied.add(
        effect.id
    );

    appliedEffectIds.value =
        Array.from(applied);

    selectedEffect.value = {
        ...effect
    };

}

/*
==========================================================
REMOVE
==========================================================
*/

function removeEffect(effect) {

    if (!effect) {
        return;
    }

    const clip =
        videoStore.selectedClip;

    if (!clip) {
        return;
    }

    const clipEffects =
        videoStore.getEffectsForClip(
            clip.id
        );

    const matchingEffects =
        clipEffects.filter(
            item =>
                item.type === effect.id
        );

    if (
        matchingEffects.length === 0
    ) {
        return;
    }

    const last =
        matchingEffects[
            matchingEffects.length - 1
        ];

    videoStore.removeEffect(
        last.id
    );

    const remaining =
        videoStore
            .getEffectsForClip(clip.id)
            .some(
                item =>
                    item.type === effect.id
            );

    if (!remaining) {

        appliedEffectIds.value =
            appliedEffectIds.value.filter(
                id =>
                    id !== effect.id
            );

    }

}

/*
==========================================================
RESET
==========================================================
*/

function resetEffect(effect) {

    if (!effect) {
        return;
    }

    effect.intensity = 100;
    effect.opacity = 100;
    effect.blendMode = "Normal";

    const clip =
        videoStore.selectedClip;

    if (!clip) {
        return;
    }

    const clipEffects =
        videoStore.getEffectsForClip(
            clip.id
        );

    const matching =
        clipEffects.filter(
            item =>
                item.type === effect.id
        );

    matching.forEach(item => {

        videoStore.updateEffect(
            item.id,
            {
                intensity: 100,
                opacity: 100,
                blendMode: "Normal"
            }
        );

    });

}

/*
==========================================================
DUPLICATE
==========================================================
*/

function duplicateEffect(effect) {

    if (!effect) {
        return;
    }

    const clip =
        videoStore.selectedClip;

    if (!clip) {
        return;
    }

    const clipEffects =
        videoStore.getEffectsForClip(
            clip.id
        );

    const source =
        clipEffects
            .filter(
                item =>
                    item.type === effect.id
            )
            .at(-1);

    if (!source) {

        applyEffect(effect);

        return;
    }

    videoStore.addEffect(
        clip.id,
        source.type,
        {
            ...source.settings
        }
    );

}

/*
==========================================================
APPLIED STATE
==========================================================
*/

function isApplied(effect) {

    const clip =
        videoStore.selectedClip;

    if (!clip) {
        return false;
    }

    return videoStore
        .getEffectsForClip(clip.id)
        .some(
            item =>
                item.type === effect.id
        );

}

/*
==========================================================
CURRENT CLIP
==========================================================
*/

const hasSelectedClip = computed(() => {

    return Boolean(
        videoStore.selectedClip
    );

});

</script>

<template>

<div class="effects-library">

<!-- ====================================================== -->
<!-- SIDEBAR -->
<!-- ====================================================== -->

<div class="effects-sidebar">

    <div class="sidebar-header">

        <h3>
            Effects
        </h3>

        <span class="sidebar-subtitle">
            Video Effects
        </span>

    </div>

    <div class="category-list">

        <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{
                active:
                    selectedCategory === category.id
            }"
            @click="
                selectedCategory =
                    category.id
            "
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

<div class="effects-content">

    <!-- ================================================== -->
    <!-- TOOLBAR -->
    <!-- ================================================== -->

    <div class="effects-toolbar">

        <div class="toolbar-left">

            <input
                v-model="search"
                type="text"
                placeholder="Search effects..."
                class="search-input"
            />

        </div>

        <div class="toolbar-right">

            <span class="effect-count">
                {{ filteredEffects.length }}
                Effects
            </span>

            <span
                v-if="!hasSelectedClip"
                class="clip-warning"
            >
                Select a clip to apply an effect
            </span>

        </div>

    </div>

    <!-- ================================================== -->
    <!-- EMPTY -->
    <!-- ================================================== -->

    <div
        v-if="filteredEffects.length === 0"
        class="empty-library"
    >

        <div class="icon">
            🔍
        </div>

        <h3>
            No Effects Found
        </h3>

        <p>
            Try another search or category.
        </p>

    </div>

    <!-- ================================================== -->
    <!-- GRID -->
    <!-- ================================================== -->

    <div
        v-else
        class="effects-grid"
    >

        <div
            v-for="effect in filteredEffects"
            :key="effect.id"
            class="effect-card"
            :class="{
                selected:
                    selectedEffect?.id === effect.id,

                applied:
                    isApplied(effect),

                dragging:
                    draggingEffect?.id === effect.id,

                previewing:
                    previewingEffectId === effect.id
            }"
            draggable="true"
            @click="selectEffect(effect)"
            @dragstart="startDrag(effect)"
            @dragend="stopDrag"
        >

            <!-- ========================================== -->
            <!-- ICON -->
            <!-- ========================================== -->

            <div class="effect-icon">
                {{ effect.icon }}
            </div>

            <!-- ========================================== -->
            <!-- NAME -->
            <!-- ========================================== -->

            <div class="effect-name">
                {{ effect.name }}
            </div>

            <!-- ========================================== -->
            <!-- CATEGORY -->
            <!-- ========================================== -->

            <div class="effect-category">
                {{ effect.category }}
            </div>

            <!-- ========================================== -->
            <!-- STATUS -->
            <!-- ========================================== -->

            <div
                v-if="isApplied(effect)"
                class="applied-badge"
            >
                Applied
            </div>

            <!-- ========================================== -->
            <!-- ACTIONS -->
            <!-- ========================================== -->

            <div class="effect-actions">

                <button
                    class="preview-btn"
                    title="Preview"
                    @click.stop="
                        previewEffect(effect)
                    "
                >
                    👁
                    <span>
                        Preview
                    </span>
                </button>

                <button
                    class="apply-btn"
                    :disabled="
                        !hasSelectedClip
                    "
                    title="Apply effect"
                    @click.stop="
                        applyEffect(effect)
                    "
                >
                    ➕
                    <span>
                        Apply
                    </span>
                </button>

                <button
                    class="remove-btn"
                    :disabled="
                        !isApplied(effect)
                    "
                    title="Remove effect"
                    @click.stop="
                        removeEffect(effect)
                    "
                >
                    ➖
                    <span>
                        Remove
                    </span>
                </button>

                <button
                    class="favorite-btn"
                    :class="{
                        active:
                            isFavorite(effect)
                    }"
                    title="Favorite"
                    @click.stop="
                        toggleFavorite(effect)
                    "
                >
                    {{
                        isFavorite(effect)
                            ? "⭐"
                            : "☆"
                    }}
                </button>

            </div>

        </div>

    </div>

</div>

<!-- ====================================================== -->
<!-- INSPECTOR -->
<!-- ====================================================== -->

<div
    v-if="selectedEffect"
    class="effect-inspector"
>

    <div class="inspector-header">

        <div class="inspector-title">

            <span class="inspector-icon">
                {{ selectedEffect.icon }}
            </span>

            <div>

                <h3>
                    {{ selectedEffect.name }}
                </h3>

                <span>
                    {{ selectedEffect.category }}
                </span>

            </div>

        </div>

    </div>

    <div class="inspector-body">

        <!-- ============================================== -->
        <!-- INTENSITY -->
        <!-- ============================================== -->

        <div class="field">

            <div class="field-header">

                <label>
                    Intensity
                </label>

                <span>
                    {{ selectedEffect.intensity }}
                </span>

            </div>

            <input
                v-model.number="
                    selectedEffect.intensity
                "
                type="range"
                min="0"
                max="100"
                step="1"
            />

        </div>

        <!-- ============================================== -->
        <!-- OPACITY -->
        <!-- ============================================== -->

        <div class="field">

            <div class="field-header">

                <label>
                    Opacity
                </label>

                <span>
                    {{ selectedEffect.opacity }}
                </span>

            </div>

            <input
                v-model.number="
                    selectedEffect.opacity
                "
                type="range"
                min="0"
                max="100"
                step="1"
            />

        </div>

        <!-- ============================================== -->
        <!-- BLEND MODE -->
        <!-- ============================================== -->

        <div class="field">

            <label>
                Blend Mode
            </label>

            <select
                v-model="
                    selectedEffect.blendMode
                "
            >

                <option value="Normal">
                    Normal
                </option>

                <option value="Multiply">
                    Multiply
                </option>

                <option value="Screen">
                    Screen
                </option>

                <option value="Overlay">
                    Overlay
                </option>

                <option value="Soft Light">
                    Soft Light
                </option>

            </select>

        </div>

        <!-- ============================================== -->
        <!-- CLIP STATUS -->
        <!-- ============================================== -->

        <div
            v-if="!hasSelectedClip"
            class="inspector-warning"
        >
            <span>
                ⚠️
            </span>

            <p>
                Select a clip on the timeline
                before applying this effect.
            </p>

        </div>

        <!-- ============================================== -->
        <!-- BUTTONS -->
        <!-- ============================================== -->

        <div class="effect-buttons">

            <button
                @click="
                    resetEffect(selectedEffect)
                "
            >
                🔄 Reset
            </button>

            <button
                @click="
                    duplicateEffect(
                        selectedEffect
                    )
                "
            >
                📄 Duplicate
            </button>

        </div>

    </div>

</div>

</div>

</template>

<style scoped>

/* ==========================================================
MAIN
========================================================== */

.effects-library {

    width: 100%;
    height: 100%;

    display: flex;

    overflow: hidden;

    background: #1c1c1c;
    color: #ffffff;

}

/* ==========================================================
SIDEBAR
========================================================== */

.effects-sidebar {

    width: 220px;

    display: flex;
    flex-direction: column;

    flex-shrink: 0;

    background: #242424;

    border-right: 1px solid #363636;

}

.sidebar-header {

    padding: 18px;

    border-bottom: 1px solid #363636;

}

.sidebar-header h3 {

    margin: 0;

    font-size: 18px;
    font-weight: 600;

}

.sidebar-subtitle {

    display: block;

    margin-top: 4px;

    color: #888;

    font-size: 11px;

}

/* ==========================================================
CATEGORY
========================================================== */

.category-list {

    flex: 1;

    overflow-y: auto;

    padding: 8px;

}

.category-item {

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 10px 12px;

    margin-bottom: 3px;

    border-radius: 8px;

    cursor: pointer;

    transition: .18s;

}

.category-item:hover {

    background: #343434;

}

.category-item.active {

    background: #1976d2;

}

.category-icon {

    width: 24px;

    text-align: center;

}

/* ==========================================================
CONTENT
========================================================== */

.effects-content {

    flex: 1;

    min-width: 0;

    display: flex;

    flex-direction: column;

    overflow: hidden;

}

/* ==========================================================
TOOLBAR
========================================================== */

.effects-toolbar {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 15px;

    padding: 12px 16px;

    background: #282828;

    border-bottom: 1px solid #3a3a3a;

}

.toolbar-left,
.toolbar-right {

    display: flex;

    align-items: center;

    gap: 12px;

}

.search-input {

    width: 280px;

    padding: 9px 12px;

    border-radius: 7px;

    border: 1px solid #444;

    background: #333;

    color: #fff;

    outline: none;

}

.search-input:focus {

    border-color: #3b82f6;

}

.effect-count {

    color: #aaa;

    font-size: 12px;

}

.clip-warning {

    color: #ffca28;

    font-size: 12px;

}

/* ==========================================================
GRID
========================================================== */

.effects-grid {

    flex: 1;

    overflow: auto;

    display: grid;

    grid-template-columns:
        repeat(
            auto-fill,
            minmax(190px, 1fr)
        );

    align-content: start;

    gap: 16px;

    padding: 16px;

}

/* ==========================================================
CARD
========================================================== */

.effect-card {

    position: relative;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: flex-start;

    min-height: 190px;

    padding: 18px 12px 12px;

    background: #2b2b2b;

    border: 1px solid #3c3c3c;

    border-radius: 10px;

    cursor: grab;

    transition:
        transform .18s,
        border-color .18s,
        box-shadow .18s,
        background .18s;

    animation:
        effectFade .18s ease;

}

.effect-card:hover {

    transform: translateY(-3px);

    border-color: #3b82f6;

    box-shadow:
        0 10px 24px
        rgba(0,0,0,.35);

}

.effect-card.selected {

    border-color: #ffd54f;

    box-shadow:
        0 0 0 2px
        rgba(255,213,79,.25);

}

.effect-card.applied {

    border-color: #4caf50;

}

.effect-card.previewing {

    border-color: #00bcd4;

    box-shadow:
        0 0 20px
        rgba(0,188,212,.35);

}

.effect-card.dragging {

    opacity: .55;

    transform: scale(.96);

}

/* ==========================================================
ICON
========================================================== */

.effect-icon {

    display: flex;

    align-items: center;
    justify-content: center;

    width: 64px;
    height: 64px;

    margin-bottom: 10px;

    border-radius: 14px;

    background: #343434;

    font-size: 34px;

    transition:
        transform .2s,
        background .2s;

}

.effect-card:hover .effect-icon {

    transform: scale(1.08);

    background: #3b3b3b;

}

.effect-card.selected .effect-icon {

    transform: scale(1.08);

}

/* ==========================================================
NAME
========================================================== */

.effect-name {

    width: 100%;

    margin-bottom: 5px;

    font-size: 14px;
    font-weight: 600;

    text-align: center;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

}

.effect-card.selected .effect-name {

    color: #ffd54f;

}

/* ==========================================================
CATEGORY
========================================================== */

.effect-category {

    margin-bottom: 8px;

    color: #999;

    font-size: 11px;

    text-transform: capitalize;

}

/* ==========================================================
APPLIED
========================================================== */

.applied-badge {

    position: absolute;

    top: 8px;
    right: 8px;

    padding: 3px 6px;

    border-radius: 5px;

    background: #4caf50;

    color: #fff;

    font-size: 9px;
    font-weight: 600;

}

/* ==========================================================
ACTIONS
========================================================== */

.effect-actions {

    display: flex;

    width: 100%;

    gap: 5px;

    margin-top: auto;

}

.effect-actions button {

    height: 30px;

    flex: 1;

    min-width: 0;

    border: none;

    border-radius: 6px;

    background: #3a3a3a;

    color: #fff;

    cursor: pointer;

    font-size: 11px;

    transition:
        background .18s,
        transform .15s;

}

.effect-actions button:hover:not(:disabled) {

    background: #3b82f6;

    transform: translateY(-1px);

}

.effect-actions button:active:not(:disabled) {

    transform: scale(.96);

}

.effect-actions button:disabled {

    opacity: .35;

    cursor: not-allowed;

}

.favorite-btn {

    max-width: 34px;

    flex: 0 0 34px !important;

}

.favorite-btn.active {

    background: #ffca28;

    color: #222;

}

/* ==========================================================
INSPECTOR
========================================================== */

.effect-inspector {

    width: 320px;

    flex-shrink: 0;

    display: flex;

    flex-direction: column;

    background: #242424;

    border-left: 1px solid #363636;

}

/* ==========================================================
INSPECTOR HEADER
========================================================== */

.inspector-header {

    padding: 18px;

    border-bottom: 1px solid #363636;

}

.inspector-title {

    display: flex;

    align-items: center;

    gap: 12px;

}

.inspector-icon {

    display: flex;

    align-items: center;
    justify-content: center;

    width: 42px;
    height: 42px;

    border-radius: 9px;

    background: #333;

    font-size: 23px;

}

.inspector-header h3 {

    margin: 0;

    font-size: 17px;

}

.inspector-header span {

    color: #888;

    font-size: 11px;

}

/* ==========================================================
INSPECTOR BODY
========================================================== */

.inspector-body {

    flex: 1;

    overflow: auto;

    padding: 18px;

    display: flex;

    flex-direction: column;

    gap: 20px;

}

/* ==========================================================
FIELD
========================================================== */

.field {

    display: flex;

    flex-direction: column;

    gap: 8px;

}

.field-header {

    display: flex;

    justify-content: space-between;

    align-items: center;

}

.field-header span {

    color: #8ab4f8;

    font-size: 12px;

}

.field label {

    color: #cfcfcf;

    font-size: 13px;

}

/* ==========================================================
RANGE
========================================================== */

.field input[type="range"] {

    width: 100%;

    accent-color: #3b82f6;

    cursor: pointer;

}

/* ==========================================================
SELECT
========================================================== */

.field select {

    width: 100%;

    padding: 9px 10px;

    border-radius: 6px;

    border: 1px solid #444;

    background: #333;

    color: #fff;

    outline: none;

}

.field select:focus {

    border-color: #3b82f6;

}

/* ==========================================================
WARNING
========================================================== */

.inspector-warning {

    display: flex;

    gap: 9px;

    padding: 12px;

    border-radius: 8px;

    background: rgba(255,193,7,.08);

    border: 1px solid rgba(255,193,7,.25);

}

.inspector-warning p {

    margin: 0;

    color: #c9c9c9;

    font-size: 11px;

    line-height: 1.5;

}

/* ==========================================================
BUTTONS
========================================================== */

.effect-buttons {

    display: flex;

    gap: 8px;

}

.effect-buttons button {

    flex: 1;

    height: 38px;

    border: none;

    border-radius: 7px;

    background: #3a3a3a;

    color: #fff;

    cursor: pointer;

    transition:
        background .18s,
        transform .15s;

}

.effect-buttons button:hover {

    background: #3b82f6;

    transform: translateY(-1px);

}

/* ==========================================================
EMPTY
========================================================== */

.empty-library {

    flex: 1;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 10px;

    color: #888;

    text-align: center;

}

.empty-library .icon {

    font-size: 48px;

}

.empty-library h3 {

    margin: 0;

    color: #fff;

    font-size: 18px;

}

.empty-library p {

    margin: 0;

    font-size: 12px;

}

/* ==========================================================
SCROLLBARS
========================================================== */

.effects-grid::-webkit-scrollbar,
.category-list::-webkit-scrollbar,
.inspector-body::-webkit-scrollbar {

    width: 9px;

}

.effects-grid::-webkit-scrollbar-track,
.category-list::-webkit-scrollbar-track,
.inspector-body::-webkit-scrollbar-track {

    background: #202020;

}

.effects-grid::-webkit-scrollbar-thumb,
.category-list::-webkit-scrollbar-thumb,
.inspector-body::-webkit-scrollbar-thumb {

    background: #555;

    border-radius: 6px;

}

.effects-grid::-webkit-scrollbar-thumb:hover,
.category-list::-webkit-scrollbar-thumb:hover,
.inspector-body::-webkit-scrollbar-thumb:hover {

    background: #707070;

}

/* ==========================================================
ANIMATION
========================================================== */

@keyframes effectFade {

    from {

        opacity: 0;

        transform:
            translateY(8px)
            scale(.96);

    }

    to {

        opacity: 1;

        transform:
            translateY(0)
            scale(1);

    }

}

/* ==========================================================
RESPONSIVE
========================================================== */

@media (max-width: 1200px) {

    .effects-sidebar {

        width: 190px;

    }

    .effect-inspector {

        width: 280px;

    }

}

@media (max-width: 900px) {

    .effects-library {

        flex-direction: column;

    }

    .effects-sidebar {

        width: 100%;

        max-height: 120px;

        border-right: none;

        border-bottom: 1px solid #363636;

    }

    .category-list {

        display: flex;

        overflow-x: auto;
        overflow-y: hidden;

        gap: 5px;

    }

    .category-item {

        flex-shrink: 0;

        white-space: nowrap;

    }

    .effect-inspector {

        width: 100%;

        max-height: 320px;

        border-left: none;

        border-top: 1px solid #363636;

    }

}

@media (max-width: 650px) {

    .effects-grid {

        grid-template-columns:
            repeat(
                auto-fill,
                minmax(150px, 1fr)
            );

    }

    .effect-actions span {

        display: none;

    }

}

/* ==========================================================
ACCESSIBILITY
========================================================== */

button:focus-visible,
input:focus-visible,
select:focus-visible {

    outline: 2px solid #58b4ff;

    outline-offset: 2px;

}

::selection {

    background: #3b82f6;

    color: #fff;

}

</style>
```
