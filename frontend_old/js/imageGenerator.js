/* ==========================================================
   Easy AI Studio
   File: frontend/js/imageGenerator.js
   Version: 1.0.0
   Sprint: 5 - Image Generator Module
   ========================================================== */

"use strict";

/* ==========================================================
   Image Generator
   ========================================================== */

const ImageGenerator = {

    queue: [],

    history: [],

    currentJob: null,

    status: "idle",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Image Generator Ready"

        );

    },

    /* ======================================================
       Generate
       ====================================================== */

    generate(options = {}) {

        const job = {

            id: Utils.uuid(),

            prompt: options.prompt || "",

            negativePrompt: options.negativePrompt || "",

            model: options.model || "",

            width: options.width || 1024,

            height: options.height || 1024,

            steps: options.steps || 30,

            guidance: options.guidance || 7,

            seed: options.seed || -1,

            sampler: options.sampler || "",

            created: Utils.now(),

            status: "queued"

        };

        this.queue.push(job);

        Notification.success(

            "Image added to queue."

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

        this.currentJob =

            this.queue.shift();

        this.currentJob.status =

            "running";

        console.log(

            "Generating:",

            this.currentJob.prompt

        );

        await Utils.delay(2000);

        this.currentJob.status =

            "completed";

        this.history.unshift(

            this.currentJob

        );

        Notification.success(

            "Image generation completed."

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

        this.currentJob.status =

            "cancelled";

        this.currentJob = null;

        this.status = "idle";

        Notification.warning(

            "Generation cancelled."

        );

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
       Status
       ====================================================== */

    getStatus() {

        return this.status;

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

window.ImageGenerator = ImageGenerator;