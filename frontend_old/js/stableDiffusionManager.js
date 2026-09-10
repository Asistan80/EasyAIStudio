/* ==========================================================
   Easy AI Studio
   File: frontend/js/stableDiffusionManager.js
   Version: 1.0.0
   Sprint: 6 - Stable Diffusion Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Stable Diffusion Manager
   ========================================================== */

const StableDiffusionManager = {

    host: "http://127.0.0.1:7860",

    connected: false,

    models: [],

    samplers: [],

    /* ======================================================
       Initialize
       ====================================================== */

    async init() {

        console.log(

            "Stable Diffusion Manager Ready"

        );

        await this.checkConnection();

    },

    /* ======================================================
       Check Connection
       ====================================================== */

    async checkConnection() {

        try {

            await API.get(

                this.host +

                "/sdapi/v1/options"

            );

            this.connected = true;

            Notification.success(

                "Connected to Stable Diffusion."

            );

        }

        catch {

            this.connected = false;

            Notification.warning(

                "Stable Diffusion is offline."

            );

        }

    },

    /* ======================================================
       Text To Image
       ====================================================== */

    async txt2img(options = {}) {

        return API.post(

            this.host +

            "/sdapi/v1/txt2img",

            options

        );

    },

    /* ======================================================
       Image To Image
       ====================================================== */

    async img2img(options = {}) {

        return API.post(

            this.host +

            "/sdapi/v1/img2img",

            options

        );

    },

    /* ======================================================
       Get Models
       ====================================================== */

    async refreshModels() {

        this.models = await API.get(

            this.host +

            "/sdapi/v1/sd-models"

        );

        return this.models;

    },

    /* ======================================================
       Get Samplers
       ====================================================== */

    async refreshSamplers() {

        this.samplers = await API.get(

            this.host +

            "/sdapi/v1/samplers"

        );

        return this.samplers;

    },

    /* ======================================================
       Progress
       ====================================================== */

    async progress() {

        return API.get(

            this.host +

            "/sdapi/v1/progress"

        );

    },

    /* ======================================================
       Interrupt
       ====================================================== */

    async interrupt() {

        return API.post(

            this.host +

            "/sdapi/v1/interrupt",

            {}

        );

    },

    /* ======================================================
       Connected
       ====================================================== */

    isConnected() {

        return this.connected;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.StableDiffusionManager = StableDiffusionManager;