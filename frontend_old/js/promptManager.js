/* ==========================================================
   Easy AI Studio
   File: frontend/js/promptManager.js
   Version: 1.0.0
   Sprint: 6 - Prompt Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Prompt Manager
   ========================================================== */

const PromptManager = {

    storageKey: "prompts",

    prompts: [],

    categories: [

        "General",

        "Chat",

        "Image",

        "Video",

        "Code",

        "Workflow"

    ],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Prompt Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.prompts = Storage.get(

            this.storageKey,

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.prompts

        );

    },

    /* ======================================================
       Create Prompt
       ====================================================== */

    create(data = {}) {

        const prompt = {

            id: Utils.uuid(),

            title: data.title || "New Prompt",

            category: data.category || "General",

            content: data.content || "",

            favorite: false,

            created: Utils.now(),

            updated: Utils.now()

        };

        this.prompts.unshift(prompt);

        this.save();

        Notification.success(

            "Prompt created."

        );

        return prompt;

    },

    /* ======================================================
       Update Prompt
       ====================================================== */

    update(id, content) {

        const prompt = this.get(id);

        if (!prompt) {

            return;

        }

        prompt.content = content;

        prompt.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Favorite
       ====================================================== */

    toggleFavorite(id) {

        const prompt = this.get(id);

        if (!prompt) {

            return;

        }

        prompt.favorite = !prompt.favorite;

        this.save();

    },

    /* ======================================================
       Delete
       ====================================================== */

    remove(id) {

        this.prompts = this.prompts.filter(

            item => item.id !== id

        );

        this.save();

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword

            .trim()

            .toLowerCase();

        return this.prompts.filter(

            item =>

            item.title

                .toLowerCase()

                .includes(keyword)

        );

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.prompts.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.prompts;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.PromptManager = PromptManager;