/* ==========================================================
   Easy AI Studio
   File: frontend/js/promptPage.js
   Version: 1.0.0
   Sprint: 7 - Prompt Library Page
   ========================================================== */

"use strict";

/* ==========================================================
   Prompt Page
   ========================================================== */

const PromptPage = {

    initialized: false,

    prompts: [],

    categories: [],

    currentCategory: "All",

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

            "Prompt Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.prompts =

            PromptManager.all();

        this.categories =

            PromptManager.categories();

        EventBus.emit(

            "prompts.updated",

            this.prompts

        );

    },

    /* ======================================================
       Create Prompt
       ====================================================== */

    create(data = {}) {

        PromptManager.create({

            title:

                data.title ||

                "New Prompt",

            category:

                data.category ||

                "General",

            content:

                data.content ||

                ""

        });

        this.refresh();

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        this.prompts =

            PromptManager.search(

                keyword

            );

    },

    /* ======================================================
       Category
       ====================================================== */

    filter(category) {

        this.currentCategory =

            category;

        this.prompts =

            PromptManager.filter(

                category

            );

    },

    /* ======================================================
       Delete Prompt
       ====================================================== */

    remove(id) {

        PromptManager.remove(id);

        this.refresh();

    },

    /* ======================================================
       Prompt List
       ====================================================== */

    all() {

        return this.prompts;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.PromptPage = PromptPage;