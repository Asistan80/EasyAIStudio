/* ==========================================================
   Easy AI Studio
   File: frontend/js/modelPage.js
   Version: 1.0.0
   Sprint: 7 - Model Manager Page
   ========================================================== */

"use strict";

/* ==========================================================
   Model Page
   ========================================================== */

const ModelPage = {

    initialized: false,

    provider: "ollama",

    models: [],

    filtered: [],

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

            "Model Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        const current =

            ProviderManager.get(

                this.provider

            );

        this.models =

            current?.manager?.models ||

            [];

        this.filtered = [

            ...this.models

        ];

        EventBus.emit(

            "models.updated",

            this.filtered

        );

    },

    /* ======================================================
       Provider
       ====================================================== */

    setProvider(provider) {

        this.provider = provider;

        this.refresh();

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword = "") {

        keyword = keyword

            .trim()

            .toLowerCase();

        this.filtered =

            this.models.filter(

                model =>

                model.name

                    .toLowerCase()

                    .includes(keyword)

            );

    },

    /* ======================================================
       Download
       ====================================================== */

    download(model) {

        ModelDownloader.add({

            provider:

                this.provider,

            model:

                model.name

        });

    },

    /* ======================================================
       Delete
       ====================================================== */

    remove(id) {

        this.models =

            this.models.filter(

                model =>

                model.id !== id

            );

    },

    /* ======================================================
       Models
       ====================================================== */

    all() {

        return this.filtered;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ModelPage = ModelPage;