/* ==========================================================
   Easy AI Studio
   File: frontend/js/chatManager.js
   Version: 1.0.0
   Sprint: 6 - AI Chat Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Chat Manager
   ========================================================== */

const ChatManager = {

    conversations: [],

    activeConversation: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Chat Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.conversations = Storage.get(

            "chat-conversations",

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            "chat-conversations",

            this.conversations

        );

    },

    /* ======================================================
       Create Conversation
       ====================================================== */

    create(title = "New Chat") {

        const conversation = {

            id: Utils.uuid(),

            title,

            model: null,

            created: Utils.now(),

            updated: Utils.now(),

            messages: []

        };

        this.conversations.unshift(

            conversation

        );

        this.activeConversation =

            conversation.id;

        this.save();

        return conversation;

    },

    /* ======================================================
       Active Conversation
       ====================================================== */

    current() {

        return this.conversations.find(

            item =>

            item.id ===

            this.activeConversation

        );

    },

    /* ======================================================
       Add Message
       ====================================================== */

    addMessage(role, content) {

        const conversation =

            this.current();

        if (!conversation) {

            return;

        }

        conversation.messages.push({

            id: Utils.uuid(),

            role,

            content,

            time: Utils.now()

        });

        conversation.updated =

            Utils.now();

        this.save();

        EventBus.emit(

            "chat.updated",

            conversation

        );

    },

    /* ======================================================
       Rename
       ====================================================== */

    rename(id, title) {

        const conversation =

            this.get(id);

        if (!conversation) {

            return;

        }

        conversation.title = title;

        this.save();

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.conversations.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Delete
       ====================================================== */

    remove(id) {

        this.conversations =

            this.conversations.filter(

                item =>

                item.id !== id

            );

        if (

            this.activeConversation === id

        ) {

            this.activeConversation = null;

        }

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.conversations;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ChatManager = ChatManager;