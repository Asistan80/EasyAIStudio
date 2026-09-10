/* ==========================================================
   Easy AI Studio
   File: frontend/js/trainingManager.js
   Version: 1.0.0
   Sprint: 6 - Training Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Training Manager
   ========================================================== */

const TrainingManager = {

    jobs: [],

    activeJob: null,

    running: false,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Training Manager Ready"

        );

    },

    /* ======================================================
       Create Training Job
       ====================================================== */

    create(data = {}) {

        const job = {

            id: Utils.uuid(),

            name: data.name || "Training Job",

            dataset: data.dataset || "",

            model: data.model || "",

            epochs: data.epochs || 1,

            batchSize: data.batchSize || 1,

            learningRate: data.learningRate || 0.0001,

            progress: 0,

            loss: 0,

            accuracy: 0,

            status: "queued",

            created: Utils.now()

        };

        this.jobs.push(job);

        EventBus.emit(

            "training.created",

            job

        );

        this.start();

        return job;

    },

    /* ======================================================
       Start Queue
       ====================================================== */

    async start() {

        if (

            this.running

        ) {

            return;

        }

        const next = this.jobs.find(

            job =>

            job.status === "queued"

        );

        if (!next) {

            return;

        }

        this.running = true;

        this.activeJob = next;

        next.status = "training";

        for (

            let progress = 0;

            progress <= 100;

            progress += 2

        ) {

            next.progress = progress;

            next.loss =

                Number(

                    (1 - progress / 100)

                    .toFixed(4)

                );

            next.accuracy =

                Number(

                    progress.toFixed(2)

                );

            EventBus.emit(

                "training.progress",

                next

            );

            await Utils.delay(150);

        }

        next.status = "completed";

        next.progress = 100;

        next.loss = 0;

        next.accuracy = 100;

        Notification.success(

            "Training completed."

        );

        EventBus.emit(

            "training.completed",

            next

        );

        this.activeJob = null;

        this.running = false;

        this.start();

    },

    /* ======================================================
       Cancel
       ====================================================== */

    cancel(id) {

        const job = this.get(id);

        if (!job) {

            return;

        }

        job.status = "cancelled";

        EventBus.emit(

            "training.cancelled",

            job

        );

    },

    /* ======================================================
       Find Job
       ====================================================== */

    get(id) {

        return this.jobs.find(

            job =>

            job.id === id

        );

    },

    /* ======================================================
       Current Job
       ====================================================== */

    current() {

        return this.activeJob;

    },

    /* ======================================================
       All Jobs
       ====================================================== */

    all() {

        return this.jobs;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.TrainingManager = TrainingManager;