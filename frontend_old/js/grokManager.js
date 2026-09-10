/* ==========================================================
   Easy AI Studio
   File: frontend/js/grokManager.js
   Version: 1.0.0
   Sprint: 6 - Grok Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Grok Manager
   ========================================================== */

const GrokManager = {

    apiKey: "",

    baseURL: "https://api.x.ai/v1",

    currentModel: "grok-4",

    models: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.apiKey = Storage.get(

            "grok-api-key",

            ""

        );

        console.log(

            "Grok Manager Ready"

        );

    },

    /* ======================================================
       Set API Key
       ====================================================== */

    setApiKey(key) {

        this.apiKey = key;

        Storage.set(

            "grok-api-key",

            key

        );

    },

    /* ======================================================
       Request Headers
       ====================================================== */

    headers() {

        return {

            "Content-Type": "application/json",

            "Authorization":

                `Bearer ${this.apiKey}`

        };

    },

    /* ======================================================
       Chat Completion
       ====================================================== */

    async chat(messages) {

        return API.request(

            this.baseURL +

            "/chat/completions",

            {

                method: "POST",

                headers: this.headers(),

                body: JSON.stringify({

                    model: this.currentModel,

                    messages,

                    stream: false

                })

            }

        );

    },

    /* ======================================================
       Refresh Models
       ====================================================== */

    async refreshModels() {

        const result = await API.request(

            this.baseURL +

            "/models",

            {

                headers: this.headers()

            }

        );

        this.models = result.data || [];

        return this.models;

    },

    /* ======================================================
       Active Model
       ====================================================== */

    setModel(model) {

        this.currentModel = model;

    },

    getModel() {

        return this.currentModel;

    },

    /* ======================================================
       API Configured
       ====================================================== */

    configured() {

        return this.apiKey.length > 0;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.GrokManager = GrokManager;