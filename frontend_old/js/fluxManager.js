/* ==========================================================
   Easy AI Studio
   File: frontend/js/fluxManager.js
   Version: 1.0.0
   Sprint: 6 - FLUX Manager
   ========================================================== */

"use strict";

/* ==========================================================
   FLUX Manager
   ========================================================== */

const FluxManager = {

    host: "",

    provider: "local",

    connected: false,

    models: [],

    currentModel: null,

    /* ======================================================
       Initialize
       ====================================================== */

    async init() {

        console.log(

            "FLUX Manager Ready"

        );

    },

    /* ======================================================
       Configure
       ====================================================== */

    configure(config = {}) {

        this.host =

            config.host ||

            this.host;

        this.provider =

            config.provider ||

            this.provider;

    },

    /* ======================================================
       Connection
       ====================================================== */

    async checkConnection() {

        if (!this.host) {

            this.connected = false;

            return false;

        }

        try {

            await API.get(

                this.host + "/health"

            );

            this.connected = true;

        }

        catch {

            this.connected = false;

        }

        return this.connected;

    },

    /* ======================================================
       Generate Image
       ====================================================== */

    async generate(options = {}) {

        return API.post(

            this.host +

            "/generate",

            options

        );

    },

    /* ======================================================
       Models
       ====================================================== */

    async refreshModels() {

        this.models = await API.get(

            this.host +

            "/models"

        );

        EventBus.emit(

            "flux.models",

            this.models

        );

        return this.models;

    },

    /* ======================================================
       Active Model
       ====================================================== */

    setModel(model) {

        this.currentModel = model;

        EventBus.emit(

            "flux.model.changed",

            model

        );

    },

    /* ======================================================
       Current Model
       ====================================================== */

    getModel() {

        return this.currentModel;

    },

    /* ======================================================
       Cancel
       ====================================================== */

    async cancel() {

        return API.post(

            this.host +

            "/cancel",

            {}

        );

    },

    /* ======================================================
       Status
       ====================================================== */

    isConnected() {

        return this.connected;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.FluxManager = FluxManager;