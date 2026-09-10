/* ==========================================================
   Easy AI Studio
   File: frontend/js/geminiManager.js
   Version: 1.0.0
   Sprint: 6 - Gemini Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Gemini Manager
   ========================================================== */

const GeminiManager = {

    apiKey: "",

    baseURL: "https://generativelanguage.googleapis.com/v1beta",

    currentModel: "gemini-2.5-pro",

    models: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.apiKey = Storage.get(

            "gemini-api-key",

            ""

        );

        console.log(

            "Gemini Manager Ready"

        );

    },

    /* ======================================================
       API Key
       ====================================================== */

    setApiKey(key) {

        this.apiKey = key;

        Storage.set(

            "gemini-api-key",

            key

        );

    },

    /* ======================================================
       Generate
       ====================================================== */

    async generate(prompt) {

        return API.request(

            this.baseURL +

            "/models/" +

            this.currentModel +

            ":generateContent?key=" +

            this.apiKey,

            {

                method: "POST",

                body: JSON.stringify({

                    contents: [

                        {

                            parts: [

                                {

                                    text: prompt

                                }

                            ]

                        }

                    ]

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

            "/models?key=" +

            this.apiKey

        );

        this.models =

            result.models || [];

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

    },

    /* ======================================================
       Status
       ====================================================== */

    configured() {

        return this.apiKey.length > 0;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.GeminiManager = GeminiManager;