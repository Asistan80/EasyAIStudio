import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useGifStore = defineStore("gif", () => {

    const frames = ref([]);

    const selectedFrameId = ref(null);

    const fps = ref(10);

    const isPlaying = ref(false);

    const currentFrameIndex = ref(0);

    let nextId = 1;

    let playbackTimer = null;

    let playbackStopped = false;

    const selectedFrame = computed(() => {

        return frames.value.find(
            frame => frame.id === selectedFrameId.value
        ) || null;

    });

    function addFrame() {

        const frame = {

            id: nextId++,

            name: `Frame ${nextId - 1}`,

            image: null,

            duration: 100,

            x: 0,

            y: 0,

            scale: 1,

            rotation: 0,

            opacity: 1,

            visible: true,

        };

        frames.value.push(frame);

if (frames.value.length === 1) {

    currentFrameIndex.value = 0;

}

selectedFrameId.value = frame.id;

 return frame;

}

    function selectFrame(id) {

        selectedFrameId.value = id;

    }

    function updateFrameImage(id, image) {

        const frame = frames.value.find(f => f.id === id);

        if (!frame) return;

        frame.image = image;

    }

    function removeFrame(id) {

    const index = frames.value.findIndex(
        frame => frame.id === id
    );

    if (index === -1) return;

    frames.value.splice(index, 1);

    if (!frames.value.length) {

        stop();

        selectedFrameId.value = null;

        currentFrameIndex.value = 0;

        return;

    }

    if (currentFrameIndex.value >= frames.value.length) {

        currentFrameIndex.value = 0;

    }

    selectedFrameId.value =
        frames.value[currentFrameIndex.value].id;

}

    function updateFrameDuration(id, duration) {

    const frame = frames.value.find(
        frame => frame.id === id
    );

    if (!frame) return;

    frame.duration = Number(duration);

    }

    function setFPS(value) {

    fps.value = Number(value);

    if (isPlaying.value) {

        pause();

        play();

    }

}

    function play() {

    if (!frames.value.length) return;

    if (isPlaying.value) return;

    playbackStopped = false;

    isPlaying.value = true;

    if (currentFrameIndex.value >= frames.value.length) {

        currentFrameIndex.value = 0;

    }

    selectedFrameId.value =
        frames.value[currentFrameIndex.value].id;

    playCurrentFrame();

}

    function stop() {

    pause();

    currentFrameIndex.value = 0;

    if (frames.value.length) {

        selectedFrameId.value =
            frames.value[0].id;

    }

}

function pause() {

    playbackStopped = true;

    if (playbackTimer) {

        clearTimeout(playbackTimer);

        playbackTimer = null;

    }

    isPlaying.value = false;

}

   function nextFrame() {

    if (!frames.value.length) return;

    currentFrameIndex.value++;

    if (currentFrameIndex.value >= frames.value.length) {

        currentFrameIndex.value = 0;

    }

    selectedFrameId.value =
        frames.value[currentFrameIndex.value].id;

}
       
function playCurrentFrame() {

    if (playbackStopped) return;

    const frame =
        frames.value[currentFrameIndex.value];

    if (!frame) return;

    playbackTimer = setTimeout(() => {

        nextFrame();

        playCurrentFrame();

    }, frame.duration);

}
      
    return {

    frames,

    selectedFrame,

    selectedFrameId,

    fps,

    isPlaying,

    currentFrameIndex,

    addFrame,

    selectFrame,

    updateFrameImage,

    removeFrame,

    updateFrameDuration,

    setFPS,

    play,

    pause,

    stop,

    nextFrame,

};

});