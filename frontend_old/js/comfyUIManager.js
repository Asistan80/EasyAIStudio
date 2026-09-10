/* ==========================================================
   Easy AI Studio
   File: frontend/js/comfyUIManager.js
   Version: 1.0.0
   Sprint: 6 - ComfyUI Manager
   ========================================================== */

"use strict";

/* ==========================================================
   ComfyUI Manager
   ========================================================== */

const ComfyUIManager = {

    host: "http://127.0.0.1:8188",

    connected: false,

    queue: [],

    history: [],

    /* ======================================================
       Initialize
       ====================================================== */

    async init() {

        console.log(

            "ComfyUI Manager Ready"

        );

        await this.checkConnection();

    },

    /* ======================================================
       Check Connection
       ====================================================== */

    async checkConnection() {

        try {

            await API.get(

                this.host + "/system_stats"

            );

            this.connected = true;

            Notification.success(

                "Connected to ComfyUI."

            );

        }

        catch {

            this.connected = false;

            Notification.warning(

                "ComfyUI is offline."

            );

        }

    },

    /* ======================================================
       Queue Prompt
       ====================================================== */

    async queuePrompt(workflow) {

        return API.post(

            this.host + "/prompt",

            {

                prompt: workflow

            }

        );

    },

    /* ======================================================
       Queue Status
       ====================================================== */

    async getQueue() {

        const result = await API.get(

            this.host + "/queue"

        );

        this.queue = result;

        return result;

    },

    /* ======================================================
       History
       ====================================================== */

    async getHistory() {

        const result = await API.get(

            this.host + "/history"

        );

        this.history = result;

        return result;

    },

    /* ======================================================
       Interrupt
       ====================================================== */

    async interrupt() {

        return API.post(

            this.host + "/interrupt",

            {}

        );

    },

    /* ======================================================
       Free Memory
       ====================================================== */

    async freeMemory() {

        return API.post(

            this.host + "/free",

            {}

        );

    },

    /* ======================================================
       System Stats
       ====================================================== */

    async systemStats() {

        return API.get(

            this.host + "/system_stats"

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

window.ComfyUIManager = ComfyUIManager;