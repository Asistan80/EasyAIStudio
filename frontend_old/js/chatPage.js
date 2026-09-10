/* ==========================================================
   Easy AI Studio
   File: frontend/js/chatPage.js
   Version: 1.0.0
   Sprint: 7 - Chat Page
   ========================================================== */

"use strict";

/* ==========================================================
   Chat Page
   ========================================================== */

const ChatPage = {

    initialized: false,

    currentProvider: "ollama",

    currentModel: "",

    messages: [],

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

            "Chat Page Ready"

        );

    },

    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {

        EventBus.on(

            "provider.changed",

            provider => {

                this.currentProvider =

                    provider.id;

            }

        );

    },

    /* ======================================================
       New Chat
       ====================================================== */

    newChat() {

        ChatStudio.create({

            provider:

                this.currentProvider,

            model:

                this.currentModel

        });

        this.messages = [];

    },

    /* ======================================================
       Send Message
       ====================================================== */

    send(text) {

        if (!text) {

            return;

        }

        ChatStudio.addMessage(

            "user",

            text

        );

        this.messages.push({

            role: "user",

            content: text

        });

        EventBus.emit(

            "chat.send",

            text

        );

    },

    /* ======================================================
       Receive Message
       ====================================================== */

    receive(text) {

        ChatStudio.addMessage(

            "assistant",

            text

        );

        this.messages.push({

            role: "assistant",

            content: text

        });

    },

    /* ======================================================
       Provider
       ====================================================== */

    setProvider(id) {

        this.currentProvider = id;

    },

    /* ======================================================
       Model
       ====================================================== */

    setModel(model) {

        this.currentModel = model;

    },

    /* ======================================================
       History
       ====================================================== */

    clear() {

        this.messages = [];

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ChatPage = ChatPage;