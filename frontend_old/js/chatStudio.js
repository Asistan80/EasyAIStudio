/* ==========================================================
   Easy AI Studio
   File: frontend/js/chatStudio.js
   Version: 1.0.0
   Sprint: 6 - Chat Studio
   ========================================================== */

"use strict";

/* ==========================================================
   Chat Studio
   ========================================================== */

const ChatStudio = {

    sessions: [],

    activeSession: null,

    streaming: false,

    attachments: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Chat Studio Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.sessions = Storage.get(

            "chat-studio-sessions",

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            "chat-studio-sessions",

            this.sessions

        );

    },

    /* ======================================================
       Create Session
       ====================================================== */

    create(data = {}) {

        const session = {

            id: Utils.uuid(),

            title: data.title || "New Chat",

            provider: data.provider || "",

            model: data.model || "",

            messages: [],

            created: Utils.now(),

            updated: Utils.now()

        };

        this.sessions.unshift(

            session

        );

        this.activeSession = session.id;

        this.save();

        EventBus.emit(

            "chat.session.created",

            session

        );

        return session;

    },

    /* ======================================================
       Add Message
       ====================================================== */

    addMessage(role, content) {

        const session = this.get(

            this.activeSession

        );

        if (!session) {

            return;

        }

        session.messages.push({

            id: Utils.uuid(),

            role,

            content,

            created: Utils.now()

        });

        session.updated = Utils.now();

        this.save();

        EventBus.emit(

            "chat.message.added",

            session

        );

    },

    /* ======================================================
       Attach File
       ====================================================== */

    attach(file) {

        this.attachments.push({

            id: Utils.uuid(),

            ...file

        });

    },

    /* ======================================================
       Clear Attachments
       ====================================================== */

    clearAttachments() {

        this.attachments = [];

    },

    /* ======================================================
       Streaming
       ====================================================== */

    setStreaming(state) {

        this.streaming = state;

    },

    /* ======================================================
       Find Session
       ====================================================== */

    get(id) {

        return this.sessions.find(

            session =>

            session.id === id

        );

    },

    /* ======================================================
       Remove Session
       ====================================================== */

    remove(id) {

        this.sessions = this.sessions.filter(

            session =>

            session.id !== id

        );

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.sessions;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ChatStudio = ChatStudio;