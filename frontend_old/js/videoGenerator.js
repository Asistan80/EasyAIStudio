/* ==========================================================
   Easy AI Studio
   File: frontend/js/videoGenerator.js
   Version: 1.0.0
   Sprint: 5 - Video Generator Module
   ========================================================== */

"use strict";

/* ==========================================================
   Video Generator
   ========================================================== */

const VideoGenerator = {

    queue: [],

    history: [],

    currentJob: null,

    status: "idle",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Video Generator Ready"

        );

    },

    /* ======================================================
       Create Job
       ====================================================== */

    create(options = {}) {

        const job = {

            id: Utils.uuid(),

            title: options.title || "Untitled",

            prompt: options.prompt || "",

            images: options.images || [],

            audio: options.audio || null,

            duration: options.duration || 10,

            fps: options.fps || 30,

            resolution: options.resolution || "1920x1080",

            engine: options.engine || "Default",

            created: Utils.now(),

            progress: 0,

            status: "queued"

        };

        this.queue.push(job);

        Notification.success(

            "Video added to queue."

        );

        this.run();

        return job;

    },

    /* ======================================================
       Run Queue
       ====================================================== */

    async run() {

        if (

            this.status === "running"

        ) {

            return;

        }

        if (

            this.queue.length === 0

        ) {

            return;

        }

        this.status = "running";

        this.currentJob = this.queue.shift();

        this.currentJob.status = "running";

        for (

            let progress = 0;

            progress <= 100;

            progress += 10

        ) {

            this.currentJob.progress = progress;

            await Utils.delay(300);

        }

        this.currentJob.status = "completed";

        this.history.unshift(

            this.currentJob

        );

        Notification.success(

            "Video generation completed."

        );

        this.currentJob = null;

        this.status = "idle";

        this.run();

    },

    /* ======================================================
       Cancel
       ====================================================== */

    cancel() {

        if (!this.currentJob) {

            return;

        }

        this.currentJob.status = "cancelled";

        Notification.warning(

            "Video generation cancelled."

        );

        this.currentJob = null;

        this.status = "idle";

    },

    /* ======================================================
       Current Job
       ====================================================== */

    getCurrentJob() {

        return this.currentJob;

    },

    /* ======================================================
       Queue
       ====================================================== */

    getQueue() {

        return this.queue;

    },

    /* ======================================================
       History
       ====================================================== */

    getHistory() {

        return this.history;

    },

    /* ======================================================
       Clear History
       ====================================================== */

    clearHistory() {

        this.history = [];

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.VideoGenerator = VideoGenerator;