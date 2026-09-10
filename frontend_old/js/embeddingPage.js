/* ==========================================================
   Easy AI Studio
   File: frontend/js/embeddingPage.js
   Version: 1.0.0
   Sprint: 7 - Embedding Page
   ========================================================== */

"use strict";

/* ==========================================================
   Embedding Page
   ========================================================== */

const EmbeddingPage = {

    initialized: false,

    embeddings: [],

    selectedCollection: null,

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

            "Embedding Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.embeddings =

            EmbeddingManager.all();

        EventBus.emit(

            "embeddings.updated",

            this.embeddings

        );

    },

    /* ======================================================
       Create Embedding
       ====================================================== */

    async create(text) {

        if (!text) {

            return;

        }

        await EmbeddingManager.create(

            text

        );

        this.refresh();

    },

    /* ======================================================
       Collection
       ====================================================== */

    selectCollection(id) {

        this.selectedCollection = id;

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        this.embeddings =

            EmbeddingManager.search(

                keyword

            );

    },

    /* ======================================================
       Remove
       ====================================================== */

    remove(id) {

        EmbeddingManager.remove(id);

        this.refresh();

    },

    /* ======================================================
       All
       ====================================================== */

    all() {

        return this.embeddings;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.EmbeddingPage = EmbeddingPage;