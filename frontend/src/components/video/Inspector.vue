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

const emit = defineEmits([
    "open-export"
]);


/* ==========================================================
   SELECTED OBJECTS
========================================================== */

const selectedClip = computed(() =>
    videoStore.selectedClip
);

const selectedEffect = computed(() =>
    videoStore.selectedEffect
);

const selectedTransition = computed(() =>
    videoStore.selectedTransition
);


/* ==========================================================
   PANELS
========================================================== */

const panels = ref({

    clip: true,
    transform: true,
    color: true,
    crop: true,
    effects: true,
    animation: true,
    audio: true,
    project: true

});


/* ==========================================================
   EFFECT LIBRARY
========================================================== */

const showEffectLibrary = ref(false);


function openEffectLibrary() {

    if (!selectedClip.value)
        return;

    showEffectLibrary.value = true;

}


function closeEffectLibrary() {

    showEffectLibrary.value = false;

}


function addSelectedEffect(preset) {

    if (
        !selectedClip.value ||
        !preset
    )
        return;

    const effect =
        videoStore.addEffect(
            selectedClip.value.id,
            preset.id
        );

    if (effect) {

        videoStore.selectEffect(
            effect.id
        );

    }

    showEffectLibrary.value = false;

}


/* ==========================================================
   EFFECT NAME
========================================================== */

function getEffectName(effect) {

    if (!effect)
        return "Effect";

    const preset =
        videoStore.effectPresets.find(
            item =>
                item.id === effect.type
        );

    return (
        preset?.name ||
        effect.type ||
        "Effect"
    );

}


/* ==========================================================
   EFFECT TYPE
========================================================== */

const selectedEffectType = computed(() => {

    return String(
        selectedEffect.value?.type || ""
    ).toLowerCase();

});


/* ==========================================================
   EFFECT SETTINGS
========================================================== */

function ensureEffectSettings(effect) {

    if (!effect)
        return null;

    if (
        !effect.settings ||
        typeof effect.settings !== "object"
    ) {

        effect.settings = {};

    }

    return effect.settings;

}


function getEffectSetting(
    effect,
    fallback = 0
) {

    if (!effect)
        return fallback;

    const settings =
        ensureEffectSettings(effect);

    const candidates = [

        settings.value,
        settings.amount,
        settings.intensity

    ];

    if (
        effect.type &&
        settings[effect.type] !== undefined
    ) {

        candidates.unshift(
            settings[effect.type]
        );

    }

    for (
        const candidate of candidates
    ) {

        const number =
            Number(candidate);

        if (
            Number.isFinite(number)
        ) {

            return number;

        }

    }

    return fallback;

}


/* ==========================================================
   EFFECT CONTROL CONFIG
========================================================== */

const effectControl = computed(() => {

    const type =
        selectedEffectType.value;

    switch (type) {

        case "brightness":

            return {

                label: "Brightness",
                min: -100,
                max: 100,
                step: 1,
                fallback: 0,
                suffix: ""

            };


        case "contrast":

            return {

                label: "Contrast",
                min: -100,
                max: 100,
                step: 1,
                fallback: 0,
                suffix: ""

            };


        case "saturation":

            return {

                label: "Saturation",
                min: -100,
                max: 100,
                step: 1,
                fallback: 0,
                suffix: ""

            };


        case "blur":

            return {

                label: "Blur",
                min: 0,
                max: 50,
                step: 1,
                fallback: 0,
                suffix: " px"

            };


        case "opacity":

            return {

                label: "Opacity",
                min: 0,
                max: 100,
                step: 1,
                fallback: 100,
                suffix: "%"

            };


        default:

            return null;

    }

});


/* ==========================================================
   EFFECT VALUE
========================================================== */

const selectedEffectValue = computed({

    get() {

        if (!selectedEffect.value)
            return 0;

        return getEffectSetting(
            selectedEffect.value,
            effectControl.value?.fallback ?? 0
        );

    },

    set(value) {

        if (!selectedEffect.value)
            return;

        const settings =
            ensureEffectSettings(
                selectedEffect.value
            );

        const number =
            Number(value);

        const safeValue =
            Number.isFinite(number)
                ? number
                : (
                    effectControl.value?.fallback ?? 0
                );

        settings.value =
            safeValue;

        settings.amount =
            safeValue;

        settings.intensity =
            safeValue;

        if (selectedEffect.value.type) {

            settings[
                selectedEffect.value.type
            ] =
                safeValue;

        }

    }

});


/* ==========================================================
   EFFECT ENABLED
========================================================== */

const selectedEffectEnabled = computed({

    get() {

        if (!selectedEffect.value)
            return false;

        return selectedEffect.value.enabled !== false;

    },

    set(value) {

        if (!selectedEffect.value)
            return;

        selectedEffect.value.enabled =
            Boolean(value);

    }

});


/* ==========================================================
   EFFECT TIME RANGE
========================================================== */

/*
    Effect timing is relative to the selected clip.

    Example:

        Clip duration = 10s
        Effect start  = 2s
        Effect end    = 6s

    The effect should be active only between
    2s and 6s of the selected clip.

    We use startTime / endTime so the existing
    effect object remains compatible with the store.
*/


function getEffectStart(effect) {

    if (
        !effect ||
        !selectedClip.value
    )
        return 0;

    const duration =
        Math.max(
            0,
            Number(
                selectedClip.value.duration
            ) || 0
        );

    const value =
        Number(
            effect.startTime
        );

    if (
        !Number.isFinite(value)
    )
        return 0;

    return Math.max(
        0,
        Math.min(
            value,
            duration
        )
    );

}


function getEffectEnd(effect) {

    if (
        !effect ||
        !selectedClip.value
    )
        return 0;

    const duration =
        Math.max(
            0,
            Number(
                selectedClip.value.duration
            ) || 0
        );

    const start =
        getEffectStart(effect);

    const value =
        Number(
            effect.endTime
        );

    if (
        !Number.isFinite(value)
    )
        return duration;

    return Math.max(
        start,
        Math.min(
            value,
            duration
        )
    );

}


/* ==========================================================
   UPDATE EFFECT START
========================================================== */

function updateEffectStart(event) {

    if (
        !selectedEffect.value ||
        !selectedClip.value
    )
        return;

    const duration =
        Math.max(
            0,
            Number(
                selectedClip.value.duration
            ) || 0
        );

    const end =
        getEffectEnd(
            selectedEffect.value
        );

    let value =
        Number(
            event.target.value
        );

    if (
        !Number.isFinite(value)
    )
        value = 0;

    value =
        Math.max(
            0,
            Math.min(
                value,
                duration,
                end
            )
        );

    videoStore.updateEffect(
        selectedEffect.value.id,
        {
            startTime: value
        }
    );

}


/* ==========================================================
   UPDATE EFFECT END
========================================================== */

function updateEffectEnd(event) {

    if (
        !selectedEffect.value ||
        !selectedClip.value
    )
        return;

    const duration =
        Math.max(
            0,
            Number(
                selectedClip.value.duration
            ) || 0
        );

    const start =
        getEffectStart(
            selectedEffect.value
        );

    let value =
        Number(
            event.target.value
        );

    if (
        !Number.isFinite(value)
    )
        value = duration;

    value =
        Math.max(
            start,
            Math.min(
                value,
                duration
            )
        );

    videoStore.updateEffect(
        selectedEffect.value.id,
        {
            endTime: value
        }
    );

}


/* ==========================================================
   RESET EFFECT
========================================================== */

function resetSelectedEffect() {

    if (!selectedEffect.value)
        return;

    const control =
        effectControl.value;

    if (!control)
        return;

    selectedEffectValue.value =
        control.fallback;

}


/* ==========================================================
   TRANSFORM
========================================================== */

const transform = ref({

    positionX: 0,
    positionY: 0,
    scale: 100,
    rotation: 0,
    opacity: 100

});


/* ==========================================================
   COLOR
========================================================== */

const color = ref({

    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    temperature: 0,
    tint: 0

});


/* ==========================================================
   CROP
========================================================== */

const crop = ref({

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flipH: false,
    flipV: false

});


/* ==========================================================
   AUDIO
========================================================== */

const audio = ref({

    volume: 100,
    balance: 0,
    fadeIn: 0,
    fadeOut: 0,
    pitch: 0,
    speed: 1,
    reverse: false

});


/* ==========================================================
   LOAD CLIP
========================================================== */

function loadClip() {

    if (!selectedClip.value)
        return;

    Object.assign(
        transform.value,
        {

            positionX:
                selectedClip.value.positionX ?? 0,

            positionY:
                selectedClip.value.positionY ?? 0,

            scale:
                selectedClip.value.scale ?? 100,

            rotation:
                selectedClip.value.rotation ?? 0,

            opacity:
                selectedClip.value.opacity ?? 100

        }
    );


    Object.assign(
        color.value,
        {

            brightness:
                selectedClip.value.brightness ?? 0,

            contrast:
                selectedClip.value.contrast ?? 0,

            saturation:
                selectedClip.value.saturation ?? 0,

            hue:
                selectedClip.value.hue ?? 0,

            temperature:
                selectedClip.value.temperature ?? 0,

            tint:
                selectedClip.value.tint ?? 0

        }
    );


    Object.assign(
        crop.value,
        {

            left:
                selectedClip.value.cropLeft ?? 0,

            right:
                selectedClip.value.cropRight ?? 0,

            top:
                selectedClip.value.cropTop ?? 0,

            bottom:
                selectedClip.value.cropBottom ?? 0,

            flipH:
                selectedClip.value.flipH ?? false,

            flipV:
                selectedClip.value.flipV ?? false

        }
    );


    Object.assign(
        audio.value,
        {

            volume:
                selectedClip.value.volume ?? 100,

            balance:
                selectedClip.value.balance ?? 0,

            fadeIn:
                selectedClip.value.fadeIn ?? 0,

            fadeOut:
                selectedClip.value.fadeOut ?? 0,

            pitch:
                selectedClip.value.pitch ?? 0,

            speed:
                selectedClip.value.speed ?? 1,

            reverse:
                selectedClip.value.reverse ?? false

        }
    );

}


/* ==========================================================
   SAVE CLIP
========================================================== */

function saveClip() {

    if (!selectedClip.value)
        return;

    Object.assign(
        selectedClip.value,
        {

            positionX:
                transform.value.positionX,

            positionY:
                transform.value.positionY,

            scale:
                transform.value.scale,

            rotation:
                transform.value.rotation,

            opacity:
                transform.value.opacity,


            brightness:
                color.value.brightness,

            contrast:
                color.value.contrast,

            saturation:
                color.value.saturation,

            hue:
                color.value.hue,

            temperature:
                color.value.temperature,

            tint:
                color.value.tint,


            cropLeft:
                crop.value.left,

            cropRight:
                crop.value.right,

            cropTop:
                crop.value.top,

            cropBottom:
                crop.value.bottom,

            flipH:
                crop.value.flipH,

            flipV:
                crop.value.flipV,


            volume:
                audio.value.volume,

            balance:
                audio.value.balance,

            fadeIn:
                audio.value.fadeIn,

            fadeOut:
                audio.value.fadeOut,

            pitch:
                audio.value.pitch,

            speed:
                audio.value.speed,

            reverse:
                audio.value.reverse

        }
    );

}


/* ==========================================================
   WATCH SELECTED CLIP
========================================================== */

watch(

    selectedClip,

    () => {

        loadClip();

    },

    {
        immediate: true
    }

);


/* ==========================================================
   WATCH CLIP CONTROLS
========================================================== */

watch(

    [
        transform,
        color,
        crop,
        audio
    ],

    () => {

        saveClip();

    },

    {
        deep: true
    }

);


/* ==========================================================
   RESET TRANSFORM
========================================================== */

function resetTransform() {

    Object.assign(
        transform.value,
        {

            positionX: 0,
            positionY: 0,
            scale: 100,
            rotation: 0,
            opacity: 100

        }
    );

}


/* ==========================================================
   RESET COLOR
========================================================== */

function resetColor() {

    Object.assign(
        color.value,
        {

            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            temperature: 0,
            tint: 0

        }
    );

}


/* ==========================================================
   RESET CROP
========================================================== */

function resetCrop() {

    Object.assign(
        crop.value,
        {

            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            flipH: false,
            flipV: false

        }
    );

}


/* ==========================================================
   RESET AUDIO
========================================================== */

function resetAudio() {

    Object.assign(
        audio.value,
        {

            volume: 100,
            balance: 0,
            fadeIn: 0,
            fadeOut: 0,
            pitch: 0,
            speed: 1,
            reverse: false

        }
    );

}

</script>


<template>

<div class="inspector">

    <!-- ================================================== -->
    <!-- HEADER -->
    <!-- ================================================== -->

    <div class="inspector-header">

        <h2>
            Inspector
        </h2>

        <span
            v-if="selectedClip"
            class="clip-type"
        >
            {{ selectedClip.type || "Video" }}
        </span>

    </div>


    <!-- ================================================== -->
    <!-- EMPTY -->
    <!-- ================================================== -->

    <div
        v-if="!selectedClip"
        class="empty-inspector"
    >

        <div class="empty-icon">
            🎬
        </div>

        <h3>
            No Clip Selected
        </h3>

        <p>
            Select a clip from the timeline.
        </p>

    </div>


    <div v-else>

        <!-- ================================================== -->
        <!-- CLIP -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="panels.clip = !panels.clip"
            >

                <span>
                    🎬 Clip
                </span>

                <span>
                    {{ panels.clip ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.clip"
                class="panel-body"
            >

                <div class="field">

                    <label>
                        Name
                    </label>

                    <input
                        v-model="selectedClip.name"
                    >

                </div>


                <div class="field">

                    <label>
                        Start
                    </label>

                    <input
                        type="number"
                        v-model.number="selectedClip.start"
                    >

                </div>


                <div class="field">

                    <label>
                        Duration
                    </label>

                    <input
                        type="number"
                        v-model.number="selectedClip.duration"
                    >

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- TRANSFORM -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="panels.transform = !panels.transform"
            >

                <span>
                    🔧 Transform
                </span>

                <span>
                    {{ panels.transform ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.transform"
                class="panel-body"
            >

                <div class="field">

                    <label>
                        Position X
                    </label>

                    <input
                        type="number"
                        v-model.number="transform.positionX"
                    >

                </div>


                <div class="field">

                    <label>
                        Position Y
                    </label>

                    <input
                        type="number"
                        v-model.number="transform.positionY"
                    >

                </div>


                <div class="field">

                    <label>
                        Scale
                    </label>

                    <input
                        type="range"
                        min="1"
                        max="300"
                        v-model.number="transform.scale"
                    >

                    <span>
                        {{ transform.scale }}%
                    </span>

                </div>


                <div class="field">

                    <label>
                        Rotation
                    </label>

                    <input
                        type="range"
                        min="-180"
                        max="180"
                        v-model.number="transform.rotation"
                    >

                    <span>
                        {{ transform.rotation }}°
                    </span>

                </div>


                <div class="field">

                    <label>
                        Opacity
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        v-model.number="transform.opacity"
                    >

                    <span>
                        {{ transform.opacity }}%
                    </span>

                </div>


                <div class="project-actions">

                    <button
                        type="button"
                        @click="resetTransform()"
                    >
                        Reset Transform
                    </button>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- COLOR -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="panels.color = !panels.color"
            >

                <span>
                    🎨 Color
                </span>

                <span>
                    {{ panels.color ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.color"
                class="panel-body"
            >

                <div class="field">

                    <label>
                        Brightness
                    </label>

                    <input
                        type="range"
                        min="-100"
                        max="100"
                        v-model.number="color.brightness"
                    >

                    <span>
                        {{ color.brightness }}
                    </span>

                </div>


                <div class="field">

                    <label>
                        Contrast
                    </label>

                    <input
                        type="range"
                        min="-100"
                        max="100"
                        v-model.number="color.contrast"
                    >

                    <span>
                        {{ color.contrast }}
                    </span>

                </div>


                <div class="field">

                    <label>
                        Saturation
                    </label>

                    <input
                        type="range"
                        min="-100"
                        max="100"
                        v-model.number="color.saturation"
                    >

                    <span>
                        {{ color.saturation }}
                    </span>

                </div>


                <div class="field">

                    <label>
                        Hue
                    </label>

                    <input
                        type="range"
                        min="-180"
                        max="180"
                        v-model.number="color.hue"
                    >

                    <span>
                        {{ color.hue }}°
                    </span>

                </div>


                <div class="field">

                    <label>
                        Temperature
                    </label>

                    <input
                        type="range"
                        min="-100"
                        max="100"
                        v-model.number="color.temperature"
                    >

                    <span>
                        {{ color.temperature }}
                    </span>

                </div>


                <div class="field">

                    <label>
                        Tint
                    </label>

                    <input
                        type="range"
                        min="-100"
                        max="100"
                        v-model.number="color.tint"
                    >

                    <span>
                        {{ color.tint }}
                    </span>

                </div>


                <div class="project-actions">

                    <button
                        type="button"
                        @click="resetColor()"
                    >
                        Reset Color
                    </button>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- CROP -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="panels.crop = !panels.crop"
            >

                <span>
                    ✂ Crop
                </span>

                <span>
                    {{ panels.crop ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.crop"
                class="panel-body"
            >

                <div class="field">

                    <label>
                        Left
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        v-model.number="crop.left"
                    >

                    <span>
                        {{ crop.left }}%
                    </span>

                </div>


                <div class="field">

                    <label>
                        Right
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        v-model.number="crop.right"
                    >

                    <span>
                        {{ crop.right }}%
                    </span>

                </div>


                <div class="field">

                    <label>
                        Top
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        v-model.number="crop.top"
                    >

                    <span>
                        {{ crop.top }}%
                    </span>

                </div>


                <div class="field">

                    <label>
                        Bottom
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        v-model.number="crop.bottom"
                    >

                    <span>
                        {{ crop.bottom }}%
                    </span>

                </div>


                <div class="field checkbox-field">

                    <label>

                        <input
                            type="checkbox"
                            v-model="crop.flipH"
                        >

                        Flip Horizontal

                    </label>

                </div>


                <div class="field checkbox-field">

                    <label>

                        <input
                            type="checkbox"
                            v-model="crop.flipV"
                        >

                        Flip Vertical

                    </label>

                </div>


                <div class="project-actions">

                    <button
                        type="button"
                        @click="resetCrop()"
                    >
                        Reset Crop
                    </button>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- EFFECTS -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="panels.effects = !panels.effects"
            >

                <span>
                    ✨ Effects
                </span>

                <span>
                    {{ panels.effects ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.effects"
                class="panel-body"
            >

                <div class="effect-toolbar">

                    <button
                        type="button"
                        @click="openEffectLibrary()"
                    >
                        ＋ Add Effect
                    </button>


                    <button
                        v-if="selectedEffect"
                        type="button"
                        @click="
                            videoStore.removeEffect(
                                selectedEffect.id
                            )
                        "
                    >
                        🗑 Remove
                    </button>

                </div>


                <!-- ================================================== -->
                <!-- EFFECT LIST -->
                <!-- ================================================== -->

                <div
                    v-if="
                        videoStore.getEffectsForClip(
                            selectedClip.id
                        ).length === 0
                    "
                    class="empty-effects"
                >

                    No Effects Added

                </div>


                <div
                    v-for="
                        effect in
                        videoStore.getEffectsForClip(
                            selectedClip.id
                        )
                    "
                    :key="effect.id"
                    class="effect-item"
                    :class="{
                        selected:
                            selectedEffect &&
                            selectedEffect.id === effect.id
                    }"
                    @click="
                        videoStore.selectEffect(
                            effect.id
                        )
                    "
                >

                    <div class="effect-info">

                        <div class="effect-name">
                            {{ getEffectName(effect) }}
                        </div>

                        <div class="effect-type">
                            {{ effect.type }}
                        </div>

                    </div>


                    <div class="effect-actions">

                        <button
                            type="button"
                            @click.stop="
                                videoStore.toggleEffect(
                                    effect.id
                                )
                            "
                        >
                            {{
                                effect.enabled
                                    ? "Enabled"
                                    : "Disabled"
                            }}
                        </button>

                    </div>

                </div>


                <!-- ================================================== -->
                <!-- EFFECT CONTROLS -->
                <!-- ================================================== -->

                <div
                    v-if="
                        selectedEffect &&
                        selectedEffectType
                    "
                    class="effect-controls"
                >

                    <div class="effect-controls-header">

                        <div>

                            <strong>
                                Effect Controls
                            </strong>

                            <small>
                                {{ getEffectName(selectedEffect) }}
                            </small>

                        </div>


                        <label class="effect-enable">

                            <input
                                type="checkbox"
                                v-model="selectedEffectEnabled"
                            >

                            Enabled

                        </label>

                    </div>


                    <!-- ================================================== -->
                    <!-- EFFECT TIME RANGE -->
                    <!-- ================================================== -->

                    <div class="effect-time-range">

                        <div class="effect-time-range-title">
                            Effect Time Range
                        </div>


                        <div class="effect-range-grid">

                            <div class="field">

                                <label>
                                    Start
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    :max="selectedClip.duration"
                                    step="0.01"
                                    :value="
                                        getEffectStart(
                                            selectedEffect
                                        )
                                    "
                                    @input="
                                        updateEffectStart
                                    "
                                >

                                <span>
                                    {{
                                        getEffectStart(
                                            selectedEffect
                                        ).toFixed(2)
                                    }}
                                    s
                                </span>

                            </div>


                            <div class="field">

                                <label>
                                    End
                                </label>

                                <input
                                    type="number"
                                    :min="
                                        getEffectStart(
                                            selectedEffect
                                        )
                                    "
                                    :max="selectedClip.duration"
                                    step="0.01"
                                    :value="
                                        getEffectEnd(
                                            selectedEffect
                                        )
                                    "
                                    @input="
                                        updateEffectEnd
                                    "
                                >

                                <span>
                                    {{
                                        getEffectEnd(
                                            selectedEffect
                                        ).toFixed(2)
                                    }}
                                    s
                                </span>

                            </div>

                        </div>


                        <div class="effect-range-summary">

                            Effect active from

                            <strong>
                                {{
                                    getEffectStart(
                                        selectedEffect
                                    ).toFixed(2)
                                }}s
                            </strong>

                            to

                            <strong>
                                {{
                                    getEffectEnd(
                                        selectedEffect
                                    ).toFixed(2)
                                }}s
                            </strong>

                        </div>

                    </div>


                    <!-- ================================================== -->
                    <!-- EFFECT VALUE -->
                    <!-- ================================================== -->

                    <div
                        v-if="effectControl"
                        class="effect-control"
                    >

                        <div class="effect-control-label">

                            <label>
                                {{ effectControl.label }}
                            </label>

                            <span>
                                {{
                                    selectedEffectValue
                                }}{{ effectControl.suffix }}
                            </span>

                        </div>


                        <input
                            type="range"
                            :min="effectControl.min"
                            :max="effectControl.max"
                            :step="effectControl.step"
                            v-model.number="selectedEffectValue"
                        >


                        <div class="effect-control-range">

                            <span>
                                {{ effectControl.min }}{{ effectControl.suffix }}
                            </span>

                            <span>
                                {{ effectControl.max }}{{ effectControl.suffix }}
                            </span>

                        </div>

                    </div>


                    <div
                        v-else
                        class="effect-control-not-supported"
                    >

                        <strong>
                            No controls available
                        </strong>

                        <span>
                            This effect is added and can be enabled or disabled.
                        </span>

                    </div>


                    <div class="project-actions">

                        <button
                            type="button"
                            @click="resetSelectedEffect()"
                        >
                            Reset Effect
                        </button>

                    </div>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- EFFECT LIBRARY -->
        <!-- ================================================== -->

        <div
            v-if="showEffectLibrary"
            class="effect-library-overlay"
            @click.self="closeEffectLibrary()"
        >

            <div class="effect-library">

                <div class="effect-library-header">

                    <div>

                        <h3>
                            Effect Library
                        </h3>

                        <p>
                            Select an effect to add to the selected clip.
                        </p>

                    </div>


                    <button
                        class="effect-library-close"
                        type="button"
                        @click="closeEffectLibrary()"
                    >
                        ×
                    </button>

                </div>


                <div class="effect-library-grid">

                    <button
                        v-for="
                            preset in
                            videoStore.effectPresets
                        "
                        :key="preset.id"
                        class="effect-preset"
                        type="button"
                        @click="
                            addSelectedEffect(
                                preset
                            )
                        "
                    >

                        <span class="effect-preset-icon">
                            ✨
                        </span>


                        <span class="effect-preset-info">

                            <strong>
                                {{ preset.name }}
                            </strong>

                            <small>
                                {{ preset.id }}
                            </small>

                        </span>

                    </button>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- TRANSITION -->
        <!-- ================================================== -->

        <div
            class="panel"
            v-if="selectedTransition"
        >

            <div class="panel-header">

                <span>
                    🎬 Transition
                </span>

            </div>


            <div class="panel-body">

                <div class="field">

                    <label>
                        Duration
                    </label>

                    <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        v-model.number="
                            selectedTransition.duration
                        "
                    >

                    <span>
                        {{
                            selectedTransition.duration.toFixed(1)
                        }} s
                    </span>

                </div>


                <div class="field">

                    <label>
                        Type
                    </label>

                    <select
                        v-model="
                            selectedTransition.type
                        "
                    >

                        <option
                            v-for="
                                preset in
                                videoStore.transitionPresets
                            "
                            :key="preset.id"
                            :value="preset.type"
                        >
                            {{ preset.name }}
                        </option>

                    </select>

                </div>


                <div class="field">

                    <label>
                        Alignment
                    </label>

                    <select
                        v-model="
                            selectedTransition.alignment
                        "
                    >

                        <option value="center">
                            Center
                        </option>

                        <option value="start">
                            Start
                        </option>

                        <option value="end">
                            End
                        </option>

                    </select>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- ANIMATION -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="
                    panels.animation =
                        !panels.animation
                "
            >

                <span>
                    🎞 Animation
                </span>

                <span>
                    {{ panels.animation ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.animation"
                class="panel-body"
            >

                <div class="animation-toolbar">

                    <button
                        type="button"
                        @click="
                            videoStore.addKeyframe(
                                selectedClip.id
                            )
                        "
                    >
                        ＋ Add Keyframe
                    </button>


                    <button
                        v-if="
                            videoStore.selectedKeyframe
                        "
                        type="button"
                        @click="
                            videoStore.removeKeyframe(
                                videoStore.selectedKeyframe.id
                            )
                        "
                    >
                        🗑 Delete
                    </button>

                </div>


                <div
                    v-if="
                        videoStore.getKeyframes(
                            selectedClip.id
                        ).length === 0
                    "
                    class="empty-animation"
                >

                    No Keyframes

                </div>


                <div
                    v-for="
                        keyframe in
                        videoStore.getKeyframes(
                            selectedClip.id
                        )
                    "
                    :key="keyframe.id"
                    class="keyframe-item"
                    :class="{
                        selected:
                            videoStore.selectedKeyframe &&
                            videoStore.selectedKeyframe.id ===
                                keyframe.id
                    }"
                    @click="
                        videoStore.selectKeyframe(
                            keyframe.id
                        )
                    "
                >

                    <div class="keyframe-left">

                        <div class="keyframe-time">
                            {{ keyframe.time.toFixed(2) }} s
                        </div>

                        <div class="keyframe-property">
                            {{ keyframe.property }}
                        </div>

                    </div>


                    <div class="keyframe-right">

                        <select
                            v-model="keyframe.easing"
                        >

                            <option value="linear">
                                Linear
                            </option>

                            <option value="ease">
                                Ease
                            </option>

                            <option value="ease-in">
                                Ease In
                            </option>

                            <option value="ease-out">
                                Ease Out
                            </option>

                            <option value="ease-in-out">
                                Ease In Out
                            </option>

                        </select>

                    </div>

                </div>


                <div class="field">

                    <label>
                        Interpolation
                    </label>

                    <select
                        v-model="
                            videoStore.keyframeInterpolation
                        "
                    >

                        <option value="linear">
                            Linear
                        </option>

                        <option value="bezier">
                            Bezier
                        </option>

                        <option value="hold">
                            Hold
                        </option>

                    </select>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- AUDIO -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="
                    panels.audio =
                        !panels.audio
                "
            >

                <span>
                    🔊 Audio
                </span>

                <span>
                    {{ panels.audio ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.audio"
                class="panel-body"
            >

                <div class="field">

                    <label>
                        Volume
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="200"
                        v-model.number="audio.volume"
                    >

                    <span>
                        {{ audio.volume }}%
                    </span>

                </div>


                <div class="field">

                    <label>
                        Balance
                    </label>

                    <input
                        type="range"
                        min="-100"
                        max="100"
                        v-model.number="audio.balance"
                    >

                    <span>
                        {{ audio.balance }}
                    </span>

                </div>


                <div class="field">

                    <label>
                        Fade In
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        v-model.number="audio.fadeIn"
                    >

                    <span>
                        {{ audio.fadeIn.toFixed(1) }} s
                    </span>

                </div>


                <div class="field">

                    <label>
                        Fade Out
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        v-model.number="audio.fadeOut"
                    >

                    <span>
                        {{ audio.fadeOut.toFixed(1) }} s
                    </span>

                </div>


                <div class="project-actions">

                    <button
                        type="button"
                        @click="resetAudio()"
                    >
                        Reset Audio
                    </button>

                </div>

            </div>

        </div>


        <!-- ================================================== -->
        <!-- PROJECT -->
        <!-- ================================================== -->

        <div class="panel">

            <div
                class="panel-header"
                @click="
                    panels.project =
                        !panels.project
                "
            >

                <span>
                    📁 Project
                </span>

                <span>
                    {{ panels.project ? "▼" : "+" }}
                </span>

            </div>


            <div
                v-if="panels.project"
                class="panel-body"
            >

                <div class="field">

                    <label>
                        Project Name
                    </label>

                    <input
                        v-model="
                            videoStore.project.name
                        "
                    >

                </div>


                <div class="field">

                    <label>
                        Resolution
                    </label>

                    <select
                        v-model="
                            videoStore.project.resolution
                        "
                    >

                        <option value="3840x2160">
                            3840 × 2160 (4K)
                        </option>

                        <option value="2560x1440">
                            2560 × 1440 (2K)
                        </option>

                        <option value="1920x1080">
                            1920 × 1080
                        </option>

                        <option value="1280x720">
                            1280 × 720
                        </option>

                        <option value="1080x1920">
                            1080 × 1920 Vertical
                        </option>

                    </select>

                </div>


                <div class="field">

                    <label>
                        FPS
                    </label>

                    <select
                        v-model.number="
                            videoStore.project.fps
                        "
                    >

                        <option :value="24">
                            24 FPS
                        </option>

                        <option :value="25">
                            25 FPS
                        </option>

                        <option :value="30">
                            30 FPS
                        </option>

                        <option :value="50">
                            50 FPS
                        </option>

                        <option :value="60">
                            60 FPS
                        </option>

                    </select>

                </div>


                <div class="field">

                    <label>
                        Duration
                    </label>

                    <input
                        readonly
                        :value="
                            videoStore.project.duration +
                            ' s'
                        "
                    >

                </div>


                <div class="project-actions">

                    <button
                        type="button"
                        @click="
                            videoStore.autoSave()
                        "
                    >
                        💾 Save
                    </button>


                    <button
                        type="button"
                        @click="
                            videoStore.restoreAutoSave()
                        "
                    >
                        ↩ Restore
                    </button>


                    <button
                        type="button"
                        @click="
                            videoStore.resetStore()
                        "
                    >
                        🗑 New Project
                    </button>


                    <button
                        type="button"
                        @click="
                            emit('open-export')
                        "
                    >
                        📤 Export
                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

</template>


<style scoped>

/* ====================================================== */
/* INSPECTOR */
/* ====================================================== */

.inspector {

    width: 100%;
    height: 100%;
    overflow-y: auto;

    background: #1f1f1f;
    color: #ffffff;

    display: flex;
    flex-direction: column;

}


/* ====================================================== */
/* HEADER */
/* ====================================================== */

.inspector-header {

    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 16px;

    background: #292929;

    border-bottom: 1px solid #3c3c3c;

}


.inspector-header h2 {

    margin: 0;
    font-size: 18px;
    font-weight: 600;

}


.clip-type {

    padding: 4px 10px;

    border-radius: 6px;

    background: #1976d2;

    font-size: 12px;

}


/* ====================================================== */
/* PANEL */
/* ====================================================== */

.panel {

    margin: 10px;

    border: 1px solid #343434;

    border-radius: 8px;

    overflow: hidden;

    background: #262626;

}


.panel-header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 12px 14px;

    background: #313131;

    cursor: pointer;

    font-weight: 600;

    transition: .2s;

}


.panel-header:hover {

    background: #3b3b3b;

}


.panel-body {

    padding: 14px;

}


/* ====================================================== */
/* FORM */
/* ====================================================== */

.field {

    display: flex;

    flex-direction: column;

    gap: 6px;

    margin-bottom: 14px;

}


.field label {

    font-size: 13px;

    color: #bfbfbf;

}


.field input,
.field select {

    width: 100%;

    background: #383838;

    border: 1px solid #4a4a4a;

    color: #fff;

    border-radius: 6px;

    padding: 8px;

    box-sizing: border-box;

}


.field input[type="range"] {

    padding: 0;

}


.checkbox-field {

    flex-direction: row;

    align-items: center;

}


.checkbox-field label {

    display: flex;

    align-items: center;

    gap: 8px;

}


/* ====================================================== */
/* BUTTONS */
/* ====================================================== */

button {

    border: none;

    border-radius: 6px;

    background: #3b82f6;

    color: #ffffff;

    padding: 8px 12px;

    cursor: pointer;

    transition: .2s;

}


button:hover {

    background: #2563eb;

}


/* ====================================================== */
/* EFFECTS */
/* ====================================================== */

.effect-item,
.keyframe-item {

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 10px;

    margin-bottom: 8px;

    background: #333333;

    border-radius: 6px;

}


.effect-item.selected,
.keyframe-item.selected {

    outline: 2px solid #ffd54f;

}


.effect-toolbar,
.animation-toolbar,
.project-actions {

    display: flex;

    flex-wrap: wrap;

    gap: 8px;

    margin-top: 12px;

}


.effect-info {

    min-width: 0;

}


.effect-name {

    font-weight: 600;

    font-size: 13px;

}


.effect-type {

    margin-top: 3px;

    color: #888;

    font-size: 11px;

}


.effect-actions {

    display: flex;

    gap: 6px;

}


/* ====================================================== */
/* EFFECT CONTROLS */
/* ====================================================== */

.effect-controls {

    margin-top: 14px;

    padding: 14px;

    background: #202020;

    border: 1px solid #3e3e3e;

    border-radius: 8px;

}


.effect-controls-header {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    margin-bottom: 16px;

}


.effect-controls-header > div {

    display: flex;

    flex-direction: column;

    gap: 4px;

}


.effect-controls-header strong {

    font-size: 14px;

    color: #ffffff;

}


.effect-controls-header small {

    font-size: 11px;

    color: #8d8d8d;

}


.effect-enable {

    display: flex;

    align-items: center;

    gap: 6px;

    font-size: 11px;

    color: #bdbdbd;

    cursor: pointer;

    white-space: nowrap;

}


.effect-enable input {

    width: auto;

}


/* ====================================================== */
/* EFFECT TIME RANGE */
/* ====================================================== */

.effect-time-range {

    margin-bottom: 16px;

    padding: 12px;

    background: #292929;

    border: 1px solid #3b3b3b;

    border-radius: 7px;

}


.effect-time-range-title {

    margin-bottom: 12px;

    font-size: 12px;

    font-weight: 600;

    color: #d8d8d8;

}


.effect-range-grid {

    display: grid;

    grid-template-columns:
        repeat(2, minmax(0, 1fr));

    gap: 10px;

}


.effect-range-grid .field {

    margin-bottom: 0;

}


.effect-range-grid .field span {

    color: #ffffff;

    font-size: 11px;

    text-align: right;

}


.effect-range-summary {

    margin-top: 12px;

    padding: 9px 10px;

    border-radius: 6px;

    background: #202020;

    color: #888;

    font-size: 11px;

    text-align: center;

}


.effect-range-summary strong {

    color: #ffffff;

    font-weight: 600;

}


.effect-control {

    display: flex;

    flex-direction: column;

    gap: 8px;

}


.effect-control-label {

    display: flex;

    justify-content: space-between;

    align-items: center;

}


.effect-control-label label {

    color: #cfcfcf;

    font-size: 13px;

}


.effect-control-label span {

    min-width: 48px;

    text-align: right;

    color: #ffffff;

    font-size: 13px;

    font-weight: 600;

}


.effect-control input[type="range"] {

    width: 100%;

    padding: 0;

    margin: 0;

}


.effect-control-range {

    display: flex;

    justify-content: space-between;

    color: #666;

    font-size: 10px;

}


.effect-control-not-supported {

    display: flex;

    flex-direction: column;

    gap: 5px;

    padding: 12px;

    border-radius: 6px;

    background: #2a2a2a;

}


.effect-control-not-supported strong {

    font-size: 12px;

    color: #ddd;

}


.effect-control-not-supported span {

    font-size: 11px;

    color: #888;

}


/* ====================================================== */
/* EMPTY */
/* ====================================================== */

.empty-inspector,
.empty-effects,
.empty-animation {

    text-align: center;

    color: #888;

    padding: 30px;

}


.empty-icon {

    font-size: 42px;

    margin-bottom: 10px;

}


/* ====================================================== */
/* SCROLLBAR */
/* ====================================================== */

.inspector::-webkit-scrollbar {

    width: 10px;

}


.inspector::-webkit-scrollbar-track {

    background: #202020;

}


.inspector::-webkit-scrollbar-thumb {

    background: #555;

    border-radius: 6px;

}


.inspector::-webkit-scrollbar-thumb:hover {

    background: #777;

}


/* ====================================================== */
/* EFFECT LIBRARY */
/* ====================================================== */

.effect-library-overlay {

    position: fixed;

    inset: 0;

    z-index: 1000;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 24px;

    background: rgba(0, 0, 0, .65);

    backdrop-filter: blur(4px);

}


.effect-library {

    width: min(620px, 100%);

    max-height: 90vh;

    overflow-y: auto;

    background: #242424;

    border: 1px solid #444;

    border-radius: 12px;

    box-shadow:
        0 20px 60px rgba(0, 0, 0, .45);

}


.effect-library-header {

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 16px;

    padding: 18px;

    border-bottom: 1px solid #3c3c3c;

}


.effect-library-header h3 {

    margin: 0 0 5px;

    font-size: 18px;

}


.effect-library-header p {

    margin: 0;

    color: #999;

    font-size: 12px;

}


.effect-library-close {

    width: 34px;

    height: 34px;

    padding: 0;

    background: #383838;

    font-size: 22px;

    line-height: 1;

}


.effect-library-grid {

    display: grid;

    grid-template-columns:
        repeat(2, minmax(0, 1fr));

    gap: 10px;

    padding: 16px;

}


.effect-preset {

    display: flex;

    align-items: center;

    gap: 12px;

    width: 100%;

    min-height: 68px;

    padding: 12px;

    text-align: left;

    background: #303030;

    border: 1px solid #414141;

    border-radius: 8px;

}


.effect-preset-info {

    display: flex;

    flex-direction: column;

    gap: 3px;

    min-width: 0;

}


.effect-preset-info strong {

    color: #fff;

    font-size: 13px;

}


.effect-preset-info small {

    color: #888;

    font-size: 11px;

}


.effect-preset-icon {

    width: 36px;

    height: 36px;

    flex: 0 0 36px;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #3b82f6;

    border-radius: 8px;

    font-size: 18px;

}


/* ====================================================== */
/* RESPONSIVE */
/* ====================================================== */

@media (max-width: 600px) {

    .effect-library-grid {

        grid-template-columns: 1fr;

    }


    .effect-range-grid {

        grid-template-columns: 1fr;

    }

}


@media (max-width: 900px) {

    .panel {

        margin: 6px;

    }

    .panel-body {

        padding: 10px;

    }

}


/* ====================================================== */
/* END */
/* ====================================================== */

</style>