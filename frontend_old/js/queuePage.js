/* ==========================================================
   Easy AI Studio
   File: frontend/js/queuePage.js
   Version: 1.0.0
   Sprint: 7 - Queue Manager Page
   ========================================================== */

"use strict";

/* ==========================================================
   Queue Page
   ========================================================== */

const QueuePage = {

    initialized: false,

    jobs: [],

    running: [],

    completed: [],

    failed: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.registerEvents();

        this.refresh();

        console.log(

            "Queue Page Ready"

        );

    },

    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {

        EventBus.on(

            "queue.updated",

            () => {

                this.refresh();

            }

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.jobs =

            QueueManager.all();

        this.running =

            this.jobs.filter(

                job =>

                job.status === "running"

            );

        this.completed =

            this.jobs.filter(

                job =>

                job.status === "completed"

            );

        this.failed =

            this.jobs.filter(

                job =>

                job.status === "failed"

            );

    },

    /* ======================================================
       Add Job
       ====================================================== */

    add(job) {

        QueueManager.add(

            job

        );

        this.refresh();

    },

    /* ======================================================
       Cancel Job
       ====================================================== */

    cancel(id) {

        QueueManager.cancel(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Retry Job
       ====================================================== */

    retry(id) {

        QueueManager.retry(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Clear Completed
       ====================================================== */

    clearCompleted() {

        QueueManager.clearCompleted();

        this.refresh();

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

window.QueuePage = QueuePage;