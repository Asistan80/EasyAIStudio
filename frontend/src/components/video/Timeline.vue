```vue
<script setup>

import {
    computed,
    ref,
    onMounted,
    onBeforeUnmount
} from "vue";

import {
    useVideoStore
} from "../../stores/videoStore";

const videoStore = useVideoStore();

/*
==========================================================
STORE
==========================================================
*/

const tracks = computed(() => {
    return videoStore.tracks;
});

const transitions = computed(() => {
    return videoStore.transitions;
});

const media = computed(() => {
    return videoStore.media;
});

const selectedTrackId = computed(() => {
    return videoStore.selectedTrackId;
});

const selectedClipId = computed(() => {
    return videoStore.selectedClipId;
});

/*
==========================================================
TIMELINE
==========================================================
*/

const pixelsPerSecond = ref(80);

const timelineBody = ref(null);

/*
==========================================================
PLAYHEAD
==========================================================
*/

const currentTime = computed(() => {
    return Number(videoStore.currentTime) || 0;
});

const playheadStyle = computed(() => {
    return {
        left:
            `${150 + (currentTime.value * pixelsPerSecond.value)}px`
    };
});

function getTimelineTime(event) {

    if (!timelineBody.value) {
        return 0;
    }

    const rect =
        timelineBody.value.getBoundingClientRect();

    const scrollLeft =
        timelineBody.value.scrollLeft || 0;

    const x =
        event.clientX -
        rect.left -
        150 +
        scrollLeft;

    return Math.max(
        0,
        x / pixelsPerSecond.value
    );
}

function seekFromTimeline(event) {

    if (isDragging.value) {
        return;
    }

    if (isResizing.value) {
        return;
    }

    if (isDraggingPlayhead.value) {
        return;
    }

    const time =
        getTimelineTime(event);

    videoStore.seek(time);
}

/*
==========================================================
PLAYHEAD DRAG
==========================================================
*/

const isDraggingPlayhead = ref(false);

function startPlayheadDrag(event) {

    event.preventDefault();
    event.stopPropagation();

    isDraggingPlayhead.value = true;

    document.body.style.userSelect = "none";

    window.addEventListener(
        "pointermove",
        onPlayheadDrag
    );

    window.addEventListener(
        "pointerup",
        stopPlayheadDrag
    );

    updatePlayheadFromPointer(event);
}

function onPlayheadDrag(event) {

    if (!isDraggingPlayhead.value) {
        return;
    }

    updatePlayheadFromPointer(event);
}

function updatePlayheadFromPointer(event) {

    const time =
        getTimelineTime(event);

    videoStore.seek(time);
}

function stopPlayheadDrag() {

    isDraggingPlayhead.value = false;

    document.body.style.userSelect = "";

    window.removeEventListener(
        "pointermove",
        onPlayheadDrag
    );

    window.removeEventListener(
        "pointerup",
        stopPlayheadDrag
    );
}

/*
==========================================================
MEDIA
==========================================================
*/

function getMedia(clip) {

    if (!clip) {
        return null;
    }

    return media.value.find(
        item => item.id === clip.mediaId
    ) || null;
}

/*
==========================================================
CLIP POSITION
==========================================================
*/

function clipStyle(clip) {

    const duration = Math.max(
        0.2,
        Number(clip.duration) || 0.2
    );

    const start = Math.max(
        0,
        Number(clip.start) || 0
    );

    return {

        left:
            `${start * pixelsPerSecond.value}px`,

        width:
            `${Math.max(
                70,
                duration * pixelsPerSecond.value
            )}px`

    };
}

/*
==========================================================
TRANSITION HELPERS
==========================================================
*/

function getTransitionBetween(
    fromClipId,
    toClipId
) {

    return transitions.value.find(
        transition =>
            transition.fromClipId === fromClipId &&
            transition.toClipId === toClipId
    ) || null;
}

function transitionStyle(
    transition,
    fromClip,
    toClip
) {

    if (
        !transition ||
        !fromClip ||
        !toClip
    ) {
        return {};
    }

    const fromStart =
        Number(fromClip.start) || 0;

    const fromDuration =
        Math.max(
            0.2,
            Number(fromClip.duration) || 0.2
        );

    const toStart =
        Number(toClip.start) || 0;

    const duration =
        Math.max(
            0.1,
            Number(transition.duration) || 0.1
        );

    const transitionStart =
        Math.max(
            fromStart + fromDuration - duration / 2,
            toStart - duration / 2
        );

    return {

        left:
            `${transitionStart * pixelsPerSecond.value}px`,

        width:
            `${Math.max(
                34,
                duration * pixelsPerSecond.value
            )}px`

    };
}

function transitionLabel(
    transition
) {

    if (!transition) {
        return "Transition";
    }

    return (
        transition.name ||
        transition.type ||
        "Transition"
    );
}

/*
==========================================================
CLIP DRAG
==========================================================
*/

const isDragging = ref(false);

const dragState = ref(null);

function startClipDrag(
    event,
    track,
    clip
) {

    if (!track || track.locked) {
        return;
    }

    if (
        event.button !== 0 ||
        event.target.closest(".clip-resize-handle")
    ) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    selectClip(
        track,
        clip
    );

    isDragging.value = true;

    dragState.value = {

        trackId: track.id,

        clipId: clip.id,

        startX: event.clientX,

        originalStart:
            Number(clip.start) || 0

    };

    document.body.style.userSelect = "none";

    window.addEventListener(
        "pointermove",
        onClipDrag
    );

    window.addEventListener(
        "pointerup",
        stopClipDrag
    );
}

function onClipDrag(event) {

    if (
        !isDragging.value ||
        !dragState.value
    ) {
        return;
    }

    const deltaPixels =
        event.clientX -
        dragState.value.startX;

    const deltaTime =
        deltaPixels /
        pixelsPerSecond.value;

    const newStart =
        Math.max(
            0,
            dragState.value.originalStart +
            deltaTime
        );

    videoStore.moveClip(

        dragState.value.trackId,

        dragState.value.clipId,

        newStart

    );
}

function stopClipDrag() {

    if (!isDragging.value) {
        return;
    }

    isDragging.value = false;

    dragState.value = null;

    document.body.style.userSelect = "";

    window.removeEventListener(
        "pointermove",
        onClipDrag
    );

    window.removeEventListener(
        "pointerup",
        stopClipDrag
    );
}

/*
==========================================================
CLIP RESIZE
==========================================================
*/

const isResizing = ref(false);

const resizeState = ref(null);

function startClipResize(
    event,
    track,
    clip
) {

    if (!track || track.locked) {
        return;
    }

    if (event.button !== 0) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    selectClip(
        track,
        clip
    );

    isResizing.value = true;

    resizeState.value = {

        trackId: track.id,

        clipId: clip.id,

        startX: event.clientX,

        originalDuration:
            Math.max(
                0.2,
                Number(clip.duration) || 0.2
            )

    };

    document.body.style.userSelect = "none";

    window.addEventListener(
        "pointermove",
        onClipResize
    );

    window.addEventListener(
        "pointerup",
        stopClipResize
    );
}

function onClipResize(event) {

    if (
        !isResizing.value ||
        !resizeState.value
    ) {
        return;
    }

    const deltaPixels =
        event.clientX -
        resizeState.value.startX;

    const deltaTime =
        deltaPixels /
        pixelsPerSecond.value;

    const newDuration =
        Math.max(
            0.2,
            resizeState.value.originalDuration +
            deltaTime
        );

    videoStore.resizeClip(

        resizeState.value.trackId,

        resizeState.value.clipId,

        newDuration

    );
}

function stopClipResize() {

    if (!isResizing.value) {
        return;
    }

    isResizing.value = false;

    resizeState.value = null;

    document.body.style.userSelect = "";

    window.removeEventListener(
        "pointermove",
        onClipResize
    );

    window.removeEventListener(
        "pointerup",
        stopClipResize
    );
}

/*
==========================================================
SELECTION
==========================================================
*/

function selectClip(track, clip) {

    if (!track || !clip) {
        return;
    }

    videoStore.selectClip(
        track.id,
        clip.id
    );
}

/*
==========================================================
TRACK SELECTION
==========================================================
*/

function selectTrack(track) {

    if (!track) {
        return;
    }

    videoStore.selectedTrackId =
        track.id;
}

/*
==========================================================
SPLIT / CUT
==========================================================
*/

const canSplit = computed(() => {

    if (
        selectedTrackId.value === null ||
        selectedClipId.value === null
    ) {
        return false;
    }

    const track =
        tracks.value.find(
            item =>
                item.id ===
                selectedTrackId.value
        );

    if (!track) {
        return false;
    }

    const clip =
        track.clips.find(
            item =>
                item.id ===
                selectedClipId.value
        );

    if (!clip) {
        return false;
    }

    const start =
        Number(clip.start) || 0;

    const duration =
        Number(clip.duration) || 0;

    const end =
        start + duration;

    const time =
        currentTime.value;

    return (
        !track.locked &&
        time > start + 0.05 &&
        time < end - 0.05
    );
});

function splitSelectedClip() {

    if (!canSplit.value) {
        return;
    }

    videoStore.splitClip(
        selectedTrackId.value,
        selectedClipId.value,
        currentTime.value
    );
}

/*
==========================================================
KEYBOARD SHORTCUT
==========================================================
*/

function onKeyDown(event) {

    const target =
        event.target;

    const tagName =
        target?.tagName;

    const isTyping =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target?.isContentEditable;

    if (isTyping) {
        return;
    }

    /*
    ==========================================================
    COPY
    ==========================================================
    */

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "c"
    ) {

        event.preventDefault();

        videoStore.copyClip();

        return;
    }

    /*
    ==========================================================
    PASTE
    ==========================================================
    */

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "v"
    ) {

        event.preventDefault();

        videoStore.pasteClip();

        return;
    }

    /*
    ==========================================================
    SPLIT
    ==========================================================
    */

    if (
        event.key.toLowerCase() === "s"
    ) {

        event.preventDefault();

        splitSelectedClip();

        return;
    }

    /*
    ==========================================================
    DELETE
    ==========================================================
    */

    if (
        event.key === "Delete" ||
        event.key === "Backspace"
    ) {

        if (
            selectedTrackId.value !== null &&
            selectedClipId.value !== null
        ) {

            event.preventDefault();

            videoStore.removeClip(
                selectedTrackId.value,
                selectedClipId.value
            );
        }

        return;
    }

    /*
    ==========================================================
    SPACE
    ==========================================================
    */

    if (event.code === "Space") {

        event.preventDefault();

        if (videoStore.isPlaying) {
            videoStore.pause();
        } else {
            videoStore.play();
        }

        return;
    }

    /*
    ==========================================================
    HOME
    ==========================================================
    */

    if (event.key === "Home") {

        event.preventDefault();

        goToStart();

        return;
    }

    /*
    ==========================================================
    END
    ==========================================================
    */

    if (event.key === "End") {

        event.preventDefault();

        goToEnd();

    }
}

/*
==========================================================
PLAYBACK
==========================================================
*/

function goToStart() {

    videoStore.seek(0);
}

function play() {

    videoStore.play();
}

function pause() {

    videoStore.pause();
}

function goToEnd() {

    let end = 0;

    tracks.value.forEach(track => {

        if (!track || !Array.isArray(track.clips)) {
            return;
        }

        track.clips.forEach(clip => {

            const clipEnd =

                Number(clip.start || 0) +

                Number(clip.duration || 0);

            if (clipEnd > end) {

                end = clipEnd;
            }
        });
    });

    videoStore.seek(end);
}

/*
==========================================================
TRANSITION SELECTION
==========================================================
*/

function selectTransition(transition) {

    if (
        !transition ||
        transition.id === undefined ||
        transition.id === null
    ) {
        return;
    }

    if (
        typeof videoStore.selectTransition ===
        "function"
    ) {

        videoStore.selectTransition(
            transition.id
        );
    }
}

/*
==========================================================
MOUNT
==========================================================
*/

onMounted(() => {

    window.addEventListener(
        "keydown",
        onKeyDown
    );

});

/*
==========================================================
CLEANUP
==========================================================
*/

onBeforeUnmount(() => {

    stopPlayheadDrag();

    stopClipDrag();

    stopClipResize();

    window.removeEventListener(
        "keydown",
        onKeyDown
    );

    document.body.style.userSelect = "";

});

</script>

<template>

<div class="timeline">

    <!-- ================================================== -->
    <!-- HEADER -->
    <!-- ================================================== -->

    <div class="timeline-header">

        <div class="timeline-title">

            <h3>
                Timeline
            </h3>

        </div>

        <div class="timeline-controls">

            <button
                type="button"
                @click="goToStart"
                title="First Frame"
            >
                ⏮
            </button>

            <button
                type="button"
                @click="play"
                title="Play"
            >
                ▶
            </button>

            <button
                type="button"
                @click="pause"
                title="Pause"
            >
                ⏸
            </button>

            <button
                type="button"
                @click="
                    videoStore.removeClip(
                        selectedTrackId,
                        selectedClipId
                    )
                "
                :disabled="
                    selectedTrackId === null ||
                    selectedClipId === null
                "
                title="Delete Clip"
                class="delete-button"
            >
                🗑
            </button>

            <button
                type="button"
                @click="
                    videoStore.duplicateClip(
                        selectedTrackId,
                        selectedClipId
                    )
                "
                :disabled="
                    selectedTrackId === null ||
                    selectedClipId === null
                "
                title="Duplicate Clip"
                class="duplicate-button"
            >
                ⧉
            </button>

            <button
                type="button"
                @click="videoStore.copyClip()"
                :disabled="
                    selectedTrackId === null ||
                    selectedClipId === null
                "
                title="Copy Clip"
                class="copy-button"
            >
                📋
            </button>

            <button
                type="button"
                @click="videoStore.pasteClip()"
                title="Paste Clip"
                class="paste-button"
            >
                📥
            </button>

            <button
                type="button"
                @click="videoStore.undo()"
                title="Undo"
                class="undo-button"
            >
                ↶
            </button>

            <button
                type="button"
                @click="videoStore.redo()"
                title="Redo"
                class="redo-button"
            >
                ↷
            </button>

            <button
                type="button"
                @click="splitSelectedClip"
                :disabled="!canSplit"
                title="Split Clip"
                class="split-button"
            >
                ✂️
            </button>

            <button
                type="button"
                @click="goToEnd"
                title="Last Frame"
            >
                ⏭
            </button>

        </div>

    </div>

    <!-- ================================================== -->
    <!-- RULER -->
    <!-- ================================================== -->

    <div class="timeline-ruler">

        <div class="track-label-space"></div>

        <div
            class="ruler-area"
            @pointerdown="seekFromTimeline"
        >

            <div
                v-for="second in 31"
                :key="second"
                class="ruler-mark"
                :style="{
                    left:
                        ((second - 1) *
                        pixelsPerSecond) + 'px'
                }"
            >

                <span>
                    {{ second - 1 }}s
                </span>

            </div>

        </div>

    </div>

    <!-- ================================================== -->
    <!-- BODY -->
    <!-- ================================================== -->

    <div
        ref="timelineBody"
        class="timeline-body"
    >

        <!-- ================================================== -->
        <!-- PLAYHEAD -->
        <!-- ================================================== -->

        <div
            class="timeline-playhead"
            :style="playheadStyle"
            @pointerdown="startPlayheadDrag"
        >

            <div class="playhead-head"></div>

            <div class="playhead-line"></div>

        </div>

        <!-- ================================================== -->
        <!-- EMPTY -->
        <!-- ================================================== -->

        <div
            v-if="tracks.length === 0"
            class="empty-timeline"
        >

            <div class="empty-icon">
                🎬
            </div>

            <div class="empty-title">
                No Tracks
            </div>

            <div class="empty-text">
                Add media to the timeline.
            </div>

        </div>

        <!-- ================================================== -->
        <!-- TRACKS -->
        <!-- ================================================== -->

        <div
            v-for="track in tracks"
            :key="track.id"
            class="timeline-track"
        >

            <!-- TRACK HEADER -->

            <div
                class="track-header"
                :class="{
                    selected:
                        selectedTrackId === track.id
                }"
                @click="selectTrack(track)"
            >

                <div class="track-name">

                    {{ track.name }}

                </div>

                <div class="track-type">

                    {{ track.type }}

                </div>

                <div class="track-controls">

                    <!-- VISIBILITY -->

                    <button
                        type="button"
                        class="track-control-button"
                        :class="{
                            active: track.visible
                        }"
                        @click.stop="
                            videoStore.toggleTrackVisible(
                                track.id
                            )
                        "
                        :title="
                            track.visible
                                ? 'Hide Track'
                                : 'Show Track'
                        "
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <path
                                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                            />

                            <circle
                                cx="12"
                                cy="12"
                                r="3"
                            />

                        </svg>

                    </button>

                    <!-- LOCK -->

                    <button
                        type="button"
                        class="track-control-button"
                        :class="{
                            active: track.locked
                        }"
                        @click.stop="
                            videoStore.toggleTrackLocked(
                                track.id
                            )
                        "
                        :title="
                            track.locked
                                ? 'Unlock Track'
                                : 'Lock Track'
                        "
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <rect
                                x="5"
                                y="10"
                                width="14"
                                height="10"
                                rx="2"
                            />

                            <path
                                d="M8 10V7a4 4 0 0 1 8 0v3"
                            />

                        </svg>

                    </button>

                    <!-- MUTE -->

                    <button
                        type="button"
                        class="track-control-button"
                        :class="{
                            active: track.muted
                        }"
                        @click.stop="
                            videoStore.toggleTrackMute(
                                track.id
                            )
                        "
                        :title="
                            track.muted
                                ? 'Unmute Track'
                                : 'Mute Track'
                        "
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <path
                                d="M4 10v4h4l5 4V6l-5 4H4Z"
                            />

                            <path
                                v-if="!track.muted"
                                d="M16 9a4 4 0 0 1 0 6"
                            />

                            <path
                                v-if="!track.muted"
                                d="M18.5 6.5a8 8 0 0 1 0 11"
                            />

                            <path
                                v-if="track.muted"
                                d="m16 9 5 6"
                            />

                            <path
                                v-if="track.muted"
                                d="m21 9-5 6"
                            />

                        </svg>

                    </button>

                    <!-- SOLO -->

                    <button
                        type="button"
                        class="track-control-button solo-button"
                        :class="{
                            active: track.solo
                        }"
                        @click.stop="
                            videoStore.toggleTrackSolo(
                                track.id
                            )
                        "
                        :title="
                            track.solo
                                ? 'Disable Solo'
                                : 'Solo Track'
                        "
                    >
                        S
                    </button>

                </div>

            </div>

            <!-- TRACK CONTENT -->

            <div
                class="track-content"
                @pointerdown="seekFromTimeline"
            >

                <!-- ================================================== -->
                <!-- CLIPS -->
                <!-- ================================================== -->

                <div
                    v-if="
                        !Array.isArray(track.clips) ||
                        track.clips.length === 0
                    "
                    class="empty-track"
                >
                    Empty Track
                </div>

                <div
                    v-for="clip in track.clips"
                    :key="clip.id"
                    v-show="track.visible"
                    class="timeline-clip"
                    :class="{
                        selected:
                            selectedTrackId === track.id &&
                            selectedClipId === clip.id
                    }"
                    :style="clipStyle(clip)"
                    @pointerdown="
                        startClipDrag(
                            $event,
                            track,
                            clip
                        )
                    "
                >

                    <!-- LEFT RESIZE HANDLE -->

                    <div
                        class="clip-resize-handle clip-resize-left"
                        @pointerdown.stop="
                            startClipResize(
                                $event,
                                track,
                                clip
                            )
                        "
                    ></div>

                    <!-- THUMBNAIL -->

                    <div class="clip-thumbnail">

                        <img
                            v-if="
                                getMedia(clip) &&
                                getMedia(clip).thumbnail
                            "
                            :src="
                                getMedia(clip).thumbnail
                            "
                            alt=""
                            draggable="false"
                        />

                        <span v-else>

                            {{
                                getMedia(clip)?.type ===
                                "image"
                                    ? "🖼️"
                                    : getMedia(clip)?.type ===
                                      "audio"
                                        ? "🎵"
                                        : "🎬"
                            }}

                        </span>

                    </div>

                    <!-- INFO -->

                    <div class="clip-info">

                        <div class="clip-name">

                            {{
                                getMedia(clip)?.name ||
                                clip.name ||
                                "Media"
                            }}

                        </div>

                        <div class="clip-duration">

                            {{
                                Number(
                                    clip.duration || 0
                                ).toFixed(1)
                            }}s

                        </div>

                    </div>

                    <!-- RIGHT RESIZE HANDLE -->

                    <div
                        class="clip-resize-handle clip-resize-right"
                        @pointerdown.stop="
                            startClipResize(
                                $event,
                                track,
                                clip
                            )
                        "
                    ></div>

                </div>

                <!-- ================================================== -->
                <!-- TRANSITIONS -->
                <!-- ================================================== -->

                <template
                    v-for="(
                        clip,
                        clipIndex
                    ) in track.clips"
                    :key="
                        `transition-${track.id}-${clip.id}`
                    "
                >

                    <div
                        v-if="
                            clipIndex <
                            track.clips.length - 1 &&
                            getTransitionBetween(
                                clip.id,
                                track.clips[
                                    clipIndex + 1
                                ].id
                            )
                        "
                        class="timeline-transition"
                        :style="
                            transitionStyle(
                                getTransitionBetween(
                                    clip.id,
                                    track.clips[
                                        clipIndex + 1
                                    ].id
                                ),
                                clip,
                                track.clips[
                                    clipIndex + 1
                                ]
                            )
                        "
                        @pointerdown.stop="
                            selectTransition(
                                getTransitionBetween(
                                    clip.id,
                                    track.clips[
                                        clipIndex + 1
                                    ].id
                                )
                            )
                        "
                    >

                        <span
                            class="timeline-transition-icon"
                        >
                            ◆
                        </span>

                        <span
                            class="timeline-transition-name"
                        >
                            {{
                                transitionLabel(
                                    getTransitionBetween(
                                        clip.id,
                                        track.clips[
                                            clipIndex + 1
                                        ].id
                                    )
                                )
                            }}
                        </span>

                        <span
                            class="timeline-transition-label"
                        >
                            {{
                                transitionLabel(
                                    getTransitionBetween(
                                        clip.id,
                                        track.clips[
                                            clipIndex + 1
                                        ].id
                                    )
                                )
                            }}
                        </span>

                    </div>

                </template>

            </div>

        </div>

    </div>

</div>

</template>

<style scoped>

.timeline {

    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;

    background: #181f2d;
    color: #ffffff;

    overflow: hidden;

}

/*
==========================================================
HEADER
==========================================================
*/

.timeline-header {

    height: 55px;
    min-height: 55px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 18px;

    border-bottom: 1px solid #2d3648;

}

.timeline-title h3 {

    margin: 0;

    font-size: 18px;
    font-weight: 600;

}

.timeline-controls {

    display: flex;
    align-items: center;

    gap: 8px;

}

.timeline-controls button {

    width: 36px;
    height: 36px;

    border: none;
    border-radius: 8px;

    background: #2b3345;
    color: white;

    cursor: pointer;

    font-size: 15px;

}

.timeline-controls button:hover {

    background: #4f8cff;

}

.timeline-controls button:disabled {

    opacity: .35;

    cursor: not-allowed;

}

.timeline-controls button:disabled:hover {

    background: #2b3345;

}

/*
==========================================================
RULER
==========================================================
*/

.timeline-ruler {

    height: 34px;
    min-height: 34px;

    display: flex;

    background: #151b28;

    border-bottom: 1px solid #2d3648;

}

.track-label-space {

    width: 150px;
    min-width: 150px;

    border-right: 1px solid #2d3648;

}

.ruler-area {

    position: relative;

    flex: 1;

    min-width: 2500px;

    overflow: hidden;

    cursor: pointer;

}

.ruler-mark {

    position: absolute;

    top: 0;

    height: 100%;
    width: 1px;

    border-left: 1px solid #39445a;

    pointer-events: none;

}

.ruler-mark span {

    position: absolute;

    top: 8px;
    left: 5px;

    font-size: 10px;

    color: #8791a5;

    white-space: nowrap;

}

/*
==========================================================
BODY
==========================================================
*/

.timeline-body {

    position: relative;

    flex: 1;

    overflow: auto;

}

/*
==========================================================
PLAYHEAD
==========================================================
*/

.timeline-playhead {

    position: absolute;

    top: 0;
    bottom: 0;

    width: 14px;

    margin-left: -7px;

    z-index: 100;

    cursor: ew-resize;

    pointer-events: auto;

}

.playhead-head {

    position: absolute;

    top: 0;
    left: 0;

    width: 14px;
    height: 12px;

    background: #ff3b30;

    clip-path: polygon(
        0 0,
        100% 0,
        100% 70%,
        50% 100%,
        0 70%
    );

    border-radius: 2px;

    box-shadow:
        0 0 8px rgba(255, 59, 48, .65);

}

.playhead-line {

    position: absolute;

    top: 10px;
    bottom: 0;

    left: 6px;

    width: 2px;

    background: #ff3b30;

    box-shadow:
        0 0 7px rgba(255, 59, 48, .55);

}

/*
==========================================================
TRACK
==========================================================
*/

.timeline-track {

    position: relative;

    display: flex;

    min-height: 82px;

    border-bottom: 1px solid #2d3648;

}

.track-header {

    width: 150px;
    min-width: 150px;

    padding: 12px;

    background: #202839;

    border-right: 1px solid #39445a;

    cursor: pointer;

    position: relative;

    z-index: 10;

}

.track-header:hover {

    background: #29344a;

}

.track-header.selected {

    background: #263b5d;

    border-right-color: #4f8cff;

}

.track-name {

    font-size: 13px;

    font-weight: 600;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

}

.track-type {

    margin-top: 5px;

    font-size: 10px;

    color: #7f8ba2;

    text-transform: uppercase;

}

.track-controls {

    display: flex;

    align-items: center;

    gap: 4px;

    margin-top: 8px;

}

.track-control-button {

    width: 22px;
    height: 22px;

    padding: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    border: 1px solid #39445a;

    border-radius: 4px;

    background: #151b28;

    color: #71809a;

    cursor: pointer;

    transition:
        background .15s ease,
        border-color .15s ease,
        color .15s ease,
        transform .1s ease;

}

.track-control-button:hover {

    background: #29344a;

    border-color: #5b6b87;

    color: #dbe5f5;

}

.track-control-button:active {

    transform: scale(.92);

}

.track-control-button.active {

    background: #263b5d;

    border-color: #4f8cff;

    color: #6fa3ff;

}

.track-control-button svg {

    width: 14px;
    height: 14px;

    fill: none;

    stroke: currentColor;

    stroke-width: 1.8;

    stroke-linecap: round;
    stroke-linejoin: round;

}

.track-control-button.solo-button {

    font-size: 10px;

    font-weight: 700;

}

.track-control-button.solo-button.active {

    background: #59451d;

    border-color: #d7a83f;

    color: #ffd76a;

}

/*
==========================================================
TRACK CONTENT
==========================================================
*/

.track-content {

    position: relative;

    flex: 1;

    min-width: 2500px;

    min-height: 82px;

    background:

        repeating-linear-gradient(
            to right,
            transparent 0,
            transparent 79px,
            rgba(255, 255, 255, .035) 80px
        );

}

/*
==========================================================
EMPTY
==========================================================
*/

.empty-timeline {

    height: 100%;

    min-height: 200px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    color: #7f8ba2;

}

.empty-icon {

    font-size: 38px;

    margin-bottom: 10px;

}

.empty-title {

    font-size: 16px;

    font-weight: 600;

}

.empty-text {

    margin-top: 5px;

    font-size: 12px;

}

.empty-track {

    position: absolute;

    left: 20px;
    top: 30px;

    color: #59657a;

    font-size: 11px;

}

/*
==========================================================
CLIP
==========================================================
*/

.timeline-clip {

    position: absolute;

    top: 9px;

    height: 64px;

    display: flex;

    align-items: center;

    gap: 8px;

    padding: 5px 8px;

    background: #31598f;

    border: 2px solid transparent;

    border-radius: 7px;

    cursor: grab;

    overflow: hidden;

    box-sizing: border-box;

    user-select: none;

    touch-action: none;

}

.timeline-clip:active {

    cursor: grabbing;

}

.timeline-clip:hover {

    background: #3d6ca9;

}

.timeline-clip.selected {

    background: #416fae;

    border-color: #ffffff;

    box-shadow:
        0 0 0 1px #4f8cff,
        0 0 12px rgba(79, 140, 255, .45);

}

/*
==========================================================
RESIZE HANDLES
==========================================================
*/

.clip-resize-handle {

    position: absolute;

    top: 0;
    bottom: 0;

    width: 9px;

    z-index: 20;

    cursor: ew-resize;

}

.clip-resize-left {

    left: -2px;

}

.clip-resize-right {

    right: -2px;

}

.clip-resize-handle::after {

    content: "";

    position: absolute;

    top: 18px;
    bottom: 18px;

    left: 3px;

    width: 3px;

    border-radius: 3px;

    background: rgba(255, 255, 255, .45);

    opacity: 0;

    transition:
        opacity .12s ease;

}

.timeline-clip:hover
.clip-resize-handle::after,

.timeline-clip.selected
.clip-resize-handle::after {

    opacity: 1;

}

/*
==========================================================
THUMBNAIL
==========================================================
*/

.clip-thumbnail {

    width: 45px;
    height: 48px;

    min-width: 45px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 4px;

    overflow: hidden;

    background: #202838;

    font-size: 20px;

    pointer-events: none;

}

.clip-thumbnail img {

    width: 100%;
    height: 100%;

    object-fit: cover;

    pointer-events: none;

}

/*
==========================================================
INFO
==========================================================
*/

.clip-info {

    min-width: 0;

    overflow: hidden;

    pointer-events: none;

}

.clip-name {

    font-size: 11px;

    font-weight: 600;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

}

.clip-duration {

    margin-top: 4px;

    font-size: 10px;

    color: #c3ccdb;

}

/*
==========================================================
TRANSITION
==========================================================
*/

.timeline-transition {

    position: absolute;

    top: 50%;

    transform:
        translate(-50%, -50%);

    z-index: 30;

    min-width: 34px;
    width: 34px;

    height: 34px;

    display: flex;

    align-items: center;
    justify-content: center;

    border: 2px solid #5b8cff;

    border-radius: 50%;

    background: #182235;

    color: #dbe7ff;

    font-size: 11px;

    font-weight: 700;

    box-shadow:
        0 4px 12px
        rgba(0, 0, 0, .35);

    cursor: pointer;

    user-select: none;

    pointer-events: auto;

    transition:
        transform .15s ease,
        background .15s ease,
        border-color .15s ease,
        box-shadow .15s ease;

}

.timeline-transition:hover {

    transform:
        translate(-50%, -50%)
        scale(1.08);

    background: #243553;

    border-color: #7aa2ff;

    box-shadow:
        0 6px 18px
        rgba(0, 0, 0, .45);

}

.timeline-transition.selected {

    background: #3157a6;

    border-color: #ffd54f;

    color: #ffffff;

    box-shadow:
        0 0 0 2px
        rgba(255, 213, 79, .25),
        0 6px 18px
        rgba(0, 0, 0, .45);

}

/*
==========================================================
TRANSITION NAME
==========================================================
*/

.timeline-transition-name {

    position: absolute;

    top: calc(100% + 4px);
    left: 50%;

    transform:
        translateX(-50%);

    max-width: 100px;

    padding: 3px 6px;

    border-radius: 4px;

    background: #111827;

    border: 1px solid #34415a;

    color: #9fb0cc;

    font-size: 9px;

    line-height: 1;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

    opacity: 0;

    pointer-events: none;

    transition:
        opacity .15s ease;

}

.timeline-transition:hover
.timeline-transition-name,

.timeline-transition.selected
.timeline-transition-name {

    opacity: 1;

}

/*
==========================================================
TRANSITION LABEL
==========================================================
*/

.timeline-transition-label {

    display: none;

}

/*
==========================================================
TRANSITION ICON
==========================================================
*/

.timeline-transition-icon {

    display: flex;

    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    line-height: 1;

}

/*
==========================================================
SCROLLBAR
==========================================================
*/

.timeline-body::-webkit-scrollbar {

    width: 8px;
    height: 8px;

}

.timeline-body::-webkit-scrollbar-track {

    background: #151b28;

}

.timeline-body::-webkit-scrollbar-thumb {

    background: #3a465c;

    border-radius: 5px;

}

.timeline-body::-webkit-scrollbar-thumb:hover {

    background: #4f8cff;

}

</style>
```
