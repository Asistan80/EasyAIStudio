/* ==========================================================
   Easy AI Studio
   File: frontend/js/assistantPage.js
   Version: 1.0.0
   Sprint: 7 - Assistant Page
   ========================================================== */

"use strict";

/* ==========================================================
   Assistant Page
   ========================================================== */

const AssistantPage = {

    initialized: false,

    assistants: [],

    activeAssistant: null,

    conversation: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.refresh();

        console.log(

            "Assistant Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.assistants =

            AssistantManager.all();

        EventBus.emit(

            "assistants.updated",

            this.assistants

        );

    },

    /* ======================================================
       Create Assistant
       ====================================================== */

    create(data = {}) {

        const assistant =

            AssistantManager.create({

                name:

                    data.name ||

                    "New Assistant",

                provider:

                    data.provider ||

                    "ollama",

                model:

                    data.model ||

                    ""

            });

        this.refresh();

        return assistant;

    },

    /* ======================================================
       Open Assistant
       ====================================================== */

    open(id) {

        this.activeAssistant =

            AssistantManager.get(id);

        this.conversation = [];

    },

    /* ======================================================
       Send Message
       ====================================================== */

    send(message) {

        if (

            !this.activeAssistant ||

            !message

        ) {

            return;

        }

        this.conversation.push({

            role: "user",

            content: message,

            created: Utils.now()

        });

        AssistantManager.chat(

            this.activeAssistant.id,

            message

        );

    },

    /* ======================================================
       Receive Message
       ====================================================== */

    receive(message) {

        this.conversation.push({

            role: "assistant",

            content: message,

            created: Utils.now()

        });

    },

    /* ======================================================
       Remove Assistant
       ====================================================== */

    remove(id) {

        AssistantManager.remove(id);

        this.refresh();

    },

    /* ======================================================
       Assistant List
       ====================================================== */

    all() {

        return this.assistants;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.AssistantPage = AssistantPage;