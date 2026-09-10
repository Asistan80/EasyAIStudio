/* ==========================================================
   Easy AI Studio
   File: frontend/js/downloadsPage.js
   Version: 1.0.0
   Sprint: 7 - Downloads Page
   ========================================================== */

"use strict";

/* ==========================================================
   Downloads Page
   ========================================================== */

const DownloadsPage = {

    initialized: false,

    downloads: [],

    activeDownloads: [],

    completedDownloads: [],

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

            "Downloads Page Ready"

        );

    },

    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {

        EventBus.on(

            "download.updated",

            () => {

                this.refresh();

            }

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.downloads =

            DownloadManager.all();

        this.activeDownloads =

            this.downloads.filter(

                item =>

                item.status === "downloading"

            );

        this.completedDownloads =

            this.downloads.filter(

                item =>

                item.status === "completed"

            );

    },

    /* ======================================================
       Add Download
       ====================================================== */

    add(data = {}) {

        DownloadManager.add({

            name:

                data.name ||

                "New Download",

            url:

                data.url ||

                "",

            type:

                data.type ||

                "file"

        });

        this.refresh();

    },

    /* ======================================================
       Pause
       ====================================================== */

    pause(id) {

        DownloadManager.pause(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Resume
       ====================================================== */

    resume(id) {

        DownloadManager.resume(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Cancel
       ====================================================== */

    cancel(id) {

        DownloadManager.cancel(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Clear Finished
       ====================================================== */

    clearCompleted() {

        DownloadManager.clearCompleted();

        this.refresh();

    },

    /* ======================================================
       All Downloads
       ====================================================== */

    all() {

        return this.downloads;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.DownloadsPage = DownloadsPage;