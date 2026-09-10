/* ==========================================================
   Easy AI Studio
   File: frontend/js/downloadManager.js
   Version: 1.0.0
   Sprint: 5 - Download Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Download Manager
   ========================================================== */

const DownloadManager = {

    downloads: [],

    active: null,

    status: "idle",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Download Manager Ready"

        );

    },

    /* ======================================================
       Add Download
       ====================================================== */

    add(options = {}) {

        const download = {

            id: Utils.uuid(),

            name: options.name || "Download",

            url: options.url || "",

            size: options.size || 0,

            downloaded: 0,

            speed: 0,

            progress: 0,

            status: "queued",

            created: Utils.now()

        };

        this.downloads.push(download);

        Notification.info(

            "Download added to queue."

        );

        this.start();

        return download;

    },

    /* ======================================================
       Start Queue
       ====================================================== */

    async start() {

        if (

            this.status === "running"

        ) {

            return;

        }

        const next = this.downloads.find(

            item =>

            item.status === "queued"

        );

        if (!next) {

            return;

        }

        this.status = "running";

        this.active = next;

        next.status = "downloading";

        for (

            let progress = 0;

            progress <= 100;

            progress += 5

        ) {

            next.progress = progress;

            next.downloaded =

                (next.size / 100) * progress;

            next.speed =

                Utils.random(

                    5,

                    60

                );

            await Utils.delay(200);

        }

        next.status = "completed";

        next.progress = 100;

        next.speed = 0;

        Notification.success(

            `${next.name} completed.`

        );

        this.active = null;

        this.status = "idle";

        this.start();

    },

    /* ======================================================
       Cancel
       ====================================================== */

    cancel(id) {

        const item = this.get(id);

        if (!item) {

            return;

        }

        item.status = "cancelled";

        item.speed = 0;

        Notification.warning(

            "Download cancelled."

        );

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.downloads.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Active
       ====================================================== */

    current() {

        return this.active;

    },

    /* ======================================================
       All Downloads
       ====================================================== */

    all() {

        return this.downloads;

    },

    /* ======================================================
       Clear Completed
       ====================================================== */

    clearCompleted() {

        this.downloads =

            this.downloads.filter(

                item =>

                item.status !== "completed"

            );

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.DownloadManager = DownloadManager;