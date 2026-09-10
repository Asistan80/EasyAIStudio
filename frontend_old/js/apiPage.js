/* ==========================================================
   Easy AI Studio
   File: frontend/js/apiPage.js
   Version: 1.0.0
   Sprint: 7 - API Manager Page
   ========================================================== */

"use strict";

/* ==========================================================
   API Page
   ========================================================== */

const APIPage = {

    initialized: false,

    providers: [],

    selectedProvider: null,

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

            "API Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.providers =

            APIKeyManager.providers();

        EventBus.emit(

            "api.updated",

            this.providers

        );

    },

    /* ======================================================
       Select Provider
       ====================================================== */

    select(provider) {

        this.selectedProvider =

            provider;

    },

    /* ======================================================
       Save API Key
       ====================================================== */

    saveKey(key) {

        if (

            !this.selectedProvider

        ) {

            return;

        }

        APIKeyManager.set(

            this.selectedProvider,

            key

        );

        this.refresh();

    },

    /* ======================================================
       Remove API Key
       ====================================================== */

    removeKey(provider) {

        APIKeyManager.remove(

            provider

        );

        this.refresh();

    },

    /* ======================================================
       Test Connection
       ====================================================== */

    test(provider) {

        EventBus.emit(

            "api.test",

            provider

        );

    },

    /* ======================================================
       Provider List
       ====================================================== */

    all() {

        return this.providers;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.APIPage = APIPage;