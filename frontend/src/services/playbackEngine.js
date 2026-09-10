class PlaybackEngine {

    constructor() {

        this.timer = null;

        this.store = null;

    }

    attach(store) {

        this.store = store;

    }

    play() {

        if (!this.store) return;

        if (this.timer) return;

        this.store.isPlaying = true;

        const interval = () => {

            const fps = this.store.fps || 10;

            return 1000 / fps;

        };

        this.timer = setInterval(() => {

            this.nextFrame();

        }, interval());

    }

    pause() {

        if (!this.timer) return;

        clearInterval(this.timer);

        this.timer = null;

        if (this.store) {

            this.store.isPlaying = false;

        }

    }

    stop() {

        this.pause();

        if (!this.store) return;

        if (this.store.frames.length === 0) return;

        this.store.currentFrameIndex = 0;

        this.store.selectedFrameId =
            this.store.frames[0].id;

    }

    toggle() {

        if (this.timer) {

            this.pause();

        } else {

            this.play();

        }

    }

    nextFrame() {

        if (!this.store) return;

        const frames = this.store.frames;

        if (!frames.length) return;

        this.store.currentFrameIndex++;

        if (this.store.currentFrameIndex >= frames.length) {

            this.store.currentFrameIndex = 0;

        }

        this.store.selectedFrameId =
            frames[this.store.currentFrameIndex].id;

    }

    setFPS(value) {

        if (!this.store) return;

        this.store.fps = value;

        if (!this.timer) return;

        this.pause();

        this.play();

    }

    destroy() {

        this.pause();

        this.store = null;

    }

}

export const playbackEngine = new PlaybackEngine();