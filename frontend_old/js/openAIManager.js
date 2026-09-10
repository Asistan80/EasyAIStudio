/* ==========================================================
   Easy AI Studio
   File: frontend/js/openAIManager.js
   Version: 1.0.0
   Sprint: 6 - OpenAI Manager
   ========================================================== */

"use strict";

/* ==========================================================
   OpenAI Manager
   ========================================================== */

const OpenAIManager = {

    apiKey: "",

    baseURL: "https://api.openai.com/v1",

    models: [],

    currentModel: "gpt-5.5",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.apiKey = Storage.get(

            "openai-api-key",

            ""

        );

        console.log(

            "OpenAI Manager Ready"

        );

    },

    /* ======================================================
       Set API Key
       ====================================================== */

    setApiKey(key) {

        this.apiKey = key;

        Storage.set(

            "openai-api-key",

            key

        );

    },

    /* ======================================================
       Headers
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

                    messages

                })

            }

        );

    },

    /* ======================================================
       Responses API
       ====================================================== */

    async response(input) {

        return API.request(

            this.baseURL +

            "/responses",

            {

                method: "POST",

                headers: this.headers(),

                body: JSON.stringify({

                    model: this.currentModel,

                    input

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
       Current Model
       ====================================================== */

    setModel(model) {

        this.currentModel = model;

    },

    getModel() {

        return this.currentModel;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.OpenAIManager = OpenAIManager;