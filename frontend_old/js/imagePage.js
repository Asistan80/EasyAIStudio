/* ==========================================================
   Easy AI Studio
   File: frontend/js/imagePage.js
   Version: 1.0.0
   Sprint: 7 - Image Studio Page
   ========================================================== */

"use strict";

/* ==========================================================
   Image Page
   ========================================================== */

const ImagePage = {

    initialized: false,

    provider: "comfyui",

    model: "",

    queue: [],

    gallery: [],

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

            "Image Page Ready"

        );

    },

    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {

        EventBus.on(

            "image.generation.created",

            job => {

                this.queue.push(

                    job

                );

            }

        );

    },

    /* ======================================================
       New Project
       ====================================================== */

    newProject(name = "New Image Project") {

        return ImageStudio.create({

            name

        });

    },

    /* ======================================================
       Generate
       ====================================================== */

    generate(prompt) {

        if (!prompt) {

            return;

        }

        ImageStudio.generate({

            provider:

                this.provider,

            model:

                this.model,

            prompt

        });

    },

    /* ======================================================
       Add Result
       ====================================================== */

    addResult(image) {

        this.gallery.unshift(

            image

        );

        ImageStudio.addImage(

            image

        );

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
       Gallery
       ====================================================== */

    clearGallery() {

        this.gallery = [];

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ImagePage = ImagePage;