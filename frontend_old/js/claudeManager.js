/* ==========================================================
   Easy AI Studio
   File: frontend/js/claudeManager.js
   Version: 1.0.0
   Sprint: 6 - Claude Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Claude Manager
   ========================================================== */

const ClaudeManager = {

    apiKey: "",

    baseURL: "https://api.anthropic.com/v1",

    currentModel: "claude-sonnet-4",

    models: [],

    anthropicVersion: "2023-06-01",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.apiKey = Storage.get(

            "claude-api-key",

            ""

        );

        console.log(

            "Claude Manager Ready"

        );

    },

    /* ======================================================
       API Key
       ====================================================== */

    setApiKey(key) {

        this.apiKey = key;

        Storage.set(

            "claude-api-key",

            key

        );

    },

    /* ======================================================
       Headers
       ====================================================== */

    headers() {

        return {

            "Content-Type": "application/json",

            "x-api-key": this.apiKey,

            "anthropic-version": this.anthropicVersion

        };

    },

    /* ======================================================
       Send Message
       ====================================================== */

    async chat(messages) {

        return API.request(

            this.baseURL +

            "/messages",

            {

                method: "POST",

                headers: this.headers(),

                body: JSON.stringify({

                    model: this.currentModel,

                    max_tokens: 4096,

                    messages

                })

            }

        );

    },

    /* ======================================================
       Current Model
       ====================================================== */

    setModel(model) {

        this.currentModel = model;

    },

    getModel() {

        return this.currentModel;

    },

    /* ======================================================
       API Status
       ====================================================== */

    configured() {

        return this.apiKey.length > 0;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ClaudeManager = ClaudeManager;