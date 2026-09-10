/* ==========================================================
   Easy AI Studio
   File: frontend/js/embeddingManager.js
   Version: 1.0.0
   Sprint: 6 - Embedding Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Embedding Manager
   ========================================================== */

const EmbeddingManager = {

    storageKey: "embeddings",

    provider: "openai",

    model: "text-embedding-3-small",

    embeddings: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Embedding Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.embeddings = Storage.get(

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

            this.embeddings

        );

    },

    /* ======================================================
       Configure
       ====================================================== */

    configure(options = {}) {

        this.provider =

            options.provider ||

            this.provider;

        this.model =

            options.model ||

            this.model;

    },

    /* ======================================================
       Create Embedding
       ====================================================== */

    async create(text) {

        const embedding = {

            id: Utils.uuid(),

            text,

            provider: this.provider,

            model: this.model,

            vector: [],

            created: Utils.now()

        };

        this.embeddings.push(

            embedding

        );

        this.save();

        EventBus.emit(

            "embedding.created",

            embedding

        );

        return embedding;

    },

    /* ======================================================
       Delete Embedding
       ====================================================== */

    remove(id) {

        this.embeddings =

            this.embeddings.filter(

                item =>

                item.id !== id

            );

        this.save();

    },

    /* ======================================================
       Find Embedding
       ====================================================== */

    get(id) {

        return this.embeddings.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword

            .toLowerCase();

        return this.embeddings.filter(

            item =>

            item.text

                .toLowerCase()

                .includes(keyword)

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.embeddings;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.EmbeddingManager = EmbeddingManager;