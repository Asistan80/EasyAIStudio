/* ==========================================================
   Easy AI Studio
   File: frontend/js/modelDownloader.js
   Version: 1.0.0
   Sprint: 6 - Model Downloader
   ========================================================== */

"use strict";

/* ==========================================================
   Model Downloader
   ========================================================== */

const ModelDownloader = {

    downloads: [],

    activeDownload: null,

    running: false,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Model Downloader Ready"

        );

    },

    /* ======================================================
       Add Download
       ====================================================== */

    add(data = {}) {

        const item = {

            id: Utils.uuid(),

            provider: data.provider || "Unknown",

            model: data.model || "Unnamed Model",

            url: data.url || "",

            destination: data.destination || "",

            progress: 0,

            speed: "0 MB/s",

            status: "queued",

            created: Utils.now()

        };

        this.downloads.push(item);

        EventBus.emit(

            "download.added",

            item

        );

        this.start();

        return item;

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

        const next = this.downloads.find(

            item =>

            item.status === "queued"

        );

        if (!next) {

            return;

        }

        this.running = true;

        this.activeDownload = next;

        next.status = "downloading";

        for (

            let progress = 0;

            progress <= 100;

            progress += 2

        ) {

            next.progress = progress;

            next.speed =

                Utils.random(

                    20,

                    180

                ) + " MB/s";

            EventBus.emit(

                "download.progress",

                next

            );

            await Utils.delay(120);

        }

        next.status = "completed";

        next.speed = "0 MB/s";

        Notification.success(

            `${next.model} downloaded.`

        );

        EventBus.emit(

            "download.completed",

            next

        );

        this.activeDownload = null;

        this.running = false;

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

        item.speed = "0 MB/s";

        EventBus.emit(

            "download.cancelled",

            item

        );

    },

    /* ======================================================
       Find Download
       ====================================================== */

    get(id) {

        return this.downloads.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Active Download
       ====================================================== */

    current() {

        return this.activeDownload;

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.downloads;

    },

    /* ======================================================
       Clear Finished
       ====================================================== */

    clearCompleted() {

        this.downloads = this.downloads.filter(

            item =>

            item.status !== "completed"

        );

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ModelDownloader = ModelDownloader;