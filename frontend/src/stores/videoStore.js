import { defineStore } from "pinia";
import { ref, computed, toRaw } from "vue";

export const useVideoStore = defineStore("video", () => {

    /*
    ==========================================================
    PROJECT
    ==========================================================
    */

    const project = ref({
        id: crypto.randomUUID(),
        name: "Untitled Video",
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    /*
    ==========================================================
    PLAYBACK
    ==========================================================
    */

    const currentTime = ref(0);
    const playhead = ref(0);
    const isPlaying = ref(false);

    const timelineZoom = ref(100);
    const previewZoom = ref(100);

    const playback = ref({
        speed: 1,
        loop: false,
        playing: false
    });

    /*
    ==========================================================
    MEDIA LIBRARY
    ==========================================================
    */

    const media = ref([]);

    let nextMediaId = 1;

    /*
    ==========================================================
    TRACKS
    ==========================================================
    */

    const tracks = ref([]);

    let nextTrackId = 1;

    /*
    ==========================================================
    CLIPS
    ==========================================================
    */

    let nextClipId = 1;

    /*
    ==========================================================
    TRANSITIONS
    ==========================================================
    */

    const transitions = ref([]);

    let nextTransitionId = 1;

    /*
    ==========================================================
    EFFECTS
    ==========================================================
    */

    const effects = ref([]);

    let nextEffectId = 1;

    /*
    ==========================================================
    KEYFRAMES
    ==========================================================
    */

    const keyframes = ref([]);

    let nextKeyframeId = 1;

    const keyframeInterpolation = ref("linear");
    const selectedKeyframeId = ref(null);

    /*
    ==========================================================
    SELECTION
    ==========================================================
    */

    const selectedTrackId = ref(null);
    const selectedClipId = ref(null);
    const selectedTransitionId = ref(null);
    const selectedEffectId = ref(null);

    /*
    ==========================================================
    CLIPBOARD
    ==========================================================
    */

    const clipboard = ref({
        clip: null,
        transition: null,
        effect: null
    });

    /*
    ==========================================================
    HISTORY
    ==========================================================
    */

    const undoStack = ref([]);
    const redoStack = ref([]);

    /*
    ==========================================================
    EXPORT / RENDER
    ==========================================================
    */

    const rendering = ref(false);
    const renderProgress = ref(0);

    const exportStatus = ref({
        id: null,
        status: "idle",
        progress: 0,
        input: "",
        output: "",
        filename: "",
        message: "",
        started_at: null,
        completed_at: null
    });

    const exportSettings = ref({
        format: "mp4",
        codec: "h264",
        resolution: {
            width: 1920,
            height: 1080
        },
        fps: 30,
        bitrate: 12000,
        audioCodec: "aac",
        audioBitrate: 320,
        quality: "high",
        destination: "",
        filename: "output"
    });

    const renderQueue = ref([]);

    let exportPollTimer = null;

function clearExportPollTimer() {
    if (exportPollTimer) {
        clearTimeout(exportPollTimer);
        exportPollTimer = null;
    }
}

const exportProgressListeners = new Set();

    /*
    ==========================================================
    INSPECTOR
    ==========================================================
    */

    const inspector = ref({
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        scale: 100,
        rotation: 0,
        opacity: 100
    });

    const contextMenu = ref({
        open: false,
        x: 0,
        y: 0,
        item: null
    });

    /*
    ==========================================================
    COMPUTED - SELECTION
    ==========================================================
    */

    const selectedTrack = computed(() => {
        return (
            tracks.value.find(
                track =>
                    track.id === selectedTrackId.value
            ) || null
        );
    });

    const selectedClip = computed(() => {

        if (!selectedTrack.value) {
            return null;
        }

        return (
            selectedTrack.value.clips.find(
                clip =>
                    clip.id === selectedClipId.value
            ) || null
        );
    });

    const selectedTransition = computed(() => {
        return (
            transitions.value.find(
                transition =>
                    transition.id === selectedTransitionId.value
            ) || null
        );
    });

    const selectedEffect = computed(() => {
        return (
            effects.value.find(
                effect =>
                    effect.id === selectedEffectId.value
            ) || null
        );
    });

    const selectedKeyframe = computed(() => {
        return (
            keyframes.value.find(
                keyframe =>
                    keyframe.id === selectedKeyframeId.value
            ) || null
        );
    });

    /*
    ==========================================================
    HISTORY - SNAPSHOT
    ==========================================================
    */

    function createSnapshot() {

        const projectSnapshot = structuredClone(
            toRaw(project.value)
        );

        const mediaSnapshot = media.value.map(item => {

            const rawItem = toRaw(item);

            const {
                file,
                ...snapshotItem
            } = rawItem;

            return structuredClone(snapshotItem);
        });

        const tracksSnapshot = structuredClone(
            toRaw(tracks.value)
        );

        const transitionsSnapshot = structuredClone(
            toRaw(transitions.value)
        );

        const effectsSnapshot = structuredClone(
            toRaw(effects.value)
        );

        const keyframesSnapshot = structuredClone(
            toRaw(keyframes.value)
        );

        return {
            project: projectSnapshot,
            media: mediaSnapshot,
            tracks: tracksSnapshot,
            transitions: transitionsSnapshot,
            effects: effectsSnapshot,
            keyframes: keyframesSnapshot
        };
    }

    function restoreSnapshot(snapshot) {

        if (!snapshot) {
            return;
        }

        if (snapshot.project) {
            project.value = structuredClone(
                toRaw(snapshot.project)
            );
        }

        media.value = structuredClone(
            toRaw(snapshot.media || [])
        );

        tracks.value = structuredClone(
            toRaw(snapshot.tracks || [])
        );

        transitions.value = structuredClone(
            toRaw(snapshot.transitions || [])
        );

        effects.value = structuredClone(
            toRaw(snapshot.effects || [])
        );

        keyframes.value = structuredClone(
            toRaw(snapshot.keyframes || [])
        );
    }

    function saveHistory() {

        undoStack.value.push(
            createSnapshot()
        );

        if (undoStack.value.length > 100) {
            undoStack.value.shift();
        }

        redoStack.value = [];
    }

    function undo() {

        if (undoStack.value.length <= 1) {
            return;
        }

        const current =
            undoStack.value.pop();

        redoStack.value.push(current);

        const previous =
            undoStack.value[
                undoStack.value.length - 1
            ];

        restoreSnapshot(previous);
    }

    function redo() {

        if (redoStack.value.length === 0) {
            return;
        }

        const snapshot =
            redoStack.value.pop();

        undoStack.value.push(snapshot);

        restoreSnapshot(snapshot);
    }

    function clearHistory() {

        undoStack.value = [];
        redoStack.value = [];
    }

    /*
    ==========================================================
    PROJECT FUNCTIONS
    ==========================================================
    */

    function createProject(options = {}) {

        project.value = {
            id: crypto.randomUUID(),
            name: options.name || "Untitled Video",
            width: options.width || 1920,
            height: options.height || 1080,
            fps: options.fps || 30,
            duration: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        media.value = [];
        tracks.value = [];
        transitions.value = [];
        effects.value = [];
        keyframes.value = [];

        undoStack.value = [];
        redoStack.value = [];

        currentTime.value = 0;
        playhead.value = 0;
        isPlaying.value = false;

        playback.value = {
            speed: 1,
            loop: false,
            playing: false
        };

        selectedTrackId.value = null;
        selectedClipId.value = null;
        selectedTransitionId.value = null;
        selectedEffectId.value = null;
        selectedKeyframeId.value = null;

        nextMediaId = 1;
        nextTrackId = 1;
        nextClipId = 1;
        nextTransitionId = 1;
        nextEffectId = 1;
        nextKeyframeId = 1;

        undoStack.value = [
            createSnapshot()
        ];

        redoStack.value = [];
    }

    function renameProject(name) {

        project.value.name =
            name || "Untitled Video";

        project.value.updatedAt =
            new Date();
    }

    function updateProjectDuration() {

        let max = 0;

        tracks.value.forEach(track => {

            track.clips.forEach(clip => {

                const end =
                    Number(clip.start || 0) +
                    Number(clip.duration || 0);

                max = Math.max(max, end);
            });
        });

        project.value.duration = max;
        project.value.updatedAt = new Date();
    }

    /*
    ==========================================================
    MEDIA FUNCTIONS
    ==========================================================
    */

    function addMedia(file) {

        if (!file) {
            return null;
        }

        const item = {
            id: nextMediaId++,
            name: file.name,
            type: file.type,
            file,
            url: URL.createObjectURL(file),
            thumbnail: "",
            duration: 0,
            width: 0,
            height: 0,
            fps: 0,
            size: file.size,
            createdAt: new Date()
        };

        media.value.push(item);

        saveHistory();

        return item;
    }

    async function addRemoteVideo(videoData) {

        if (!videoData) {
            return null;
        }

        const filename =
            videoData.filename ||
            (
                videoData.output
                    ? videoData.output.split(/[\\/]/).pop()
                    : ""
            );

        if (!filename) {
            return null;
        }

        const existing = media.value.find(
            item =>
                item.filename === filename ||
                item.name === filename
        );

        if (existing) {
            return existing;
        }

        const output =
            videoData.output || "";

        let url = output;

        if (
            output &&
            !output.startsWith("http://") &&
            !output.startsWith("https://") &&
            !output.startsWith("blob:")
        ) {
            url =
    "http://127.0.0.1:8000" +
    (output.startsWith("/") ? "" : "/") +
    output;
        }

        const item = {
            id: nextMediaId++,
            name: filename,
            filename,
            output,
            type: "video/mp4",
            source: "backend",
            provider:
                videoData.provider || "ComfyUI",
            url,
            thumbnail: "",
            duration:
                Number(videoData.duration) || 0,
            width:
                Number(videoData.width) || 0,
            height:
                Number(videoData.height) || 0,
            fps:
                Number(videoData.fps) || 0,
            frames:
                videoData.frames ?? null,
            size:
                Number(videoData.size) || 0,
            prompt:
                videoData.prompt || "",
            promptId:
                videoData.prompt_id || "",
            status:
                videoData.status || "completed",
            createdAt:
                videoData.created_at
                    ? new Date(videoData.created_at)
                    : new Date(),
            file: null
        };

        media.value.push(item);

        saveHistory();

        return item;
    }

    async function addRemoteAudio(audioData) {

        if (!audioData) {
            return null;
        }

        const filename =
            audioData.filename ||
            (
                audioData.output
                    ? audioData.output.split(/[\\/]/).pop()
                    : ""
            );

        if (!filename) {
            return null;
        }

        const existing = media.value.find(
            item =>
                item.filename === filename ||
                item.name === filename
        );

        if (existing) {
            return existing;
        }

        const output =
            audioData.output || "";

        let url = output;

        if (
            output &&
            !output.startsWith("http://") &&
            !output.startsWith("https://") &&
            !output.startsWith("blob:")
        ) {
            url =
    "http://127.0.0.1:8000" +
    (output.startsWith("/") ? "" : "/") +
    output;
        }

        const item = {
            id: nextMediaId++,
            name: filename,
            filename,
            output,
            type: "audio/mpeg",
            source: "backend",
            provider:
                audioData.provider || "ElevenLabs",
            url,
            thumbnail: "",
            duration:
                Number(audioData.duration) || 0,
            width: 0,
            height: 0,
            fps: 0,
            frames: null,
            size:
                Number(audioData.size) || 0,
            prompt:
                audioData.prompt || "",
            status: "completed",
            createdAt:
                audioData.created_at
                    ? new Date(audioData.created_at)
                    : new Date(),
            file: null
        };

        media.value.push(item);

        saveHistory();

        return item;
    }

    async function addRemoteAudio(audioData) {

        if (!audioData) {
            return null;
        }

        const filename =
            audioData.filename ||
            (
                audioData.output
                    ? audioData.output.split(/[\\/]/).pop()
                    : ""
            );

        if (!filename) {
            return null;
        }

        const existing = media.value.find(
            item =>
                item.filename === filename ||
                item.name === filename
        );

        if (existing) {
            return existing;
        }

        const output =
            audioData.output || "";

        let url = output;

        if (
            output &&
            !output.startsWith("http://") &&
            !output.startsWith("https://") &&
            !output.startsWith("blob:")
        ) {
            url =
    "http://127.0.0.1:8000" +
    (output.startsWith("/") ? "" : "/") +
    output;
        }

        const item = {
            id: nextMediaId++,
            name: filename,
            filename,
            output,
            type: "audio/mpeg",
            source: "backend",
            provider:
                audioData.provider || "ElevenLabs",
            url,
            thumbnail: "",
            duration:
                Number(audioData.duration) || 0,
            width: 0,
            height: 0,
            fps: 0,
            frames: null,
            size:
                Number(audioData.size) || 0,
            prompt:
                audioData.prompt || "",
            status: "completed",
            createdAt:
                audioData.created_at
                    ? new Date(audioData.created_at)
                    : new Date(),
            file: null
        };

        media.value.push(item);

        saveHistory();

        return item;
    }

    async function loadBackendVideos() {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/videos"
            );

            if (!response.ok) {
                throw new Error(
                   "Video API error: " + response.status
                 );
            }

            const data =
                await response.json();

            let videos = [];

            if (Array.isArray(data)) {
                videos = data;
            } else if (
                data &&
                Array.isArray(data.videos)
            ) {
                videos = data.videos;
            }

            const completedVideos =
                videos.filter(video => {

                    return (
                        video &&
                        video.status === "completed" &&
                        video.output
                    );
                });

            const imported = [];

            for (const video of completedVideos) {

                const item =
                    await addRemoteVideo(video);

                if (item) {
                    imported.push(item);
                }
            }

            return imported;

        } catch (error) {

            console.error(
                "Backend videos could not be loaded:",
                error
            );

            return [];
        }
    }

    function openImportDialog() {

        const input =
            document.createElement("input");

        input.type = "file";
        input.multiple = true;

        input.accept = [
            "video/*",
            "audio/*",
            "image/*"
        ].join(",");

        input.addEventListener(
            "change",
            event => {

                const files =
                    Array.from(
                        event.target.files || []
                    );

                files.forEach(file => {
                    addMedia(file);
                });

                input.remove();
            }
        );

        input.addEventListener(
            "cancel",
            () => {
                input.remove();
            }
        );

        input.click();
    }

    function removeMedia(id) {

        const index =
            media.value.findIndex(
                item => item.id === id
            );

        if (index === -1) {
            return;
        }

        const item =
            media.value[index];

        if (
            item.url &&
            item.url.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                item.url
            );
        }

        media.value.splice(index, 1);

        saveHistory();
    }

    function clearMedia() {

        media.value.forEach(item => {

            if (
                item.url &&
                item.url.startsWith("blob:")
            ) {
                URL.revokeObjectURL(
                    item.url
                );
            }
        });

        media.value = [];

        saveHistory();
    }

    /*
    ==========================================================
    TRACK FUNCTIONS
    ==========================================================
    */

    function addTrack(type = "video") {

        const trackNumber =
            nextTrackId;

        const track = {
            id: nextTrackId++,
            type,
            name:
                type === "video"
                   ? "Video Track " + trackNumber
                   : type === "audio"
                       ? "Audio Track " + trackNumber
                       : "Subtitle Track " + trackNumber,
            visible: true,
            locked: false,
            muted: false,
            solo: false,
            clips: []
        };

        tracks.value.push(track);

        saveHistory();

        return track;
    }

    function removeTrack(trackId) {

        const index =
            tracks.value.findIndex(
                track => track.id === trackId
            );

        if (index === -1) {
            return;
        }

        tracks.value.splice(index, 1);

        if (
            selectedTrackId.value === trackId
        ) {
            selectedTrackId.value = null;
            selectedClipId.value = null;
        }

        updateProjectDuration();
        saveHistory();
    }

    function toggleTrackVisible(trackId) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        track.visible =
            !track.visible;

        saveHistory();
    }

    function toggleTrackLocked(trackId) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        track.locked =
            !track.locked;

        saveHistory();
    }

    function toggleTrackMute(trackId) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        track.muted =
            !track.muted;

        saveHistory();
    }

    function toggleTrackSolo(trackId) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        track.solo =
            !track.solo;

        saveHistory();
    }

    /*
    ==========================================================
    CLIP FUNCTIONS
    ==========================================================
    */

    function addClip(trackId, mediaId) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return null;
        }

        if (track.locked) {
            return null;
        }

        const mediaItem =
            media.value.find(
                item => item.id === mediaId
            );

        if (!mediaItem) {
            return null;
        }

        const lastClip =
            track.clips.at(-1);

        const start =
            lastClip
                ? Number(lastClip.start || 0) +
                  Number(lastClip.duration || 0)
                : 0;

        const defaultDuration =
            Number(mediaItem.duration) > 0
                ? Number(mediaItem.duration)
                : 5;

        const clip = {
            id: nextClipId++,
            mediaId: mediaItem.id,
            name: mediaItem.name,
            type: mediaItem.type,
            url: mediaItem.url,
            thumbnail:
                mediaItem.thumbnail ||
                mediaItem.url,
            start,
            duration: defaultDuration,
            offset: 0,
            speed: 1,
            muted: false,
            locked: false,
            visible: true,
            selected: false,
            volume: 1,
            fadeIn: 0,
            fadeOut: 0,
            x: 0,
            y: 0,
            scale: 100,
            rotation: 0,
            opacity: 100,
            createdAt: new Date()
        };

        track.clips.push(clip);

        updateProjectDuration();

        saveHistory();

        return clip;
    }

    function removeClip(trackId, clipId) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track || track.locked) {
            return;
        }

        const index =
            track.clips.findIndex(
                clip => clip.id === clipId
            );

        if (index === -1) {
            return;
        }

        track.clips.splice(index, 1);

        keyframes.value =
            keyframes.value.filter(
                keyframe =>
                    keyframe.clipId !== clipId
            );

        transitions.value =
            transitions.value.filter(
                transition =>
                    transition.fromClipId !== clipId &&
                    transition.toClipId !== clipId
            );

        effects.value =
            effects.value.filter(
                effect =>
                    effect.clipId !== clipId
            );

        if (
            selectedClipId.value === clipId
        ) {
            selectedClipId.value = null;
        }

        updateProjectDuration();
        saveHistory();
    }

    function duplicateClip(trackId, clipId) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track || track.locked) {
            return null;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip) {
            return null;
        }

        const newClip = {
            ...structuredClone(
                toRaw(clip)
            ),
            id: nextClipId++,
            start:
                Number(clip.start || 0) +
                Number(clip.duration || 0),
            selected: false
        };

        track.clips.push(newClip);

        updateProjectDuration();
        saveHistory();

        return newClip;
    }

    function moveClip(
        trackId,
        clipId,
        newStart
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track || track.locked) {
            return;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip || clip.locked) {
            return;
        }

        clip.start =
            Math.max(
                0,
                Number(newStart) || 0
            );

        updateProjectDuration();
        saveHistory();
    }

    function resizeClip(
        trackId,
        clipId,
        newDuration
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track || track.locked) {
            return;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip || clip.locked) {
            return;
        }

        clip.duration =
            Math.max(
                0.2,
                Number(newDuration) || 0.2
            );

        effects.value
            .filter(
                effect =>
                    effect.clipId === clipId
            )
            .forEach(effect => {

                const duration =
                    Number(clip.duration) || 0;

                effect.startTime =
                    Math.min(
                        Math.max(
                            0,
                            Number(effect.startTime) || 0
                        ),
                        duration
                    );

                if (
                    effect.endTime !== null &&
                    effect.endTime !== undefined
                ) {
                    effect.endTime =
                        Math.min(
                            Math.max(
                                effect.startTime,
                                Number(effect.endTime) || 0
                            ),
                            duration
                        );
                }
            });

        updateProjectDuration();
        saveHistory();
    }

    function splitClip(
        trackId,
        clipId,
        splitTime
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track || track.locked) {
            return null;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip || clip.locked) {
            return null;
        }

        const clipStart =
            Number(clip.start) || 0;

        const clipDuration =
            Math.max(
                0,
                Number(clip.duration) || 0
            );

        const clipEnd =
            clipStart + clipDuration;

        const time =
            Number(splitTime);

        if (
            !Number.isFinite(time) ||
            time <= clipStart + 0.05 ||
            time >= clipEnd - 0.05
        ) {
            return null;
        }

        const firstDuration =
            time - clipStart;

        const secondDuration =
            clipEnd - time;

        const speed =
            Number(clip.speed) || 1;

        const secondClip = {
            ...structuredClone(
                toRaw(clip)
            ),
            id: nextClipId++,
            start: time,
            duration: secondDuration,
            offset:
                (Number(clip.offset) || 0) +
                firstDuration * speed,
            selected: false
        };

        clip.duration =
            firstDuration;

        track.clips.push(
            secondClip
        );

        effects.value
            .filter(
                effect =>
                    effect.clipId === clipId
            )
            .forEach(effect => {

                const effectStart =
                    Number(effect.startTime) || 0;

                const effectEnd =
                    effect.endTime === null ||
                    effect.endTime === undefined
                        ? null
                        : Number(effect.endTime);

                effect.startTime =
                    Math.min(
                        effectStart,
                        firstDuration
                    );

                if (effectEnd !== null) {
                    effect.endTime =
                        Math.min(
                            Math.max(
                                effect.startTime,
                                effectEnd
                            ),
                            firstDuration
                        );
                }
            });

        track.clips.sort(
            (a, b) =>
                Number(a.start || 0) -
                Number(b.start || 0)
        );

        selectedTrackId.value =
            track.id;

        selectedClipId.value =
            secondClip.id;

        track.clips.forEach(item => {
            item.selected =
                item.id === secondClip.id;
        });

        updateProjectDuration();

        project.value.updatedAt =
            new Date();

        saveHistory();

        return secondClip;
    }

    function selectClip(
        trackId,
        clipId
    ) {

        selectedTrackId.value =
            trackId;

        selectedClipId.value =
            clipId;

        tracks.value.forEach(track => {

            track.clips.forEach(clip => {

                clip.selected =
                    clip.id === clipId;
            });
        });
    }

    function deselectClip() {

        selectedTrackId.value = null;
        selectedClipId.value = null;

        tracks.value.forEach(track => {

            track.clips.forEach(clip => {
                clip.selected = false;
            });
        });
    }

    function rippleMove(
        trackId,
        clipId,
        delta
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track || track.locked) {
            return;
        }

        const index =
            track.clips.findIndex(
                clip => clip.id === clipId
            );

        if (index === -1) {
            return;
        }

        const amount =
            Number(delta) || 0;

        for (
            let i = index;
            i < track.clips.length;
            i++
        ) {
            track.clips[i].start =
                Math.max(
                    0,
                    Number(
                        track.clips[i].start || 0
                    ) + amount
                );
        }

        updateProjectDuration();
        saveHistory();
    }

    /*
    ==========================================================
    CLIPBOARD
    ==========================================================
    */

    function copyClip() {

        if (!selectedClip.value) {
            return;
        }

        clipboard.value.clip =
            structuredClone(
                toRaw(selectedClip.value)
            );
    }

    function pasteClip() {

        if (
            !clipboard.value.clip ||
            !selectedTrack.value
        ) {
            return null;
        }

        if (selectedTrack.value.locked) {
            return null;
        }

        const clip =
            structuredClone(
                toRaw(clipboard.value.clip)
            );

        clip.id = nextClipId++;

        clip.start =
            Number(
                clipboard.value.clip.start || 0
            ) +
            Number(
                clipboard.value.clip.duration || 0
            );

        clip.selected = false;

        selectedTrack.value.clips.push(
            clip
        );

        updateProjectDuration();
        saveHistory();

        return clip;
    }

    function clearClipboard() {

        clipboard.value = {
            clip: null,
            transition: null,
            effect: null
        };
    }

    /*
    ==========================================================
    TRANSITION FUNCTIONS
    ==========================================================
    */

    function addTransition(
        fromClipId,
        toClipId,
        type = "fade",
        duration = 1
    ) {

        const existing =
            getTransitionBetween(
                fromClipId,
                toClipId
            );

        if (existing) {
            return existing;
        }

        const transition = {
            id: nextTransitionId++,
            fromClipId,
            toClipId,
            type,
            duration:
                Math.max(
                    0.05,
                    Number(duration) || 1
                ),
            enabled: true,
            createdAt: new Date()
        };

        transitions.value.push(
            transition
        );

        saveHistory();

        return transition;
    }

    function removeTransition(
        transitionId
    ) {

        const index =
            transitions.value.findIndex(
                transition =>
                    transition.id === transitionId
            );

        if (index === -1) {
            return;
        }

        transitions.value.splice(
            index,
            1
        );

        if (
            selectedTransitionId.value ===
            transitionId
        ) {
            selectedTransitionId.value = null;
        }

        saveHistory();
    }

    function updateTransition(
        transitionId,
        values
    ) {

        const transition =
            transitions.value.find(
                item =>
                    item.id === transitionId
            );

        if (!transition) {
            return;
        }

        Object.assign(
            transition,
            values
        );

        saveHistory();
    }

    function getTransitionBetween(
        fromClipId,
        toClipId
    ) {

        return (
            transitions.value.find(
                transition =>
                    transition.fromClipId === fromClipId &&
                    transition.toClipId === toClipId
            ) || null
        );
    }

    function selectTransition(
        transitionId
    ) {

        selectedTransitionId.value =
            transitionId;
    }

    function deselectTransition() {

        selectedTransitionId.value =
            null;
    }

    const transitionPresets = [
        {
            id: "fade",
            name: "Fade"
        },
        {
            id: "crossfade",
            name: "Cross Fade"
        },
        {
            id: "slide",
            name: "Slide"
        },
        {
            id: "zoom",
            name: "Zoom"
        },
        {
            id: "blur",
            name: "Blur"
        },
        {
            id: "flash",
            name: "Flash"
        },
        {
            id: "wipe",
            name: "Wipe"
        },
        {
            id: "dipblack",
            name: "Dip To Black"
        },
        {
            id: "dipwhite",
            name: "Dip To White"
        }
    ];

    /*
    ==========================================================
    EFFECT FUNCTIONS
    ==========================================================
    */

    function findClipById(clipId) {

        for (const track of tracks.value) {

            const clip =
                track.clips.find(
                    item =>
                        item.id === clipId
                );

            if (clip) {
                return clip;
            }
        }

        return null;
    }

    function addEffect(
        clipId,
        type,
        settings = {}
    ) {

        const clip =
            findClipById(clipId);

        if (!clip) {
            return null;
        }

        const clipDuration =
            Math.max(
                0,
                Number(clip.duration) || 0
            );

        const effect = {
            id: nextEffectId++,
            clipId,
            type,
            enabled: true,
            startTime: 0,
            endTime:
                clipDuration > 0
                    ? clipDuration
                    : null,
            settings: {
                ...settings
            },
            createdAt: new Date()
        };

        effects.value.push(effect);

        saveHistory();

        return effect;
    }

    function removeEffect(effectId) {

        const index =
            effects.value.findIndex(
                effect =>
                    effect.id === effectId
            );

        if (index === -1) {
            return;
        }

        effects.value.splice(
            index,
            1
        );

        if (
            selectedEffectId.value ===
            effectId
        ) {
            selectedEffectId.value = null;
        }

        saveHistory();
    }

    function updateEffect(
        effectId,
        values
    ) {

        const effect =
            effects.value.find(
                item =>
                    item.id === effectId
            );

        if (!effect) {
            return;
        }

        const {
            startTime,
            endTime,
            enabled,
            ...settings
        } = values;

        const clip =
            findClipById(effect.clipId);

        const clipDuration =
            clip
                ? Math.max(
                    0,
                    Number(clip.duration) || 0
                )
                : Infinity;

        if (startTime !== undefined) {

            effect.startTime =
                Math.min(
                    Math.max(
                        0,
                        Number(startTime) || 0
                    ),
                    clipDuration
                );
        }

        if (endTime !== undefined) {

            if (
                endTime === null ||
                endTime === ""
            ) {
                effect.endTime = null;
            } else {

                effect.endTime =
                    Math.min(
                        Math.max(
                            effect.startTime,
                            Number(endTime) || 0
                        ),
                        clipDuration
                    );
            }
        }

        if (enabled !== undefined) {
            effect.enabled =
                Boolean(enabled);
        }

        if (Object.keys(settings).length > 0) {

            Object.assign(
                effect.settings,
                settings
            );
        }

        saveHistory();
    }

    function setEffectRange(
        effectId,
        startTime,
        endTime
    ) {

        const effect =
            effects.value.find(
                item =>
                    item.id === effectId
            );

        if (!effect) {
            return null;
        }

        const clip =
            findClipById(effect.clipId);

        if (!clip) {
            return null;
        }

        const clipDuration =
            Math.max(
                0,
                Number(clip.duration) || 0
            );

        let start =
            Number(startTime);

        if (!Number.isFinite(start)) {
            start = 0;
        }

        start =
            Math.min(
                Math.max(0, start),
                clipDuration
            );

        let end =
            endTime === null ||
            endTime === undefined ||
            endTime === ""
                ? null
                : Number(endTime);

        if (end !== null) {

            if (!Number.isFinite(end)) {
                end = clipDuration;
            }

            end =
                Math.min(
                    Math.max(start, end),
                    clipDuration
                );
        }

        effect.startTime = start;
        effect.endTime = end;

        project.value.updatedAt =
            new Date();

        saveHistory();

        return effect;
    }

    function getEffectTimelineRange(effectId) {

        const effect =
            effects.value.find(
                item =>
                    item.id === effectId
            );

        if (!effect) {
            return null;
        }

        const clip =
            findClipById(effect.clipId);

        if (!clip) {
            return null;
        }

        const clipStart =
            Number(clip.start) || 0;

        const localStart =
            Math.max(
                0,
                Number(effect.startTime) || 0
            );

        const localEnd =
            effect.endTime === null ||
            effect.endTime === undefined
                ? Number(clip.duration) || Infinity
                : Math.max(
                    localStart,
                    Number(effect.endTime) || 0
                );

        return {
            start:
                clipStart + localStart,

            end:
                Number.isFinite(localEnd)
                    ? clipStart + localEnd
                    : Infinity
        };
    }

    function isEffectActive(
        effectId,
        time
    ) {

        const effect =
            effects.value.find(
                item =>
                    item.id === effectId
            );

        if (!effect || !effect.enabled) {
            return false;
        }

        const clip =
            findClipById(effect.clipId);

        if (!clip) {
            return false;
        }

        const globalTime =
            Number(time);

        if (!Number.isFinite(globalTime)) {
            return false;
        }

        const clipStart =
            Number(clip.start) || 0;

        const clipDuration =
            Math.max(
                0,
                Number(clip.duration) || 0
            );

        const clipEnd =
            clipStart + clipDuration;

        if (
            globalTime < clipStart ||
            globalTime > clipEnd
        ) {
            return false;
        }

        const localTime =
            globalTime - clipStart;

        const start =
            Math.max(
                0,
                Number(effect.startTime) || 0
            );

        const end =
            effect.endTime === null ||
            effect.endTime === undefined
                ? clipDuration
                : Math.min(
                    clipDuration,
                    Math.max(
                        start,
                        Number(effect.endTime) || 0
                    )
                );

        return (
            localTime >= start &&
            localTime <= end
        );
    }

    function getActiveEffectsAtTime(time) {

        return effects.value.filter(
            effect =>
                isEffectActive(
                    effect.id,
                    time
                )
        );
    }

    function toggleEffect(effectId) {

        const effect =
            effects.value.find(
                item =>
                    item.id === effectId
            );

        if (!effect) {
            return;
        }

        effect.enabled =
            !effect.enabled;

        saveHistory();
    }

    function getEffectsForClip(
        clipId
    ) {

        return effects.value.filter(
            effect =>
                effect.clipId === clipId
        );
    }

    function selectEffect(effectId) {

        selectedEffectId.value =
            effectId;
    }

    function deselectEffect() {

        selectedEffectId.value =
            null;
    }

    const effectPresets = [
        {
            id: "brightness",
            name: "Brightness"
        },
        {
            id: "contrast",
            name: "Contrast"
        },
        {
            id: "saturation",
            name: "Saturation"
        },
        {
            id: "blur",
            name: "Blur"
        },
        {
            id: "opacity",
            name: "Opacity"
        },
        {
            id: "rotation",
            name: "Rotation"
        },
        {
            id: "scale",
            name: "Scale"
        },
        {
            id: "crop",
            name: "Crop"
        },
        {
            id: "flipH",
            name: "Flip Horizontal"
        },
        {
            id: "flipV",
            name: "Flip Vertical"
        }
    ];

    /*
    ==========================================================
    KEYFRAME FUNCTIONS
    ==========================================================
    */

    function getKeyframes(clipId) {

        return keyframes.value
            .filter(
                keyframe =>
                    keyframe.clipId === clipId
            )
            .sort(
                (a, b) =>
                    Number(a.time || 0) -
                    Number(b.time || 0)
            );
    }

    function addKeyframe(
        clipId,
        property = "transform"
    ) {

        const clip =
            tracks.value
                .flatMap(
                    track => track.clips
                )
                .find(
                    item =>
                        item.id === clipId
                );

        if (!clip) {
            return null;
        }

        const keyframe = {
            id: nextKeyframeId++,
            clipId,
            time: currentTime.value,
            property,
            value: {
                x: clip.x ?? 0,
                y: clip.y ?? 0,
                scale: clip.scale ?? 100,
                rotation: clip.rotation ?? 0,
                opacity: clip.opacity ?? 100
            },
            easing: "linear",
            interpolation:
                keyframeInterpolation.value
        };

        keyframes.value.push(
            keyframe
        );

        selectedKeyframeId.value =
            keyframe.id;

        saveHistory();

        return keyframe;
    }

    function removeKeyframe(
        keyframeId
    ) {

        const index =
            keyframes.value.findIndex(
                keyframe =>
                    keyframe.id === keyframeId
            );

        if (index === -1) {
            return;
        }

        keyframes.value.splice(
            index,
            1
        );

        if (
            selectedKeyframeId.value ===
            keyframeId
        ) {
            selectedKeyframeId.value =
                null;
        }

        saveHistory();
    }

    function selectKeyframe(
        keyframeId
    ) {

        selectedKeyframeId.value =
            keyframeId;
    }

    function deselectKeyframe() {

        selectedKeyframeId.value =
            null;
    }

    function updateKeyframe(
        keyframeId,
        values
    ) {

        const keyframe =
            keyframes.value.find(
                item =>
                    item.id === keyframeId
            );

        if (!keyframe) {
            return;
        }

        Object.assign(
            keyframe,
            values
        );

        saveHistory();
    }

    /*
    ==========================================================
    AUDIO FUNCTIONS
    ==========================================================
    */

    function setClipVolume(
        trackId,
        clipId,
        volume
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip) {
            return;
        }

        clip.volume =
            Math.min(
                2,
                Math.max(
                    0,
                    Number(volume) || 0
                )
            );

        saveHistory();
    }

    function setClipMuted(
        trackId,
        clipId,
        muted
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip) {
            return;
        }

        clip.muted =
            Boolean(muted);

        saveHistory();
    }

    function setClipFadeIn(
        trackId,
        clipId,
        duration
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip) {
            return;
        }

        clip.fadeIn =
            Math.max(
                0,
                Number(duration) || 0
            );

        saveHistory();
    }

    function setClipFadeOut(
        trackId,
        clipId,
        duration
    ) {

        const track =
            tracks.value.find(
                item => item.id === trackId
            );

        if (!track) {
            return;
        }

        const clip =
            track.clips.find(
                item => item.id === clipId
            );

        if (!clip) {
            return;
        }

        clip.fadeOut =
            Math.max(
                0,
                Number(duration) || 0
            );

        saveHistory();
    }

    /*
    ==========================================================
    PLAYBACK FUNCTIONS
    ==========================================================
    */

    function play() {

        playback.value.playing = true;
        isPlaying.value = true;
    }

    function pause() {

        playback.value.playing = false;
        isPlaying.value = false;
    }

    function stop() {

        playback.value.playing = false;
        isPlaying.value = false;

        currentTime.value = 0;
        playhead.value = 0;
    }

    function seek(time) {

        const duration =
            Number(project.value.duration) || 0;

        const requestedTime =
            Number(time);

        const safeTime =
            Number.isFinite(requestedTime)
                ? requestedTime
                : 0;

        const nextTime =
            Math.max(
                0,
                Math.min(
                    safeTime,
                    duration > 0
                        ? duration
                        : safeTime
                )
            );

        currentTime.value =
            nextTime;

        playhead.value =
            nextTime;
    }

    function frameForward() {

        const frame =
            1 / (
                Number(project.value.fps) || 30
            );

        seek(
            currentTime.value + frame
        );
    }

    function frameBackward() {

        const frame =
            1 / (
                Number(project.value.fps) || 30
            );

        seek(
            currentTime.value - frame
        );
    }

    function setPlaybackSpeed(speed) {

        playback.value.speed =
            Math.max(
                0.1,
                Number(speed) || 1
            );
    }

    function toggleLoop() {

        playback.value.loop =
            !playback.value.loop;
    }

    function updatePlayback(delta) {

        if (!playback.value.playing) {
            return;
        }

        currentTime.value +=
            Number(delta || 0) *
            playback.value.speed;

        playhead.value =
            currentTime.value;

        const duration =
            Number(project.value.duration) || 0;

        if (
            duration > 0 &&
            currentTime.value >= duration
        ) {

            if (playback.value.loop) {

                currentTime.value = 0;
                playhead.value = 0;

            } else {

                stop();
            }
        }
    }

    /*
    ==========================================================
    TIMELINE HELPERS
    ==========================================================
    */

    function setTimelineZoom(value) {

        timelineZoom.value =
            Math.min(
                400,
                Math.max(
                    25,
                    Number(value) || 100
                )
            );
    }

    function setPreviewZoom(value) {

        previewZoom.value =
            Math.min(
                400,
                Math.max(
                    25,
                    Number(value) || 100
                )
            );
    }

    function secondsToPixels(seconds) {

        return (
            Number(seconds) *
            (timelineZoom.value / 5)
        );
    }

    function pixelsToSeconds(pixels) {

        return (
            Number(pixels) /
            (timelineZoom.value / 5)
        );
    }

    function snapTime(
        time,
        step = 0.1
    ) {

        const safeStep =
            Number(step) > 0
                ? Number(step)
                : 0.1;

        return (
            Math.round(
                Number(time) / safeStep
            ) * safeStep
        );
    }

    /*
    ==========================================================
    EXPORT HELPERS
    ==========================================================
    */

    function normalizeExportCodec(codec) {

        const value =
            String(codec || "h264")
                .toLowerCase();

        if (
            value === "h264" ||
            value === "h.264"
        ) {
            return "H264";
        }

        if (
            value === "h265" ||
            value === "h.265" ||
            value === "hevc"
        ) {
            return "H265";
        }

        if (value === "av1") {
            return "AV1";
        }

        if (value === "prores") {
            return "ProRes";
        }

        return "H264";
    }

    function normalizeExportFormat(format) {

        const value =
            String(format || "mp4")
                .toLowerCase();

        const allowed = [
            "mp4",
            "mov",
            "mkv",
            "webm"
        ];

        return allowed.includes(value)
            ? value
            : "mp4";
    }

    function normalizeResolution(resolution) {

        if (
            resolution &&
            typeof resolution === "object"
        ) {

            return {
                width:
                    Math.max(
                        1,
                        Number(
                            resolution.width
                        ) || 1920
                    ),
                height:
                    Math.max(
                        1,
                        Number(
                            resolution.height
                        ) || 1080
                    )
            };
        }

        if (typeof resolution === "string") {

            const match =
                resolution.match(
                    /^(\d+)\s*x\s*(\d+)$/
                );

            if (match) {

                return {
                    width:
                        Number(match[1]),
                    height:
                        Number(match[2])
                };
            }
        }

        return {
            width: 1920,
            height: 1080
        };
    }

    function normalizeBitrate(bitrate) {

        const value =
            Number(bitrate);

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {
            return 12000;
        }

        /*
         * ExportPanel uses Mbps.
         * Backend expects the value in Mbps
         * and converts it to e.g. 20M.
         */
        if (value <= 120) {
            return value;
        }

        /*
         * Store uses kbps.
         * Convert it to Mbps.
         */
        return value / 1000;
    }

    function normalizeAudioBitrate(bitrate) {

        const value =
            Number(bitrate);

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {
            return 320;
        }

        return value;
    }

    function getFirstVideoClip() {

        for (const track of tracks.value) {

            if (
                track.type !== "video"
            ) {
                continue;
            }

            const clip =
                track.clips.find(
                    item =>
                        item &&
                        (
                            !item.type ||
                            item.type.startsWith("video/")
                        )
                );

            if (clip) {
                return clip;
            }
        }

        /*
         * Fallback: allow the first clip on a video
         * track even when MIME information is missing.
         */
        for (const track of tracks.value) {

            if (
                track.type === "video" &&
                track.clips.length > 0
            ) {
                return track.clips[0];
            }
        }

        return null;
    }

    function getMediaForClip(clip) {

        if (!clip) {
            return null;
        }

        return (
            media.value.find(
                item =>
                    item.id === clip.mediaId
            ) || null
        );
    }

    async function uploadMediaForExport(mediaItem) {

        if (
            !mediaItem ||
            !mediaItem.file
        ) {
            return null;
        }

        const formData =
            new FormData();

        formData.append(
            "file",
            mediaItem.file,
            mediaItem.file.name
        );

        const response =
            await fetch(
                "http://127.0.0.1:8000/api/files/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

        if (!response.ok) {

            let message =
                "Upload failed: " + response.status;

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {
                    message =
                        String(errorData.detail);
                }

            } catch {
                // Keep default error message.
            }

            throw new Error(message);
        }

        const data =
            await response.json();

        return (
            data.path ||
            data.filepath ||
            data.input_path ||
            null
        );
    }

async function resolveExportInput() {
    const clips = [];

    const videoTracks = tracks.value.filter(
        track => track.type === "video" && track.visible !== false
    );

    for (const track of videoTracks) {
        const trackClips = Array.isArray(track.clips)
            ? track.clips
            : [];

        for (const clip of trackClips) {
            if (!clip || clip.visible === false) continue;

            const mediaItem = getMediaForClip(clip);

            if (!mediaItem) {
                console.warn(
                    "[videoStore] Media not found for clip:",
                    clip.id
                );
                continue;
            }

            let inputPath = null;

            // Backend generated video
            if (
                mediaItem.source === "backend" &&
                mediaItem.output &&
                !/^https?:\/\//i.test(mediaItem.output)
            ) {
                inputPath =
                    mediaItem.filename ||
                    String(mediaItem.output)
                        .split(/[\\/]/)
                        .pop();
            
            }

            // Previously uploaded backend file
            else if (mediaItem.backendPath) {
                inputPath = mediaItem.backendPath;
            }

            // Browser File -> backend upload
            else if (mediaItem.file instanceof File) {
                inputPath = await uploadMediaForExport(mediaItem);

                if (inputPath) {
                    mediaItem.backendPath = inputPath;
                }
            }

            // Existing filesystem/backend path
            else if (
                mediaItem.path &&
                !String(mediaItem.path).startsWith("blob:")
            ) {
                inputPath = mediaItem.path;
            }

            if (!inputPath) {
                console.warn(
                    "[videoStore] Export path not found for clip:",
                    clip.id,
                    mediaItem
                );
                continue;
            }

            clips.push({
                clipId: clip.id,
                input_path: inputPath,

                // Timeline position
                start: Number(clip.start) || 0,

                // Source trim position
                offset: Number(clip.offset) || 0,

                // Timeline duration
                duration: Number(clip.duration) || 0,

                // Playback speed
                speed: Number(clip.speed) || 1,

                // Audio
                volume: Number(clip.volume ?? 1),
                muted: Boolean(clip.muted),
                fadeIn: Number(clip.fadeIn) || 0,
                fadeOut: Number(clip.fadeOut) || 0,

                // Transform
                x: Number(clip.x) || 0,
                y: Number(clip.y) || 0,
                scale: Number(clip.scale ?? 100),
                rotation: Number(clip.rotation) || 0,
                opacity: Number(clip.opacity ?? 100),

                // Effects
                effects: effects.value
                    .filter(effect =>
                        effect.clipId === clip.id &&
                        effect.enabled !== false
                    )
                    .map(effect => ({
                        id: effect.id,
                        type: effect.type,
                        enabled: effect.enabled !== false,
                        startTime: Number(effect.startTime) || 0,
                        endTime:
                            effect.endTime == null
                                ? null
                                : Number(effect.endTime),
                        settings: {
                            ...(effect.settings || {})
                        }
                    }))
            });
        }
    }

    if (!clips.length) {
        throw new Error(
            "No exportable video clips were found on the timeline."
        );
    }

    // Timeline order
    clips.sort((a, b) => {
        if (a.start !== b.start) {
            return a.start - b.start;
        }

        return String(a.clipId).localeCompare(
            String(b.clipId),
            undefined,
            { numeric: true }
        );
    });

    return clips;
}

    function notifyExportProgress(value) {

        const progress =
            Math.min(
                100,
                Math.max(
                    0,
                    Number(value) || 0
                )
            );

        renderProgress.value =
            progress;

        exportStatus.value.progress =
            progress;

        exportProgressListeners.forEach(
            listener => {

                try {
                    listener(progress);
                } catch (error) {
                    console.error(
                        "Export progress listener error:",
                        error
                    );
                }
            }
        );
    }

    function onExportProgress(listener) {

        if (
            typeof listener !== "function"
        ) {
            return () => {};
        }

        exportProgressListeners.add(
            listener
        );

        return () => {
            exportProgressListeners.delete(
                listener
            );
        };
    }

async function downloadExportFile(outputPath, filename) {
    try {
        if (!outputPath && !filename) {
            throw new Error("Export output file is missing.");
        }

        let finalFilename = filename || "";

        if (!finalFilename && outputPath) {
            finalFilename = String(outputPath)
                .split(/[\\/]/)
                .pop();
        }

        if (!finalFilename) {
            finalFilename = "EasyAIStudio_Render.mp4";
        }

        const downloadUrl =
            `http://127.0.0.1:8000/exports/${encodeURIComponent(finalFilename)}`;

        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error(
                `Export file could not be downloaded (${response.status}).`
            );
        }

        const blob = await response.blob();

        if (!blob || blob.size === 0) {
            throw new Error("Downloaded export file is empty.");
        }

        if (selectedDirectoryHandle) {
            try {
                const permission =
                    await selectedDirectoryHandle.queryPermission(
                        { mode: "readwrite" }
                    );

                if (permission === "granted") {
                    const fileHandle =
                        await selectedDirectoryHandle.getFileHandle(
                            finalFilename,
                            { create: true }
                        );

                    const writable =
                        await fileHandle.createWritable();

                    await writable.write(blob);
                    await writable.close();

                    return true;
                }
            } catch (folderError) {
                console.error(
                    "[videoStore] Could not save to selected folder, falling back to default download:",
                    folderError
                );
            }
        }

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = finalFilename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);

        return true;

    } catch (error) {
        console.error(
            "[videoStore] Export download failed:",
            error
        );

        return false;
    }
}

    async function pollExportStatus() {

        if (!exportStatus.value.id) {
            return;
        }

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/api/videos/export/status"
                );

            if (!response.ok) {
                throw new Error(
                    "Export status error: " + response.status
                );
            }

            const data =
                await response.json();

            if (
                data &&
                data.export
            ) {

                exportStatus.value = {
                    ...exportStatus.value,
                    ...data.export
                };
            }

            const encoderProgress =
                data?.encoder?.progress;

            const backendProgress =
                Number(
                    data?.export?.progress
                );

            let progress =
                Number.isFinite(
                    backendProgress
                )
                    ? backendProgress
                    : 0;

            if (
                encoderProgress &&
                Number.isFinite(
                    Number(
                        encoderProgress.percent
                    )
                )
            ) {
                progress =
                    Number(
                        encoderProgress.percent
                    );
            }

            notifyExportProgress(
                progress
            );

            const status =
                String(
                    data?.export?.status || ""
                ).toLowerCase();

            if (status === "completed") {
    rendering.value = false;
    notifyExportProgress(100);
    clearExportPollTimer();

    await downloadExportFile(
        exportStatus.value.output,
        exportStatus.value.filename
    );

    return;
}

            if (
                status === "failed" ||
                status === "cancelled"
            ) {

                rendering.value = false;

                clearExportPollTimer();

                return;
            }

            if (rendering.value) {

                exportPollTimer =
                    setTimeout(
                        pollExportStatus,
                        500
                    );
            }

        } catch (error) {

            console.error(
                "Export status polling error:",
                error
            );

            if (rendering.value) {

                exportPollTimer =
                    setTimeout(
                        pollExportStatus,
                        1000
                    );
            }
        }
    }

    /*
    ==========================================================
    START EXPORT
    ==========================================================
    */

    async function startExport(
        settings = {}
    ) {

        if (rendering.value) {
            return null;
        }

        clearExportPollTimer();

        rendering.value = true;
        renderProgress.value = 0;

        exportStatus.value = {
            id: null,
            status: "preparing",
            progress: 0,
            input: "",
            output: "",
            filename: "",
            message: "Preparing export...",
            started_at: null,
            completed_at: null
        };

        try {

            const mergedSettings = {
                ...structuredClone(
                    toRaw(
                        exportSettings.value
                    )
                ),
                ...settings
            };

            const format =
                normalizeExportFormat(
                    mergedSettings.format
                );

            const codec =
                normalizeExportCodec(
                    mergedSettings.codec
                );

            const resolution =
                normalizeResolution(
                    mergedSettings.resolution
                );

            const fps =
                Math.max(
                    1,
                    Number(
                        mergedSettings.fps
                    ) || 30
                );

            const bitrate =
                normalizeBitrate(
                    mergedSettings.bitrate
                );

            const audioCodec =
                String(
                    mergedSettings.audioCodec ||
                    "aac"
                ).toLowerCase();

            const audioBitrate =
                normalizeAudioBitrate(
                    mergedSettings.audioBitrate
                );

            const filename =
                String(
                    mergedSettings.filename ||
                    "EasyAIStudio_Render"
                )
                    .replace(
                        /\.[^.]+$/,
                        ""
                    )
                    .trim() ||
                "EasyAIStudio_Render";

            const exportClips = await resolveExportInput();

            exportStatus.value.message =
            "Starting export...";

            /*
             * Keep the local store settings normalized
             * for the next export.
             */
            exportSettings.value = {
                ...toRaw(
                    exportSettings.value
                ),
                format,
                codec: codec.toLowerCase(),
                resolution,
                fps,
                bitrate,
                audioCodec,
                audioBitrate,
                filename,
                destination:
                    mergedSettings.destination ||
                    mergedSettings.outputFolder ||
                    ""
            };

            const payload = {
                clips: exportClips,
                timeline: true,
                format,
                codec,
                resolution: resolution.width + "x" + resolution.height,
                fps,
                bitrate,
                audioCodec,
                audioBitrate,
                filename,
                transitions: toRaw(transitions.value)
           };

            const response =
                await fetch(
                    "http://127.0.0.1:8000/api/videos/export",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            if (!response.ok) {

                let message =
                    "Export request failed: " + response.status;

                try {

                    const errorData =
                        await response.json();

                    if (errorData.detail) {
                        message =
                            String(
                                errorData.detail
                            );
                    }

                } catch {
                    // Keep default message.
                }

                throw new Error(message);
            }

            const data =
                await response.json();

            if (
                !data ||
                data.success !== true ||
                !data.export
            ) {
                throw new Error(
                    "Backend did not return a valid export job."
                );
            }

            exportStatus.value = {
                ...exportStatus.value,
                ...data.export
            };

            rendering.value = true;

            notifyExportProgress(
                Number(
                    data.export.progress
                ) || 0
            );

            /*
             * Start status polling.
             */
            exportPollTimer =
                setTimeout(
                    pollExportStatus,
                    300
                );

            return data.export;

        } catch (error) {

            console.error(
                "Start Export Error:",
                error
            );

            rendering.value = false;

            clearExportPollTimer();

            exportStatus.value = {
                ...exportStatus.value,
                status: "failed",
                message:
                    error?.message ||
                    "Export failed."
            };

            return null;
        }
    }

    /*
    ==========================================================
    CANCEL EXPORT
    ==========================================================
    */

    async function cancelExport() {

        if (!rendering.value) {
            return;
        }

        clearExportPollTimer();

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/api/videos/export/cancel",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify({
                                export_id:
                                    exportStatus.value.id
                            })
                    }
                );

            if (!response.ok) {

                console.warn(
                    "Export cancel request failed:",
                    response.status
                );
            }

        } catch (error) {

            console.error(
                "Cancel Export Error:",
                error
            );
        }

        rendering.value = false;

        exportStatus.value = {
            ...exportStatus.value,
            status: "cancelled",
            message: "Export cancelled."
        };

        notifyExportProgress(0);
    }

    /*
    ==========================================================
    SELECT OUTPUT FOLDER
    ==========================================================
    */

    let selectedDirectoryHandle = null;

    async function selectFolder() {

        /*
         * The browser cannot directly expose arbitrary
         * filesystem folders unless the File System
         * Access API is available.
         *
         * We therefore use showDirectoryPicker when
         * supported and keep the actual directory handle
         * so we can write the exported file directly into
         * it later (not just display its name).
         *
         * The write permission is requested right here,
         * while we still have an active user gesture from
         * the click that triggered this function -
         * requesting it later (e.g. after export finishes)
         * can be silently denied by the browser.
         */
        if (
            typeof window !== "undefined" &&
            typeof window.showDirectoryPicker ===
                "function"
        ) {

            try {

                const handle =
                    await window.showDirectoryPicker();

                if (!handle) {
                    return "";
                }

                const permission =
                    await handle.requestPermission(
                        { mode: "readwrite" }
                    );

                if (permission !== "granted") {

                    selectedDirectoryHandle = null;

                    console.warn(
                        "Write permission for the selected folder was not granted."
                    );

                    return "";
                }

                selectedDirectoryHandle = handle;

                return handle.name || "";

            } catch (error) {

                if (
                    error?.name ===
                    "AbortError"
                ) {
                    return "";
                }

                console.error(
                    "Select Folder Error:",
                    error
                );

                return "";
            }
        }

        console.warn(
            "Folder selection is not supported by this browser."
        );

        return "";
    }

    /*
    ==========================================================
    EXPORT ESTIMATES
    ==========================================================
    */

    function calculateEstimatedSize(
        settings = {}
    ) {

        const duration =
            Math.max(
                0,
                Number(
                    project.value.duration
                ) || 0
            );

        const bitrateMbps =
            normalizeBitrate(
                settings.bitrate ??
                exportSettings.value.bitrate
            );

        const videoBytes =
            duration *
            bitrateMbps *
            1000000 /
            8;

        const audioKbps =
            normalizeAudioBitrate(
                settings.audioBitrate ??
                exportSettings.value.audioBitrate
            );

        const audioBytes =
            duration *
            audioKbps *
            1000 /
            8;

        const totalBytes =
            videoBytes +
            audioBytes;

        if (totalBytes <= 0) {
            return "—";
        }

        if (
            totalBytes >=
            1024 * 1024 * 1024
        ) {

            return (
                (
                    totalBytes /
                    (1024 * 1024 * 1024)
                ).toFixed(2) +
                " GB"
            );
        }

        return (
            (
                totalBytes /
                (1024 * 1024)
            ).toFixed(1) +
            " MB"
        );
    }

    function calculateEstimatedTime(
        settings = {}
    ) {

        const duration =
            Math.max(
                0,
                Number(
                    project.value.duration
                ) || 0
            );

        if (duration <= 0) {
            return "—";
        }

        /*
         * NVENC generally renders faster than realtime,
         * but this is intentionally conservative because
         * actual render speed depends on effects, resolution,
         * GPU load and source media.
         */
        const useGPU =
            settings.useGPU !== undefined
                ? Boolean(settings.useGPU)
                : true;

        const multiplier =
            useGPU
                ? 0.5
                : 1.5;

        const seconds =
            Math.max(
                1,
                duration * multiplier
            );

        if (seconds < 60) {

            return (
                Math.ceil(seconds) +
                " sec"
            );
        }

        const minutes =
            Math.ceil(
                seconds / 60
            );

        return (
            minutes +
            " min"
        );
    }

    /*
    ==========================================================
    EXPORT / RENDER QUEUE
    ==========================================================
    */

    function addRenderJob(
        settings = {}
    ) {

        const job = {
            id: crypto.randomUUID(),
            status: "waiting",
            progress: 0,
            createdAt: new Date(),
            settings: {
                ...structuredClone(
                    toRaw(
                        exportSettings.value
                    )
                ),
                ...settings
            }
        };

        renderQueue.value.push(job);

        return job;
    }

    function removeRenderJob(jobId) {

        const index =
            renderQueue.value.findIndex(
                job => job.id === jobId
            );

        if (index === -1) {
            return;
        }

        renderQueue.value.splice(
            index,
            1
        );
    }

    function clearRenderQueue() {

        renderQueue.value = [];
    }

    function startRender(jobId) {

        const job =
            renderQueue.value.find(
                item => item.id === jobId
            );

        if (!job) {
            return;
        }

        rendering.value = true;
        renderProgress.value = 0;

        job.status = "rendering";
        job.progress = 0;
    }

    function updateRenderProgress(value) {

        const progress =
            Math.min(
                100,
                Math.max(
                    0,
                    Number(value) || 0
                )
            );

        renderProgress.value =
            progress;

        const renderingJob =
            renderQueue.value.find(
                job =>
                    job.status === "rendering"
            );

        if (renderingJob) {
            renderingJob.progress =
                progress;
        }

        notifyExportProgress(
            progress
        );
    }

    function finishRender() {

        rendering.value = false;
        renderProgress.value = 100;

        const renderingJob =
            renderQueue.value.find(
                job =>
                    job.status === "rendering"
            );

        if (renderingJob) {
            renderingJob.progress = 100;
            renderingJob.status = "finished";
        }
    }

    function cancelRender() {

        rendering.value = false;
        renderProgress.value = 0;

        const renderingJob =
            renderQueue.value.find(
                job =>
                    job.status === "rendering"
            );

        if (renderingJob) {
            renderingJob.status = "cancelled";
            renderingJob.progress = 0;
        }
    }

    const exportPresets = [
        {
            id: "youtube1080",
            name: "YouTube 1080p"
        },
        {
            id: "youtube4k",
            name: "YouTube 4K"
        },
        {
            id: "shorts",
            name: "YouTube Shorts"
        },
        {
            id: "instagram",
            name: "Instagram Reel"
        },
        {
            id: "tiktok",
            name: "TikTok"
        },
        {
            id: "gif",
            name: "Animated GIF"
        },
        {
            id: "png",
            name: "PNG Sequence"
        },
        {
            id: "jpg",
            name: "JPEG Sequence"
        },
        {
            id: "wav",
            name: "WAV Audio"
        },
        {
            id: "mp3",
            name: "MP3 Audio"
        }
    ];

    /*
    ==========================================================
    PROJECT SERIALIZATION
    ==========================================================
    */

    function serializeProject() {

        const cleanMedia =
            media.value.map(item => {

                const {
                    file,
                    ...rest
                } = toRaw(item);

                return rest;
            });

        return JSON.stringify({
            project: toRaw(project.value),
            media: cleanMedia,
            tracks: toRaw(tracks.value),
            transitions: toRaw(transitions.value),
            effects: toRaw(effects.value),
            keyframes: toRaw(keyframes.value),
            exportSettings:
                toRaw(exportSettings.value)
        });
    }

    function loadProject(json) {

        if (!json) {
            return;
        }

        try {

            const data =
                typeof json === "string"
                    ? JSON.parse(json)
                    : json;

            if (data.project) {
                project.value =
                    structuredClone(
                        data.project
                    );
            }

            media.value =
                structuredClone(
                    data.media || []
                );

            tracks.value =
                (data.tracks || []).map(
                    track => ({
                        ...track,
                        clips:
                            (track.clips || []).map(
                                clip => ({
                                    ...clip,
                                    id:
                                        clip.id ??
                                        crypto.randomUUID(),
                                    volume:
                                        clip.volume ?? 1,
                                    muted:
                                        clip.muted ?? false,
                                    fadeIn:
                                        clip.fadeIn ?? 0,
                                    fadeOut:
                                        clip.fadeOut ?? 0,
                                    x:
                                        clip.x ?? 0,
                                    y:
                                        clip.y ?? 0,
                                    scale:
                                        clip.scale ?? 100,
                                    rotation:
                                        clip.rotation ?? 0,
                                    opacity:
                                        clip.opacity ?? 100
                                })
                            )
                    })
                );

            transitions.value =
                structuredClone(
                    data.transitions || []
                );

            effects.value =
                structuredClone(
                    data.effects || []
                );

            keyframes.value =
                structuredClone(
                    data.keyframes || []
                );

            if (data.exportSettings) {
                exportSettings.value =
                    {
                        ...toRaw(
                            exportSettings.value
                        ),
                        ...structuredClone(
                            data.exportSettings
                        )
                    };
            }

            effects.value.forEach(effect => {

                if (
                    effect.startTime === undefined ||
                    effect.startTime === null
                ) {
                    effect.startTime = 0;
                }

                if (
                    effect.endTime === undefined
                ) {
                    effect.endTime = null;
                }

                if (!effect.settings) {
                    effect.settings = {};
                }

                if (effect.enabled === undefined) {
                    effect.enabled = true;
                }
            });

            nextMediaId =
                Math.max(
                    0,
                    ...media.value.map(
                        item =>
                            Number(item.id) || 0
                    )
                ) + 1;

            nextTrackId =
                Math.max(
                    0,
                    ...tracks.value.map(
                        track =>
                            Number(track.id) || 0
                    )
                ) + 1;

            nextClipId =
                Math.max(
                    0,
                    ...tracks.value.flatMap(
                        track =>
                            track.clips || []
                    ).map(
                        clip =>
                            Number(clip.id) || 0
                    )
                ) + 1;

            nextTransitionId =
                Math.max(
                    0,
                    ...transitions.value.map(
                        transition =>
                            Number(
                                transition.id
                            ) || 0
                    )
                ) + 1;

            nextEffectId =
                Math.max(
                    0,
                    ...effects.value.map(
                        effect =>
                            Number(effect.id) || 0
                    )
                ) + 1;

            nextKeyframeId =
                Math.max(
                    0,
                    ...keyframes.value.map(
                        keyframe =>
                            Number(
                                keyframe.id
                            ) || 0
                    )
                ) + 1;

            currentTime.value = 0;
            playhead.value = 0;
            isPlaying.value = false;

            playback.value.playing = false;

            selectedTrackId.value = null;
            selectedClipId.value = null;
            selectedTransitionId.value = null;
            selectedEffectId.value = null;
            selectedKeyframeId.value = null;

            updateProjectDuration();

            clearHistory();

            undoStack.value = [
                createSnapshot()
            ];

        } catch (error) {

            console.error(
                "Load Project Error:",
                error
            );
        }
    }

    /*
    ==========================================================
    AUTO SAVE
    ==========================================================
    */

    function autoSave() {

        try {

            localStorage.setItem(
                "easy-ai-video-project",
                serializeProject()
            );

        } catch (error) {

            console.error(
                "Auto Save Error:",
                error
            );
        }
    }

    function restoreAutoSave() {

        try {

            const saved =
                localStorage.getItem(
                    "easy-ai-video-project"
                );

            if (!saved) {
                return;
            }

            loadProject(saved);

        } catch (error) {

            console.error(
                "Restore Auto Save Error:",
                error
            );
        }
    }

    /*
    ==========================================================
    RESET
    ==========================================================
    */

    function resetStore() {

        clearExportPollTimer();

        createProject();

        clearClipboard();
        clearRenderQueue();

        rendering.value = false;
        renderProgress.value = 0;

        exportStatus.value = {
            id: null,
            status: "idle",
            progress: 0,
            input: "",
            output: "",
            filename: "",
            message: "",
            started_at: null,
            completed_at: null
        };
    }

    /*
    ==========================================================
    RETURN
    ==========================================================
    */

    return {

        /*
        PROJECT
        */

        project,
        createProject,
        renameProject,
        updateProjectDuration,
        contextMenu,

        /*
        PLAYBACK
        */

        currentTime,
        playhead,
        isPlaying,
        playback,

        timelineZoom,
        previewZoom,

        play,
        pause,
        stop,
        seek,
        frameForward,
        frameBackward,
        setPlaybackSpeed,
        toggleLoop,
        updatePlayback,

        setTimelineZoom,
        setPreviewZoom,

        /*
        MEDIA
        */

        media,
        addMedia,
        removeMedia,
        clearMedia,
        openImportDialog,
        loadBackendVideos,
        loadBackendMedia:
        loadBackendVideos,
        addRemoteVideo,
        addRemoteAudio,

        /*
        TRACKS
        */

        tracks,
        selectedTrack,
        selectedTrackId,

        addTrack,
        removeTrack,
        toggleTrackVisible,
        toggleTrackLocked,
        toggleTrackMute,
        toggleTrackSolo,

        /*
        CLIPS
        */

        selectedClip,
        selectedClipId,

        addClip,
        removeClip,
        duplicateClip,
        moveClip,
        resizeClip,
        splitClip,
        selectClip,
        deselectClip,
        rippleMove,

        /*
        CLIPBOARD
        */

        clipboard,
        copyClip,
        pasteClip,
        clearClipboard,

        /*
        TRANSITIONS
        */

        transitions,
        transitionPresets,

        selectedTransition,
        selectedTransitionId,

        addTransition,
        removeTransition,
        updateTransition,
        getTransitionBetween,
        selectTransition,
        deselectTransition,

        /*
        EFFECTS
        */

        effects,
        effectPresets,

        selectedEffect,
        selectedEffectId,

        addEffect,
        removeEffect,
        updateEffect,
        setEffectRange,
        getEffectTimelineRange,
        toggleEffect,
        getEffectsForClip,
        getActiveEffectsAtTime,
        isEffectActive,
        selectEffect,
        deselectEffect,

        /*
        KEYFRAMES
        */

        keyframes,
        keyframeInterpolation,

        selectedKeyframeId,
        selectedKeyframe,

        getKeyframes,
        addKeyframe,
        removeKeyframe,
        selectKeyframe,
        deselectKeyframe,
        updateKeyframe,

        /*
        AUDIO
        */

        setClipVolume,
        setClipMuted,
        setClipFadeIn,
        setClipFadeOut,

        /*
        HISTORY
        */

        undo,
        redo,
        saveHistory,
        clearHistory,

        /*
        EXPORT
        */

        exportSettings,
        exportPresets,

        rendering,
        renderProgress,
        exportStatus,
        renderQueue,

        startExport,
        cancelExport,
        onExportProgress,

        selectFolder,
        calculateEstimatedSize,
        calculateEstimatedTime,

        addRenderJob,
        removeRenderJob,
        clearRenderQueue,
        startRender,
        updateRenderProgress,
        finishRender,
        cancelRender,

        /*
        HELPERS
        */

        secondsToPixels,
        pixelsToSeconds,
        snapTime,

        /*
        SERIALIZATION
        */
        
        createSnapshot,
        serializeProject,
        loadProject,

        /*
        AUTO SAVE
        */

        autoSave,
        restoreAutoSave,

        /*
        RESET
        */

        resetStore
    };
});

