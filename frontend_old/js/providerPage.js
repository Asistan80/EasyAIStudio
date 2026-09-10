/* ==========================================================
   Easy AI Studio
   File: frontend/js/providerPage.js
   Version: 1.0.0
   Sprint: 7 - Provider Manager Page
   ========================================================== */

"use strict";

/* ==========================================================
   Provider Page
   ========================================================== */

const ProviderPage = {

    initialized: false,

    providers: [],

    selected: null,

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

            "Provider Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.providers =

            ProviderManager.all();

        EventBus.emit(

            "providers.updated",

            this.providers

        );

    },

    /* ======================================================
       Select Provider
       ====================================================== */

    select(id) {

        const provider =

            ProviderManager.get(id);

        if (!provider) {

            return;

        }

        this.selected = provider;

        EventBus.emit(

            "provider.changed",

            provider

        );

    },

    /* ======================================================
       Connect
       ====================================================== */

    connect(id) {

        const provider =

            ProviderManager.get(id);

        if (!provider) {

            return;

        }

        provider.connected = true;

        EventBus.emit(

            "provider.connected",

            provider

        );

    },

    /* ======================================================
       Disconnect
       ====================================================== */

    disconnect(id) {

        const provider =

            ProviderManager.get(id);

        if (!provider) {

            return;

        }

        provider.connected = false;

        EventBus.emit(

            "provider.disconnected",

            provider

        );

    },

    /* ======================================================
       Selected Provider
       ====================================================== */

    current() {

        return this.selected;

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

window.ProviderPage = ProviderPage;