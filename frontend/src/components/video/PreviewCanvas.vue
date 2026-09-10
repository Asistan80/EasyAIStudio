<script setup>

import {
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
    nextTick
} from "vue";

import {
    useVideoStore
} from "../../stores/videoStore";


/*
==========================================================
STORE
==========================================================
*/

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
PLAYBACK
==========================================================
*/

const isPlaying = computed(() =>
    videoStore.isPlaying
);

const currentFrame = computed(() =>
    videoStore.currentFrame
);

const currentTime = computed(() =>
    videoStore.currentTime
);


/*
==========================================================
PROJECT
==========================================================
*/

const project = computed(() =>
    videoStore.project
);


/*
==========================================================
QUALITY
==========================================================
*/

const previewQuality = ref("full");


/*
==========================================================
VIDEO / IMAGE CACHE
==========================================================
*/

const videoCache = new Map();
const imageCache = new Map();


/*
==========================================================
AUDIO CACHE
==========================================================

Each clip receives its own HTMLAudioElement.

This is important because the same source file can be used
by multiple clips at different timeline positions.
==========================================================
*/

const audioCache = new Map();


/*
==========================================================
AUDIO STATE
==========================================================
*/

let lastAudioSyncTime = null;

let audioUserGestureUnlocked = false;


/*
==========================================================
ANIMATION
==========================================================
*/

let animationFrame = null;
let lastFrameTime = null;


/*
==========================================================
RENDER REQUEST
==========================================================
*/

let renderRequested = false;

function requestPreviewRender(){

    if(renderRequested)
        return;

    renderRequested = true;

    requestAnimationFrame(() => {

        renderRequested = false;

        renderPreview();

    });

}


/*
==========================================================
SAFE NUMBER
==========================================================
*/

function safeNumber(
    value,
    fallback = 0
){

    const number =
        Number(value);

    if(
        Number.isFinite(number)
    ){

        return number;

    }

    return fallback;

}


/*
==========================================================
SAFE TRANSFORM
==========================================================
*/

function getSafeTransform(clip){

    const positionX =
        safeNumber(
            clip?.positionX,
            safeNumber(
                clip?.x,
                0
            )
        );

    const positionY =
        safeNumber(
            clip?.positionY,
            safeNumber(
                clip?.y,
                0
            )
        );

    let scale =
        safeNumber(
            clip?.scale,
            100
        );

    let rotation =
        safeNumber(
            clip?.rotation,
            0
        );

    let opacity =
        safeNumber(
            clip?.opacity,
            100
        );

    if(
        !Number.isFinite(scale) ||
        scale <= 0
    ){

        scale = 100;

    }

    if(
        !Number.isFinite(opacity)
    ){

        opacity = 100;

    }

    opacity =
        Math.max(
            0,
            Math.min(
                100,
                opacity
            )
        );

    return {

        positionX,
        positionY,
        scale,
        rotation,
        opacity

    };

}


/*
==========================================================
EFFECT HELPERS
==========================================================
*/

function getEffectValue(
    effect,
    defaultValue = 0
){

    if(!effect)
        return defaultValue;

    const settings =
        effect.settings || {};

    const candidates = [
        settings.value,
        settings.amount,
        settings.intensity
    ];

    if(
        effect.type &&
        settings[effect.type] !== undefined
    ){

        candidates.unshift(
            settings[effect.type]
        );

    }

    for(
        const candidate of candidates
    ){

        const number =
            Number(candidate);

        if(
            Number.isFinite(number)
        ){

            return number;

        }

    }

    return defaultValue;

}


/*
==========================================================
EFFECT TIME
==========================================================
*/

function getEffectStart(effect){

    if(!effect)
        return 0;

    const candidates = [
        effect.start,
        effect.startTime
    ];

    for(
        const candidate of candidates
    ){

        const value =
            Number(candidate);

        if(
            Number.isFinite(value)
        ){

            return Math.max(
                0,
                value
            );

        }

    }

    return 0;

}


function getEffectEnd(effect){

    if(!effect)
        return Infinity;

    const candidates = [
        effect.end,
        effect.endTime
    ];

    for(
        const candidate of candidates
    ){

        const value =
            Number(candidate);

        if(
            Number.isFinite(value)
        ){

            return Math.max(
                0,
                value
            );

        }

    }

    return Infinity;

}


/*
==========================================================
EFFECT ACTIVE
==========================================================
*/

function isEffectActiveAtTime(
    effect,
    time
){

    if(!effect)
        return false;

    const current =
        safeNumber(
            time,
            0
        );

    const start =
        getEffectStart(
            effect
        );

    const end =
        getEffectEnd(
            effect
        );

    if(
        end <= start
    ){

        return false;

    }

    return (
        current >= start &&
        current < end
    );

}


/*
==========================================================
GET EFFECTS
==========================================================
*/

function getEffectsForClip(
    clip,
    time = 0
){

    if(
        !clip ||
        clip.id == null
    ){

        return [];

    }

    if(
        !Array.isArray(
            videoStore.effects
        )
    ){

        return [];

    }

    /*
    ------------------------------------------------------
    Effects in videoStore use clip-local start/end times.
    ------------------------------------------------------
    */

    const clipStart =
        getClipStart(
            clip
        );

    const localTime =
        Math.max(
            0,
            safeNumber(
                time,
                0
            ) -
            clipStart
        );

    return videoStore.effects.filter(
        effect => {

            if(
                !effect ||
                effect.clipId !== clip.id ||
                effect.enabled === false
            ){

                return false;

            }

            return isEffectActiveAtTime(
                effect,
                localTime
            );

        }
    );

}


/*
==========================================================
CANVAS FILTER
==========================================================
*/

function getCanvasFilter(
    clip,
    time = 0
){

    const effects =
        getEffectsForClip(
            clip,
            time
        );

    if(
        effects.length === 0
    ){

        return "none";

    }

    const filters = [];

    for(
        const effect of effects
    ){

        const type =
            String(
                effect.type || ""
            ).toLowerCase();

        const value =
            getEffectValue(
                effect,
                0
            );

        switch(type){

            case "brightness": {

                const brightness =
                    Math.max(
                        0,
                        1 + (
                            value / 100
                        )
                    );

                filters.push(
                    `brightness(${brightness})`
                );

                break;

            }

            case "contrast": {

                const contrast =
                    Math.max(
                        0,
                        1 + (
                            value / 100
                        )
                    );

                filters.push(
                    `contrast(${contrast})`
                );

                break;

            }

            case "saturation": {

                const saturation =
                    Math.max(
                        0,
                        1 + (
                            value / 100
                        )
                    );

                filters.push(
                    `saturate(${saturation})`
                );

                break;

            }

            case "blur": {

                const blur =
                    Math.max(
                        0,
                        value
                    );

                if(
                    blur > 0
                ){

                    filters.push(
                        `blur(${blur}px)`
                    );

                }

                break;

            }

            case "grayscale": {

                const amount =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            value
                        )
                    );

                filters.push(
                    `grayscale(${amount}%)`
                );

                break;

            }

            case "sepia": {

                const amount =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            value
                        )
                    );

                filters.push(
                    `sepia(${amount}%)`
                );

                break;

            }

            case "hue-rotate": {

                filters.push(
                    `hue-rotate(${value}deg)`
                );

                break;

            }

            case "invert": {

                const amount =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            value
                        )
                    );

                filters.push(
                    `invert(${amount}%)`
                );

                break;

            }

            default:

                break;

        }

    }

    if(
        filters.length === 0
    ){

        return "none";

    }

    return filters.join(" ");

}


/*
==========================================================
EFFECT OPACITY
==========================================================
*/

function getEffectOpacity(
    clip,
    time = 0
){

    const effects =
        getEffectsForClip(
            clip,
            time
        );

    let opacity = 1;

    for(
        const effect of effects
    ){

        const type =
            String(
                effect.type || ""
            ).toLowerCase();

        if(
            type !== "opacity"
        ){

            continue;

        }

        const value =
            getEffectValue(
                effect,
                100
            );

        const effectOpacity =
            Math.max(
                0,
                Math.min(
                    100,
                    value
                )
            ) / 100;

        opacity *=
            effectOpacity;

    }

    return opacity;

}


/*
==========================================================
ZOOM
==========================================================
*/

function zoomIn(){

    zoom.value =
        Math.min(
            zoom.value + 10,
            800
        );

}


function zoomOut(){

    zoom.value =
        Math.max(
            zoom.value - 10,
            10
        );

}


function zoom100(){

    zoom.value = 100;

}


function fitScreen(){

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

function handleWheel(event){

    event.preventDefault();

    if(
        event.deltaY < 0
    ){

        zoom.value =
            Math.min(
                zoom.value + 5,
                800
            );

    }
    else{

        zoom.value =
            Math.max(
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

function startPan(event){

    if(!isPanning.value)
        return;

    lastMouseX.value =
        event.clientX;

    lastMouseY.value =
        event.clientY;

}


function movePan(event){

    if(!isPanning.value)
        return;

    const dx =
        event.clientX -
        lastMouseX.value;

    const dy =
        event.clientY -
        lastMouseY.value;

    panX.value += dx;
    panY.value += dy;

    lastMouseX.value =
        event.clientX;

    lastMouseY.value =
        event.clientY;

}


function endPan(){

    isPanning.value = false;

}


/*
==========================================================
KEYBOARD
==========================================================
*/

function handleKeyDown(event){

    if(
        event.code === "Space"
    ){

        event.preventDefault();

        isPanning.value = true;

    }

}


function handleKeyUp(event){

    if(
        event.code === "Space"
    ){

        event.preventDefault();

        isPanning.value = false;

    }

}


/*
==========================================================
CANVAS SIZE
==========================================================
*/

function resizeCanvas(){

    const canvas =
        previewCanvas.value;

    const wrapper =
        canvasWrapper.value;

    if(
        !canvas ||
        !wrapper
    ){

        return;

    }

    const width =
        Math.max(
            1,
            Math.floor(
                wrapper.clientWidth
            )
        );

    const height =
        Math.max(
            1,
            Math.floor(
                wrapper.clientHeight
            )
        );

    if(
        canvas.width !== width ||
        canvas.height !== height
    ){

        canvas.width = width;

        canvas.height = height;

    }

}


/*
==========================================================
MEDIA LOOKUP
==========================================================
*/

function getMediaForClip(clip){

    if(
        !clip ||
        clip.mediaId == null
    ){

        return null;

    }

    const media =
        videoStore.media.find(
            item =>
                item.id ===
                clip.mediaId
        );

    return media || null;

}


/*
==========================================================
MEDIA TYPE HELPERS
==========================================================
*/

function isAudioMedia(media){

    if(!media)
        return false;

    const type =
        String(
            media.type || ""
        ).toLowerCase();

    return (
        type === "audio" ||
        type.startsWith("audio/")
    );

}


function isVideoMedia(media){

    if(!media)
        return false;

    const type =
        String(
            media.type || ""
        ).toLowerCase();

    return (
        type === "video" ||
        type.startsWith("video/")
    );

}


/*
==========================================================
IMAGE
==========================================================
*/

function loadImage(url){

    if(!url)
        return null;

    if(
        imageCache.has(url)
    ){

        return imageCache.get(url);

    }

    const image =
        new Image();

    image.decoding =
        "async";

    image.src =
        url;

    image.addEventListener(
        "load",
        requestPreviewRender,
        {
            once: true
        }
    );

    image.addEventListener(
        "error",
        () => {

            console.warn(
                "Preview image could not be loaded:",
                url
            );

        },
        {
            once: true
        }
    );

    imageCache.set(
        url,
        image
    );

    return image;

}


/*
==========================================================
VIDEO
==========================================================
*/

function loadVideo(url){

    if(!url)
        return null;

    if(
        videoCache.has(url)
    ){

        return videoCache.get(url);

    }

    const video =
        document.createElement(
            "video"
        );

    video.preload =
        "auto";

    /*
    ------------------------------------------------------
    Audio is intentionally NOT muted.

    The audio synchronization layer controls volume.
    ------------------------------------------------------
    */

    video.muted =
        false;

    video.playsInline =
        true;

    video.controls =
        false;

    video.addEventListener(
        "loadedmetadata",
        () => {

            try{

                video.currentTime = 0;

            }
            catch{

                // Ignore initial seek errors.

            }

            requestPreviewRender();

        }
    );

    video.addEventListener(
        "loadeddata",
        requestPreviewRender
    );

    video.addEventListener(
        "canplay",
        requestPreviewRender
    );

    video.addEventListener(
        "canplaythrough",
        requestPreviewRender
    );

    video.addEventListener(
        "seeked",
        requestPreviewRender
    );

    video.addEventListener(
        "timeupdate",
        () => {

            if(
                isPlaying.value
            ){

                requestPreviewRender();

            }

        }
    );

    video.addEventListener(
        "error",
        () => {

            console.error(
                "Preview video load error:",
                {
                    url,
                    error:
                        video.error
                }
            );

        }
    );

    video.src =
        url;

    videoCache.set(
        url,
        video
    );

    try{

        video.load();

    }
    catch{

        // Ignore loading errors.

    }

    return video;

}


/*
==========================================================
ALL CLIPS
==========================================================
*/

function getAllClips(){

    return videoStore.tracks
        .flatMap(
            track =>
                track.clips || []
        );

}


/*
==========================================================
CLIP START
==========================================================
*/

function getClipStart(clip){

    return safeNumber(
        clip?.start,
        0
    );

}


/*
==========================================================
CLIP DURATION
==========================================================
*/

function getClipDuration(clip){

    return Math.max(
        0,
        safeNumber(
            clip?.duration,
            0
        )
    );

}


/*
==========================================================
CLIP END
==========================================================
*/

function getClipEnd(clip){

    return (
        getClipStart(clip) +
        getClipDuration(clip)
    );

}


/*
==========================================================
CLIP LOCAL TIME
==========================================================
*/

function getClipLocalTime(
    clip,
    time
){

    const clipStart =
        getClipStart(
            clip
        );

    const speed =
        Math.max(
            0.01,
            safeNumber(
                clip?.speed,
                1
            )
        );

    const offset =
        Math.max(
            0,
            safeNumber(
                clip?.offset,
                0
            )
        );

    const localTime =
        Math.max(
            0,
            safeNumber(
                time,
                0
            ) -
            clipStart
        );

    return (
        offset +
        (
            localTime *
            speed
        )
    );

}


/*
==========================================================
ACTIVE CLIP
==========================================================
*/

function getActiveClip(time){

    const clips =
        getAllClips();

    const visibleClips =
        clips.filter(
            clip =>
                clip.visible !== false &&
                !isAudioMedia(
                    getMediaForClip(
                        clip
                    )
                )
        );

    let active =
        visibleClips.find(
            clip => {

                const start =
                    getClipStart(
                        clip
                    );

                const end =
                    getClipEnd(
                        clip
                    );

                return (
                    time >= start &&
                    time < end
                );

            }
        );

    if(!active){

        active =
            visibleClips.find(
                clip => {

                    const start =
                        getClipStart(
                            clip
                        );

                    const end =
                        getClipEnd(
                            clip
                        );

                    return (
                        time === end &&
                        end > start
                    );

                }
            );

    }

    return active || null;

}


/*
==========================================================
AUDIO TRACK HELPERS
==========================================================
*/

function isAudioTrack(track){

    if(!track)
        return false;

    return (
        String(
            track.type || ""
        ).toLowerCase() ===
        "audio"
    );

}


function isTrackMuted(track){

    return (
        !track ||
        track.muted === true
    );

}


function hasSoloTrack(){

    return videoStore.tracks.some(
        track =>
            track &&
            track.solo === true
    );

}


function isTrackAudible(track){

    if(!track)
        return false;

    if(
        track.muted === true
    ){

        return false;

    }

    if(
        hasSoloTrack() &&
        track.solo !== true
    ){

        return false;

    }

    return true;

}


/*
==========================================================
AUDIO CLIPS
==========================================================
*/

function getAudioClips(){

    const clips = [];

    for(
        const track of
        videoStore.tracks
    ){

        if(!track)
            continue;

        for(
            const clip of
            (
                Array.isArray(
                    track.clips
                )
                    ? track.clips
                    : []
            )
        ){

            if(!clip)
                continue;

            const media =
                getMediaForClip(
                    clip
                );

            if(
                isAudioMedia(
                    media
                )
            ){

                clips.push({
                    track,
                    clip,
                    media
                });

            }

        }

    }

    return clips;

}


/*
==========================================================
AUDIO CLIP ACTIVE
==========================================================
*/

function isAudioClipActive(
    clip,
    time
){

    if(!clip)
        return false;

    const start =
        getClipStart(
            clip
        );

    const end =
        getClipEnd(
            clip
        );

    return (
        time >= start &&
        time < end
    );

}


/*
==========================================================
AUDIO FADE VOLUME
==========================================================
*/

function getAudioFadeMultiplier(
    clip,
    time
){

    if(!clip)
        return 1;

    const clipStart =
        getClipStart(
            clip
        );

    const clipDuration =
        getClipDuration(
            clip
        );

    const localTime =
        Math.max(
            0,
            time -
            clipStart
        );

    let multiplier = 1;

    const fadeIn =
        Math.max(
            0,
            Math.min(
                clipDuration,
                safeNumber(
                    clip.fadeIn,
                    0
                )
            )
        );

    const fadeOut =
        Math.max(
            0,
            Math.min(
                clipDuration,
                safeNumber(
                    clip.fadeOut,
                    0
                )
            )
        );

    if(
        fadeIn > 0 &&
        localTime < fadeIn
    ){

        multiplier *=
            Math.max(
                0,
                Math.min(
                    1,
                    localTime /
                    fadeIn
                )
            );

    }

    if(
        fadeOut > 0 &&
        localTime >
            clipDuration -
            fadeOut
    ){

        const remaining =
            clipDuration -
            localTime;

        multiplier *=
            Math.max(
                0,
                Math.min(
                    1,
                    remaining /
                    fadeOut
                )
            );

    }

    return multiplier;

}


/*
==========================================================
AUDIO VOLUME
==========================================================
*/

function getClipAudioVolume(
    track,
    clip,
    time
){

    if(
        !track ||
        !clip
    ){

        return 0;

    }

    if(
        !isTrackAudible(
            track
        )
    ){

        return 0;

    }

    if(
        clip.muted === true
    ){

        return 0;

    }

    const baseVolume =
        Math.max(
            0,
            Math.min(
                2,
                safeNumber(
                    clip.volume,
                    1
                )
            )
        );

    const fadeMultiplier =
        getAudioFadeMultiplier(
            clip,
            time
        );

    return Math.max(
        0,
        Math.min(
            1,
            baseVolume *
            fadeMultiplier
        )
    );

}


/*
==========================================================
AUDIO ELEMENT
==========================================================
*/

function createAudioElement(
    key,
    media
){

    if(
        !media ||
        !media.url
    ){

        return null;

    }

    const existing =
        audioCache.get(
            key
        );

    if(existing){

        if(
            existing.url !==
            media.url
        ){

            try{

                existing.audio.pause();

            }
            catch{

                // Ignore cleanup errors.

            }

            audioCache.delete(
                key
            );

        }
        else{

            return existing.audio;

        }

    }

    const audio =
        document.createElement(
            "audio"
        );

    audio.preload =
        "auto";

    audio.controls =
        false;

    audio.playsInline =
        true;

    audio.crossOrigin =
        "anonymous";

    audio.src =
        media.url;

    audio.addEventListener(
        "loadedmetadata",
        requestPreviewRender
    );

    audio.addEventListener(
        "canplay",
        requestPreviewRender
    );

    audio.addEventListener(
        "ended",
        () => {

            audio.pause();

        }
    );

    audio.addEventListener(
        "error",
        () => {

            console.error(
                "Preview audio load error:",
                {
                    url: media.url,
                    error: audio.error
                }
            );

        }
    );

    audioCache.set(
        key,
        {
            audio,
            url: media.url
        }
    );

    try{

        audio.load();

    }
    catch{

        // Ignore audio loading errors.

    }

    return audio;

}


/*
==========================================================
AUDIO SEEK
==========================================================
*/

function seekAudioElement(
    audio,
    desiredTime
){

    if(
        !audio ||
        !Number.isFinite(
            desiredTime
        )
    ){

        return;

    }

    const duration =
        safeNumber(
            audio.duration,
            0
        );

    let target =
        Math.max(
            0,
            desiredTime
        );

    if(
        duration > 0 &&
        Number.isFinite(duration)
    ){

        target =
            Math.min(
                target,
                Math.max(
                    0,
                    duration -
                    0.001
                )
            );

    }

    if(
        !Number.isFinite(
            audio.currentTime
        ) ||
        Math.abs(
            audio.currentTime -
            target
        ) > 0.10
    ){

        try{

            audio.currentTime =
                target;

        }
        catch{

            // Ignore seek errors.

        }

    }

}


/*
==========================================================
AUDIO PLAY
==========================================================
*/

function playAudioElement(
    audio
){

    if(!audio)
        return;

    if(
        !audio.paused
    ){

        return;

    }

    audio.play().catch(
        error => {

            /*
            ------------------------------------------------
            Browsers can reject autoplay until the user
            performs a gesture. The Play button normally
            provides that gesture.
            ------------------------------------------------
            */

            if(
                error &&
                error.name !==
                "AbortError"
            ){

                console.warn(
                    "Preview audio play was blocked:",
                    error
                );

            }

        }
    );

}


/*
==========================================================
SYNC AUDIO CLIPS
==========================================================
*/

function syncAudioClips(
    time
){

    const audioClips =
        getAudioClips();

    const activeKeys =
        new Set();

    for(
        const item of
        audioClips
    ){

        const {
            track,
            clip,
            media
        } = item;

        const key =
            `clip:${clip.id}`;

        const active =
            isAudioClipActive(
                clip,
                time
            );

        if(!active){

            continue;

        }

        activeKeys.add(
            key
        );

        const audio =
            createAudioElement(
                key,
                media
            );

        if(!audio)
            continue;

        const sourceTime =
            getClipLocalTime(
                clip,
                time
            );

        const speed =
            Math.max(
                0.01,
                safeNumber(
                    clip.speed,
                    1
                )
            );

        try{

            audio.playbackRate =
                speed;

        }
        catch{

            // Ignore playbackRate errors.

        }

        audio.volume =
            getClipAudioVolume(
                track,
                clip,
                time
            );

        seekAudioElement(
            audio,
            sourceTime
        );

        if(
            isPlaying.value
        ){

            playAudioElement(
                audio
            );

        }
        else{

            if(
                !audio.paused
            ){

                audio.pause();

            }

        }

    }

    /*
    ------------------------------------------------------
    Pause audio clips which are no longer active.
    ------------------------------------------------------
    */

    for(
        const [
            key,
            entry
        ] of
        audioCache.entries()
    ){

        if(
            !activeKeys.has(
                key
            )
        ){

            try{

                entry.audio.pause();

            }
            catch{

                // Ignore cleanup errors.

            }

        }

    }

}


/*
==========================================================
SYNC VIDEO AUDIO
==========================================================

Video elements themselves contain audio.

The same video element is used for visual preview and
therefore must be synchronized with the timeline.
==========================================================
*/

function getVideoAudioVolume(
    track,
    clip,
    time,
    transitionState = null
){

    if(
        !track ||
        !clip
    ){

        return 0;

    }

    if(
        !isTrackAudible(
            track
        )
    ){

        return 0;

    }

    if(
        clip.muted === true
    ){

        return 0;

    }

    let volume =
        Math.max(
            0,
            Math.min(
                1,
                safeNumber(
                    clip.volume,
                    1
                )
            )
        );

    volume *=
        getAudioFadeMultiplier(
            clip,
            time
        );

    /*
    ------------------------------------------------------
    Transition audio fade.
    ------------------------------------------------------
    */

    if(
        transitionState
    ){

        const p =
            transitionState.progress;

        if(
            transitionState.role ===
            "out"
        ){

            volume *=
                1 - p;

        }
        else if(
            transitionState.role ===
            "in"
        ){

            volume *=
                p;

        }

    }

    return Math.max(
        0,
        Math.min(
            1,
            volume
        )
    );

}


/*
==========================================================
SYNC VIDEO ELEMENT
==========================================================
*/

function syncVideoAudio(
    track,
    clip,
    video,
    time,
    transitionState = null
){

    if(
        !video ||
        !clip
    ){

        return;

    }

    const clipStart =
        getClipStart(
            clip
        );

    const clipOffset =
        Math.max(
            0,
            safeNumber(
                clip.offset,
                0
            )
        );

    const speed =
        Math.max(
            0.01,
            safeNumber(
                clip.speed,
                1
            )
        );

    const localTime =
        Math.max(
            0,
            time -
            clipStart
        );

    const videoTime =
        clipOffset +
        (
            localTime *
            speed
        );

    const volume =
        getVideoAudioVolume(
            track,
            clip,
            time,
            transitionState
        );

    video.volume =
        volume;

    video.muted =
        volume <= 0;

    try{

        video.playbackRate =
            speed;

    }
    catch{

        // Ignore playback rate errors.

    }

    if(
        video.readyState >= 1
    ){

        if(
            !Number.isFinite(
                video.currentTime
            ) ||
            Math.abs(
                video.currentTime -
                videoTime
            ) > 0.10
        ){

            try{

                video.currentTime =
                    videoTime;

            }
            catch{

                // Ignore seek errors.

            }

        }

    }

if(
    isPlaying.value
){

    playAudioElement(
        video
    );

}
else{

    if(
        !video.paused
    ){

        video.pause();

    }

}

}

/*
==========================================================
SYNC ALL VIDEO AUDIO
==========================================================
*/

function syncAllVideoAudio(
    time,
    transitionInfo = null
){

    const visibleVideoKeys =
        new Set();

    for(
        const track of
        videoStore.tracks
    ){

        if(!track)
            continue;

        const clips =
            Array.isArray(
                track.clips
            )
                ? track.clips
                : [];

        for(
            const clip of clips
        ){

            if(!clip)
                continue;

            if(
                clip.visible === false
            ){

                continue;

            }

            const media =
                getMediaForClip(
                    clip
                );

            if(
                !isVideoMedia(
                    media
                )
            ){

                continue;

            }

            const active =
                time >=
                    getClipStart(
                        clip
                    ) &&
                time <
                    getClipEnd(
                        clip
                    );

            const video =
                media?.url
                    ? loadVideo(
                        media.url
                    )
                    : null;

            if(!video)
                continue;

            const key =
                media.url;

            if(active){

                visibleVideoKeys.add(
                    key
                );

                let transitionState =
                    null;

                if(
                    transitionInfo
                ){

                    if(
                        transitionInfo.fromClip?.id ===
                        clip.id
                    ){

                        transitionState = {
                            type:
                                transitionInfo.type,
                            progress:
                                transitionInfo.progress,
                            role:
                                "out"
                        };

                    }
                    else if(
                        transitionInfo.toClip?.id ===
                        clip.id
                    ){

                        transitionState = {
                            type:
                                transitionInfo.type,
                            progress:
                                transitionInfo.progress,
                            role:
                                "in"
                        };

                    }

                }

                syncVideoAudio(
                    track,
                    clip,
                    video,
                    time,
                    transitionState
                );

            }

        }

    }

    /*
    ------------------------------------------------------
    Stop video elements which are not active.
    ------------------------------------------------------
    */

    for(
        const [
            url,
            video
        ] of
        videoCache.entries()
    ){

        if(
            !visibleVideoKeys.has(
                url
            )
        ){

            if(
                !video.paused
            ){

                video.pause();

            }

            video.volume = 0;

            video.muted = true;

        }

    }

}


/*
==========================================================
SYNC AUDIO SYSTEM
==========================================================
*/

function syncAudioSystem(
    time,
    transitionInfo = null
){

    syncAudioClips(
        time
    );

    syncAllVideoAudio(
        time,
        transitionInfo
    );

    lastAudioSyncTime =
        time;

}


/*
==========================================================
STOP ALL AUDIO
==========================================================
*/

function stopAllAudio(){

    for(
        const entry of
        audioCache.values()
    ){

        try{

            entry.audio.pause();

        }
        catch{

            // Ignore cleanup errors.

        }

    }

    for(
        const video of
        videoCache.values()
    ){

        try{

            video.pause();

            video.volume = 0;

            video.muted = true;

        }
        catch{

            // Ignore cleanup errors.

        }

    }

}


/*
==========================================================
AUDIO UNLOCK
==========================================================

Called from a user interaction so browsers can permit
audio playback.
==========================================================
*/

function unlockAudio(){

    audioUserGestureUnlocked = true;

    /*
    ------------------------------------------------------
    We intentionally do not play every audio element here.
    The actual playback starts in syncAudioSystem().
    ------------------------------------------------------
    */

    requestPreviewRender();

}


/*
==========================================================
TRANSITION LIST
==========================================================
*/

function getTransitions(){

    if(
        !Array.isArray(
            videoStore.transitions
        )
    ){

        return [];

    }

    return videoStore.transitions;

}


/*
==========================================================
TRANSITION CLIP IDS
==========================================================
*/

function getTransitionFromClipId(
    transition
){

    if(!transition)
        return null;

    return (
        transition.fromClipId ??
        transition.fromId ??
        transition.sourceClipId ??
        transition.clipId ??
        null
    );

}


function getTransitionToClipId(
    transition
){

    if(!transition)
        return null;

    return (
        transition.toClipId ??
        transition.toId ??
        transition.targetClipId ??
        transition.nextClipId ??
        null
    );

}


/*
==========================================================
TRANSITION TYPE
==========================================================
*/

function getTransitionType(
    transition
){

    if(!transition)
        return "fade";

    return String(
        transition.type ??
        transition.name ??
        transition.effect ??
        "fade"
    )
        .toLowerCase()
        .trim();

}


/*
==========================================================
TRANSITION DURATION
==========================================================
*/

function getTransitionDuration(
    transition
){

    if(!transition)
        return 0;

    const candidates = [
        transition.duration,
        transition.length,
        transition.durationSeconds
    ];

    for(
        const candidate of
        candidates
    ){

        const value =
            Number(candidate);

        if(
            Number.isFinite(value) &&
            value > 0
        ){

            return value;

        }

    }

    return 0;

}


/*
==========================================================
TRANSITION TIME RANGE
==========================================================
*/

function getTransitionExplicitStart(
    transition
){

    if(!transition)
        return null;

    const candidates = [
        transition.start,
        transition.startTime
    ];

    for(
        const candidate of
        candidates
    ){

        const value =
            Number(candidate);

        if(
            Number.isFinite(value)
        ){

            return value;

        }

    }

    return null;

}


function getTransitionExplicitEnd(
    transition
){

    if(!transition)
        return null;

    const candidates = [
        transition.end,
        transition.endTime
    ];

    for(
        const candidate of
        candidates
    ){

        const value =
            Number(candidate);

        if(
            Number.isFinite(value)
        ){

            return value;

        }

    }

    return null;

}


/*
==========================================================
FIND TRANSITION
==========================================================
*/

function getTransitionBetweenClips(
    fromClip,
    toClip
){

    if(
        !fromClip ||
        !toClip
    ){

        return null;

    }

    const transitions =
        getTransitions();

    if(
        transitions.length === 0
    ){

        return null;

    }

    const fromId =
        fromClip.id;

    const toId =
        toClip.id;

    let transition =
        transitions.find(
            item => {

                if(!item)
                    return false;

                const transitionFrom =
                    getTransitionFromClipId(
                        item
                    );

                const transitionTo =
                    getTransitionToClipId(
                        item
                    );

                return (
                    (
                        transitionFrom === fromId &&
                        transitionTo === toId
                    ) ||
                    (
                        transitionFrom === toId &&
                        transitionTo === fromId
                    )
                );

            }
        );

    if(transition)
        return transition;

    const boundary =
        getClipEnd(
            fromClip
        );

    transition =
        transitions.find(
            item => {

                if(!item)
                    return false;

                const explicitStart =
                    getTransitionExplicitStart(
                        item
                    );

                const explicitEnd =
                    getTransitionExplicitEnd(
                        item
                    );

                if(
                    explicitStart !== null &&
                    explicitEnd !== null
                ){

                    return (
                        boundary >= explicitStart &&
                        boundary <= explicitEnd
                    );

                }

                const transitionFrom =
                    getTransitionFromClipId(
                        item
                    );

                const transitionTo =
                    getTransitionToClipId(
                        item
                    );

                return (
                    transitionFrom === fromId ||
                    transitionTo === toId
                );

            }
        );

    return transition || null;

}


/*
==========================================================
FIND TRANSITION AT TIME
==========================================================
*/

function getTransitionAtTime(time){

    const clips =
        getAllClips()
            .filter(
                clip =>
                    clip.visible !== false &&
                    !isAudioMedia(
                        getMediaForClip(
                            clip
                        )
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    getClipStart(a) -
                    getClipStart(b)
            );

    if(
        clips.length < 2
    ){

        return null;

    }

    for(
        let index = 0;
        index <
        clips.length - 1;
        index++
    ){

        const fromClip =
            clips[index];

        const toClip =
            clips[index + 1];

        const transition =
            getTransitionBetweenClips(
                fromClip,
                toClip
            );

        if(!transition)
            continue;

        const duration =
            getTransitionDuration(
                transition
            );

        if(
            duration <= 0
        ){

            continue;

        }

        const explicitStart =
            getTransitionExplicitStart(
                transition
            );

        const explicitEnd =
            getTransitionExplicitEnd(
                transition
            );

        let start;
        let end;

        if(
            explicitStart !== null &&
            explicitEnd !== null &&
            explicitEnd > explicitStart
        ){

            start =
                explicitStart;

            end =
                explicitEnd;

        }
        else{

            const boundary =
                getClipStart(
                    toClip
                );

            start =
                boundary -
                duration / 2;

            end =
                boundary +
                duration / 2;

            const fromEnd =
                getClipEnd(
                    fromClip
                );

            const toStart =
                getClipStart(
                    toClip
                );

            if(
                fromEnd > toStart
            ){

                const overlapStart =
                    toStart;

                const overlapEnd =
                    Math.min(
                        fromEnd,
                        getClipEnd(
                            toClip
                        )
                    );

                if(
                    overlapEnd >
                    overlapStart
                ){

                    start =
                        overlapStart;

                    end =
                        overlapEnd;

                }

            }

        }

        if(
            time >= start &&
            time < end
        ){

            const progress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (
                            time -
                            start
                        ) /
                        Math.max(
                            0.0001,
                            end -
                            start
                        )
                    )
                );

            return {

                transition,
                fromClip,
                toClip,
                start,
                end,
                progress,
                type:
                    getTransitionType(
                        transition
                    )

            };

        }

    }

    return null;

}


/*
==========================================================
EASING
==========================================================
*/

function easeInOut(value){

    const t =
        Math.max(
            0,
            Math.min(
                1,
                value
            )
        );

    return (
        t < 0.5
            ? 2 * t * t
            : 1 -
                Math.pow(
                    -2 * t + 2,
                    2
                ) / 2
    );

}


/*
==========================================================
TRANSITION DRAW STATE
==========================================================
*/

function getTransitionState(
    transition,
    progress
){

    const type =
        getTransitionType(
            transition
        );

    const eased =
        easeInOut(
            progress
        );

    return {

        type,
        progress: eased

    };

}


/*
==========================================================
DRAW IMAGE
==========================================================
*/

function drawImageClip(
    ctx,
    canvas,
    clip,
    media,
    time,
    transitionState = null
){

    if(
        !clip ||
        !media ||
        !media.url
    ){

        return false;

    }

    const image =
        loadImage(
            media.url
        );

    if(!image)
        return false;

    if(
        !image.complete ||
        image.naturalWidth <= 0 ||
        image.naturalHeight <= 0
    ){

        return false;

    }

    const transform =
        getSafeTransform(
            clip
        );

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

    let drawScale =
        baseScale *
        (
            transform.scale /
            100
        );

    let centerX =
        canvas.width / 2 +
        transform.positionX;

    let centerY =
        canvas.height / 2 +
        transform.positionY;

    let opacity =
        (
            transform.opacity /
            100
        ) *
        getEffectOpacity(
            clip,
            time
        );

    let filter =
        getCanvasFilter(
            clip,
            time
        );

    let rotation =
        transform.rotation;

    if(
        transitionState
    ){

        const p =
            transitionState.progress;

        const type =
            transitionState.type;

        if(
            transitionState.role ===
            "out"
        ){

            opacity *=
                1 - p;

            if(
                type === "zoom" ||
                type === "zoom-in"
            ){

                drawScale *=
                    1 +
                    (
                        p * 0.18
                    );

            }

            if(
                type === "blur"
            ){

                const blurAmount =
                    p * 14;

                filter =
                    filter === "none"
                        ? `blur(${blurAmount}px)`
                        : `${filter} blur(${blurAmount}px)`;

            }

            if(
                type === "slide-left"
            ){

                centerX -=
                    canvas.width * p;

            }

            if(
                type === "slide-right"
            ){

                centerX +=
                    canvas.width * p;

            }

            if(
                type === "slide-up"
            ){

                centerY -=
                    canvas.height * p;

            }

            if(
                type === "slide-down"
            ){

                centerY +=
                    canvas.height * p;

            }

        }

        else if(
            transitionState.role ===
            "in"
        ){

            opacity *= p;

            if(
                type === "zoom" ||
                type === "zoom-in"
            ){

                drawScale *=
                    1.18 -
                    (
                        p * 0.18
                    );

            }

            if(
                type === "zoom-out"
            ){

                drawScale *=
                    0.82 +
                    (
                        p * 0.18
                    );

            }

            if(
                type === "blur"
            ){

                const blurAmount =
                    (
                        1 - p
                    ) * 14;

                filter =
                    filter === "none"
                        ? `blur(${blurAmount}px)`
                        : `${filter} blur(${blurAmount}px)`;

            }

            if(
                type === "slide-left"
            ){

                centerX +=
                    canvas.width *
                    (
                        1 - p
                    );

            }

            if(
                type === "slide-right"
            ){

                centerX -=
                    canvas.width *
                    (
                        1 - p
                    );

            }

            if(
                type === "slide-up"
            ){

                centerY +=
                    canvas.height *
                    (
                        1 - p
                    );

            }

            if(
                type === "slide-down"
            ){

                centerY -=
                    canvas.height *
                    (
                        1 - p
                    );

            }

        }

    }

    const rotationRadians =
        rotation *
        Math.PI /
        180;

    ctx.save();

    ctx.translate(
        centerX,
        centerY
    );

    ctx.rotate(
        rotationRadians
    );

    ctx.globalAlpha =
        Math.max(
            0,
            Math.min(
                1,
                opacity
            )
        );

    ctx.filter =
        filter;

    ctx.drawImage(
        image,
        -(
            imageWidth *
            drawScale
        ) / 2,
        -(
            imageHeight *
            drawScale
        ) / 2,
        imageWidth *
            drawScale,
        imageHeight *
            drawScale
    );

    ctx.restore();

    return true;

}


/*
==========================================================
DRAW VIDEO
==========================================================
*/

function drawVideoClip(
    ctx,
    canvas,
    clip,
    media,
    time,
    transitionState = null
){

    if(
        !clip ||
        !media ||
        !media.url
    ){

        return false;

    }

    const video =
        loadVideo(
            media.url
        );

    if(!video)
        return false;

    const clipStart =
        getClipStart(
            clip
        );

    const clipOffset =
        Math.max(
            0,
            safeNumber(
                clip.offset,
                0
            )
        );

    const speed =
        Math.max(
            0.01,
            safeNumber(
                clip.speed,
                1
            )
        );

    let videoTime =
        time -
        clipStart;

    videoTime =
        clipOffset +
        (
            videoTime *
            speed
        );

    if(
        Number.isFinite(
            video.duration
        ) &&
        video.duration > 0
    ){

        videoTime =
            Math.min(
                videoTime,
                video.duration
            );

    }

    videoTime =
        Math.max(
            0,
            videoTime
        );

    if(
        video.readyState >= 1
    ){

        if(
            !Number.isFinite(
                video.currentTime
            ) ||
            Math.abs(
                video.currentTime -
                videoTime
            ) > 0.08
        ){

            try{

                video.currentTime =
                    videoTime;

            }
            catch{

                // Ignore seek errors.

            }

        }

    }

    if(
        video.readyState < 2 ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
    ){

        return false;

    }

    const transform =
        getSafeTransform(
            clip
        );

    const videoWidth =
        video.videoWidth;

    const videoHeight =
        video.videoHeight;

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

    let drawScale =
        baseScale *
        (
            transform.scale /
            100
        );

    let centerX =
        canvas.width / 2 +
        transform.positionX;

    let centerY =
        canvas.height / 2 +
        transform.positionY;

    let opacity =
        (
            transform.opacity /
            100
        ) *
        getEffectOpacity(
            clip,
            time
        );

    let filter =
        getCanvasFilter(
            clip,
            time
        );

    if(
        transitionState
    ){

        const p =
            transitionState.progress;

        const type =
            transitionState.type;

        if(
            transitionState.role ===
            "out"
        ){

            opacity *=
                1 - p;

            if(
                type === "zoom" ||
                type === "zoom-in"
            ){

                drawScale *=
                    1 +
                    (
                        p * 0.18
                    );

            }

            if(
                type === "blur"
            ){

                const blurAmount =
                    p * 14;

                filter =
                    filter === "none"
                        ? `blur(${blurAmount}px)`
                        : `${filter} blur(${blurAmount}px)`;

            }

            if(
                type === "slide-left"
            ){

                centerX -=
                    canvas.width * p;

            }

            if(
                type === "slide-right"
            ){

                centerX +=
                    canvas.width * p;

            }

            if(
                type === "slide-up"
            ){

                centerY -=
                    canvas.height * p;

            }

            if(
                type === "slide-down"
            ){

                centerY +=
                    canvas.height * p;

            }

        }

        else if(
            transitionState.role ===
            "in"
        ){

            opacity *= p;

            if(
                type === "zoom" ||
                type === "zoom-in"
            ){

                drawScale *=
                    1.18 -
                    (
                        p * 0.18
                    );

            }

            if(
                type === "zoom-out"
            ){

                drawScale *=
                    0.82 +
                    (
                        p * 0.18
                    );

            }

            if(
                type === "blur"
            ){

                const blurAmount =
                    (
                        1 - p
                    ) * 14;

                filter =
                    filter === "none"
                        ? `blur(${blurAmount}px)`
                        : `${filter} blur(${blurAmount}px)`;

            }

            if(
                type === "slide-left"
            ){

                centerX +=
                    canvas.width *
                    (
                        1 - p
                    );

            }

            if(
                type === "slide-right"
            ){

                centerX -=
                    canvas.width *
                    (
                        1 - p
                    );

            }

            if(
                type === "slide-up"
            ){

                centerY +=
                    canvas.height *
                    (
                        1 - p
                    );

            }

            if(
                type === "slide-down"
            ){

                centerY -=
                    canvas.height *
                    (
                        1 - p
                    );

            }

        }

    }

    const rotation =
        transform.rotation *
        Math.PI /
        180;

    ctx.save();

    ctx.translate(
        centerX,
        centerY
    );

    ctx.rotate(
        rotation
    );

    ctx.globalAlpha =
        Math.max(
            0,
            Math.min(
                1,
                opacity
            )
        );

    ctx.filter =
        filter;

    ctx.drawImage(
        video,
        -(
            videoWidth *
            drawScale
        ) / 2,
        -(
            videoHeight *
            drawScale
        ) / 2,
        videoWidth *
            drawScale,
        videoHeight *
            drawScale
    );

    ctx.restore();

    /*
    ------------------------------------------------------
    Video audio synchronization is handled separately.
    ------------------------------------------------------
    */

    return true;

}


/*
==========================================================
DRAW CLIP
==========================================================
*/

function drawClip(
    ctx,
    canvas,
    clip,
    time,
    transitionState = null
){

    const media =
        getMediaForClip(
            clip
        );

    if(!media)
        return false;

    const mediaType =
        String(
            media.type || ""
        ).toLowerCase();

    if(
        mediaType === "image" ||
        mediaType === "gif"
    ){

        return drawImageClip(
            ctx,
            canvas,
            clip,
            media,
            time,
            transitionState
        );

    }

    if(
        mediaType === "video" ||
        mediaType.startsWith(
            "video/"
        )
    ){

        return drawVideoClip(
            ctx,
            canvas,
            clip,
            media,
            time,
            transitionState
        );

    }

    return false;

}


/*
==========================================================
RENDER NORMAL CLIP
==========================================================
*/

function renderSingleClip(
    ctx,
    canvas,
    clip,
    time
){

    drawClip(
        ctx,
        canvas,
        clip,
        time,
        null
    );

}


/*
==========================================================
RENDER TRANSITION
==========================================================
*/

function renderTransition(
    ctx,
    canvas,
    transitionInfo,
    time
){

    if(!transitionInfo)
        return false;

    const {
        transition,
        fromClip,
        toClip,
        progress
    } =
        transitionInfo;

    if(
        !fromClip ||
        !toClip
    ){

        return false;

    }

    const state =
        getTransitionState(
            transition,
            progress
        );

    drawClip(
        ctx,
        canvas,
        fromClip,
        time,
        {
            ...state,
            role: "out"
        }
    );

    drawClip(
        ctx,
        canvas,
        toClip,
        time,
        {
            ...state,
            role: "in"
        }
    );

    return true;

}


/*
==========================================================
RENDER PREVIEW
==========================================================
*/

function renderPreview(
    timestamp
){

    const canvas =
        previewCanvas.value;

    if(!canvas){

        lastFrameTime = null;

        return;

    }

    const ctx =
        canvas.getContext(
            "2d"
        );

    if(!ctx)
        return;

    const now =
        timestamp ??
        performance.now();

    if(
        lastFrameTime === null
    ){

        lastFrameTime =
            now;

    }

    const delta =
        Math.min(
            0.1,
            Math.max(
                0,
                (
                    now -
                    lastFrameTime
                ) / 1000
            )
        );

    lastFrameTime =
        now;

    /*
    ------------------------------------------------------
    PLAYBACK
    ------------------------------------------------------
    */

    videoStore.updatePlayback(
        delta
    );

    /*
    ------------------------------------------------------
    CURRENT TIME
    ------------------------------------------------------
    */

    const time =
        safeNumber(
            currentTime.value,
            0
        );

    /*
    ------------------------------------------------------
    TRANSITION
    ------------------------------------------------------
    */

    const transitionInfo =
        getTransitionAtTime(
            time
        );

    /*
    ------------------------------------------------------
    AUDIO
    ------------------------------------------------------
    */

    syncAudioSystem(
        time,
        transitionInfo
    );

    /*
    ------------------------------------------------------
    RESET
    ------------------------------------------------------
    */

    ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
    );

    ctx.globalAlpha = 1;

    ctx.filter =
        "none";

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /*
    ------------------------------------------------------
    BACKGROUND
    ------------------------------------------------------
    */

    ctx.fillStyle =
        "#181818";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /*
    ------------------------------------------------------
    TRANSITION FIRST
    ------------------------------------------------------
    */

    if(
        transitionInfo
    ){

        renderTransition(
            ctx,
            canvas,
            transitionInfo,
            time
        );

        scheduleNextFrame();

        return;

    }

    /*
    ------------------------------------------------------
    NORMAL ACTIVE CLIP
    ------------------------------------------------------
    */

    const activeClip =
        getActiveClip(
            time
        );

    if(!activeClip){

        scheduleNextFrame();

        return;

    }

    renderSingleClip(
        ctx,
        canvas,
        activeClip,
        time
    );

    scheduleNextFrame();

}


/*
==========================================================
NEXT FRAME
==========================================================
*/

function scheduleNextFrame(){

    if(
        animationFrame !== null
    ){

        cancelAnimationFrame(
            animationFrame
        );

    }

    animationFrame =
        requestAnimationFrame(
            renderPreview
        );

}


/*
==========================================================
RESTART PREVIEW
==========================================================
*/

function restartPreview(){

    lastFrameTime = null;

    lastAudioSyncTime = null;

    resizeCanvas();

    requestPreviewRender();

}


/*
==========================================================
WATCH MEDIA
==========================================================
*/

watch(
    () => videoStore.media.length,
    async () => {

        await nextTick();

        restartPreview();

    }
);


/*
==========================================================
WATCH TRACKS
==========================================================
*/

watch(
    () => videoStore.tracks,
    async () => {

        await nextTick();

        restartPreview();

    },
    {
        deep: true
    }
);


/*
==========================================================
WATCH EFFECTS
==========================================================
*/

watch(
    () => videoStore.effects,
    async () => {

        await nextTick();

        restartPreview();

    },
    {
        deep: true
    }
);


/*
==========================================================
WATCH TRANSITIONS
==========================================================
*/

watch(
    () => videoStore.transitions,
    async () => {

        await nextTick();

        restartPreview();

    },
    {
        deep: true
    }
);


/*
==========================================================
WATCH CURRENT TIME
==========================================================
*/

watch(
    () => videoStore.currentTime,
    () => {

        /*
        --------------------------------------------------
        Seek immediately when playhead changes.
        --------------------------------------------------
        */

        syncAudioSystem(
            safeNumber(
                videoStore.currentTime,
                0
            ),
            getTransitionAtTime(
                safeNumber(
                    videoStore.currentTime,
                    0
                )
            )
        );

        requestPreviewRender();

    }
);


/*
==========================================================
WATCH PLAYBACK
==========================================================
*/

watch(
    () => videoStore.isPlaying,
    () => {

        const time =
            safeNumber(
                videoStore.currentTime,
                0
            );

        if(
            videoStore.isPlaying
        ){

            unlockAudio();

            syncAudioSystem(
                time,
                getTransitionAtTime(
                    time
                )
            );

        }
        else{

            stopAllAudio();

        }

        requestPreviewRender();

    }
);


/*
==========================================================
LIFECYCLE
==========================================================
*/

onMounted(
    async () => {

        await nextTick();

        resizeCanvas();

        renderPreview();

        requestAnimationFrame(
            () => {

                resizeCanvas();

                requestPreviewRender();

            }
        );

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

    }
);


onUnmounted(
    () => {

        if(
            animationFrame !== null
        ){

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;

        }

        /*
        --------------------------------------------------
        Stop audio clips.
        --------------------------------------------------
        */

        for(
            const entry of
            audioCache.values()
        ){

            try{

                entry.audio.pause();

                entry.audio.src = "";

                entry.audio.load();

            }
            catch{

                // Ignore cleanup errors.

            }

        }

        audioCache.clear();

        /*
        --------------------------------------------------
        Stop video elements.
        --------------------------------------------------
        */

        for(
            const video of
            videoCache.values()
        ){

            try{

                video.pause();

                video.src = "";

                video.load();

            }
            catch{

                // Ignore cleanup errors.

            }

        }

        videoCache.clear();

        imageCache.clear();

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

    }
);

</script>


<template>

<div class="preview-canvas">

    <!-- ================================================== -->
    <!-- TOP TOOLBAR -->
    <!-- ================================================== -->

    <div class="preview-toolbar">

        <div class="toolbar-left">

            <button
                @click="zoomOut"
                title="Zoom Out"
            >
                −
            </button>

            <button
                @click="zoom100"
                title="100%"
            >
                100%
            </button>

            <button
                @click="zoomIn"
                title="Zoom In"
            >
                +
            </button>

            <button
                @click="fitScreen"
                title="Fit"
            >
                Fit
            </button>

            <button
                @click="resetView"
                title="Reset View"
            >
                Reset
            </button>

        </div>


        <div class="toolbar-center">

            <span>
                {{ project.width }} × {{ project.height }}
            </span>

            <span class="separator">
                •
            </span>

            <span>
                {{ project.fps }} FPS
            </span>

            <span class="separator">
                •
            </span>

            <span>
                {{ previewQuality }}
            </span>

        </div>


        <div class="toolbar-right">

            <span class="preview-status">
                Preview
            </span>

        </div>

    </div>


    <!-- ================================================== -->
    <!-- CANVAS -->
    <!-- ================================================== -->

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
                    `translate(${panX}px, ${panY}px) scale(${zoom / 100})`
            }"
        />

    </div>


    <!-- ================================================== -->
    <!-- PLAYBACK -->
    <!-- ================================================== -->

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
                @click="
                    unlockAudio();
                    videoStore.play();
                "
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


        <div class="playback-center">

            <div class="timecode">

                {{ currentTime.toFixed(2) }}s

            </div>

            <div class="frame">

                Frame {{ currentFrame }}

            </div>

        </div>


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

    overflow:hidden;

    background:#1b1b1b;

    color:#ffffff;

}


/* ====================================================== */
/* TOOLBAR */
/* ====================================================== */

.preview-toolbar{

    flex:0 0 50px;

    height:50px;

    display:flex;

    align-items:center;

    justify-content:space-between;

    padding:0 14px;

    background:#272727;

    border-bottom:1px solid #3a3a3a;

}


.toolbar-left,
.toolbar-center,
.toolbar-right{

    display:flex;

    align-items:center;

    gap:9px;

}


.toolbar-center{

    color:#bdbdbd;

    font-size:13px;

}


.separator{

    color:#666666;

}


.preview-status{

    font-size:12px;

    color:#8f8f8f;

}


/* ====================================================== */
/* TOOLBAR BUTTONS */
/* ====================================================== */

.preview-toolbar button{

    min-width:40px;

    height:32px;

    padding:0 10px;

    border:none;

    border-radius:6px;

    background:#353535;

    color:#ffffff;

    cursor:pointer;

    transition:
        background .15s ease,
        transform .1s ease;

}


.preview-toolbar button:hover{

    background:#3b82f6;

}


.preview-toolbar button:active{

    transform:scale(.96);

}


/* ====================================================== */
/* CANVAS WRAPPER */
/* ====================================================== */

.canvas-wrapper{

    position:relative;

    flex:1;

    min-height:0;

    overflow:hidden;

    display:flex;

    align-items:center;

    justify-content:center;

    background:#101010;

}


/* ====================================================== */
/* CANVAS */
/* ====================================================== */

.preview-screen{

    display:block;

    flex:none;

    background:#181818;

    border:1px solid #3c3c3c;

    box-shadow:
        0 15px 40px rgba(0,0,0,.45);

    transform-origin:center center;

    will-change:transform;

    backface-visibility:hidden;

}


/* ====================================================== */
/* PLAYBACK */
/* ====================================================== */

.preview-playback{

    flex:0 0 56px;

    height:56px;

    display:flex;

    align-items:center;

    justify-content:space-between;

    padding:0 16px;

    background:#262626;

    border-top:1px solid #3a3a3a;

}


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
        background .15s ease,
        transform .1s ease;

}


.preview-playback button:hover{

    background:#3b82f6;

}


.preview-playback button:active{

    transform:scale(.96);

}


/* ====================================================== */
/* TIMECODE */
/* ====================================================== */

.playback-center{

    min-width:150px;

    justify-content:center;

    gap:12px;

    padding:6px 12px;

    border-radius:8px;

    background:#2f2f2f;

}


.timecode{

    min-width:70px;

    text-align:center;

    font-size:14px;

    font-weight:600;

}


.frame{

    min-width:75px;

    text-align:center;

    font-size:12px;

    color:#a9a9a9;

}


/* ====================================================== */
/* ZOOM */
/* ====================================================== */

.playback-right{

    min-width:90px;

    justify-content:flex-end;

    color:#a9a9a9;

    font-size:13px;

}


.playback-right strong{

    color:#ffffff;

    font-size:14px;

}


/* ====================================================== */
/* RESPONSIVE */
/* ====================================================== */

@media(max-width:900px){

    .preview-toolbar{

        height:auto;

        min-height:50px;

        flex-wrap:wrap;

        padding:8px 10px;

        gap:8px;

    }


    .toolbar-left,
    .toolbar-center,
    .toolbar-right{

        flex-wrap:wrap;

        justify-content:center;

    }


    .toolbar-left{

        width:100%;

    }


    .toolbar-center{

        width:100%;

    }


    .toolbar-right{

        display:none;

    }


    .preview-playback{

        height:auto;

        min-height:56px;

        flex-wrap:wrap;

        padding:8px;

        gap:8px;

    }


    .playback-left,
    .playback-center,
    .playback-right{

        flex:1;

        justify-content:center;

    }

}


@media(max-width:600px){

    .preview-toolbar button{

        min-width:34px;

        height:32px;

        padding:0 7px;

        font-size:12px;

    }


    .toolbar-center{

        font-size:11px;

    }


    .preview-playback button{

        width:34px;

        height:34px;

        font-size:12px;

    }


    .playback-center{

        min-width:120px;

    }


    .timecode{

        min-width:55px;

        font-size:12px;

    }


    .frame{

        min-width:55px;

        font-size:11px;

    }

}


/* ====================================================== */
/* ACCESSIBILITY */
/* ====================================================== */

.preview-toolbar button:focus-visible,
.preview-playback button:focus-visible{

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
/* REDUCE MOTION */
/* ====================================================== */

@media(prefers-reduced-motion:reduce){

    .preview-toolbar button,
    .preview-playback button{

        transition:none;

    }

}


/* ====================================================== */
/* END */
/* ====================================================== */

</style>