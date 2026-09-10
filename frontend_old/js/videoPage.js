/* ==========================================================
   Easy AI Studio
   File: frontend/js/videoPage.js
   Version: 1.0.0
   Sprint: 7 - Video Studio Page
   ========================================================== */

"use strict";

/* ==========================================================
   Video Page
   ========================================================== */

const VideoPage = {

    initialized: false,

    provider: "comfyui",

    model: "",

    timeline: [],

    exports: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.registerEvents();

        console.log(

            "Video Page Ready"

        );

    },

    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {

        EventBus.on(

            "video.export.created",

            job => {

                this.exports.push(

                    job

                );

            }

        );

    },

    /* ======================================================
       New Project
       ====================================================== */

    newProject(name = "New Video Project") {

        return VideoStudio.create({

            name

        });

    },

    /* ======================================================
       Add Clip
       ====================================================== */

    addClip(clip) {

        this.timeline.push(

            clip

        );

        VideoStudio.addClip(

            clip

        );

    },

    /* ======================================================
       Export
       ====================================================== */

    exportVideo(format = "mp4") {

        VideoStudio.export({

            format,

            provider:

                this.provider,

            model:

                this.model

        });

    },

    /* ======================================================
       Provider
       ====================================================== */

    setProvider(provider) {

        this.provider = provider;

    },

    /* ======================================================
       Model
       ====================================================== */

    setModel(model) {

        this.model = model;

    },

    /* ======================================================
       Timeline
       ====================================================== */

    clearTimeline() {

        this.timeline = [];

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.VideoPage = VideoPage;