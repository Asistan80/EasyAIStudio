/* ==========================================================
   Easy AI Studio
   File: frontend/js/ollamaManager.js
   Version: 1.0.0
   Sprint: 6 - Ollama Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Ollama Manager
   ========================================================== */

const OllamaManager = {

    host: "http://127.0.0.1:11434",

    connected: false,

    models: [],

    /* ======================================================
       Initialize
       ====================================================== */

    async init() {

        console.log(

            "Ollama Manager Ready"

        );

        await this.checkConnection();

    },

    /* ======================================================
       Check Connection
       ====================================================== */

    async checkConnection() {

        try {

            await API.get(

                this.host + "/api/tags"

            );

            this.connected = true;

            Notification.success(

                "Connected to Ollama."

            );

        }

        catch {

            this.connected = false;

            Notification.warning(

                "Ollama is offline."

            );

        }

    },

    /* ======================================================
       Refresh Models
       ====================================================== */

    async refresh() {

        try {

            const response = await API.get(

                this.host + "/api/tags"

            );

            this.models =

                response.models || [];

            EventBus.emit(

                "ollama.models",

                this.models

            );

        }

        catch (error) {

            Logger.error(

                "Failed to load Ollama models.",

                error

            );

        }

    },

    /* ======================================================
       Generate
       ====================================================== */

    async generate(model, prompt) {

        return API.post(

            this.host + "/api/generate",

            {

                model,

                prompt,

                stream: false

            }

        );

    },

    /* ======================================================
       Chat
       ====================================================== */

    async chat(messages, model) {

        return API.post(

            this.host + "/api/chat",

            {

                model,

                messages,

                stream: false

            }

        );

    },

    /* ======================================================
       Pull Model
       ====================================================== */

    async pull(model) {

        return API.post(

            this.host + "/api/pull",

            {

                name: model

            }

        );

    },

    /* ======================================================
       Delete Model
       ====================================================== */

    async remove(model) {

        return API.request(

            this.host + "/api/delete",

            {

                method: "DELETE",

                body: JSON.stringify({

                    name: model

                })

            }

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

window.OllamaManager = OllamaManager;