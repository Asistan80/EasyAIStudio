/* ==========================================================
   Easy AI Studio
   File: frontend/js/extensionsPage.js
   Version: 1.0.0
   Sprint: 7 - Extensions Page
   ========================================================== */

"use strict";

/* ==========================================================
   Extensions Page
   ========================================================== */

const ExtensionsPage = {

    initialized: false,

    extensions: [],

    installed: [],

    marketplace: [],

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

            "Extensions Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.extensions =

            ExtensionManager.all();

        this.installed =

            this.extensions.filter(

                extension =>

                extension.installed

            );

        this.marketplace =

            this.extensions.filter(

                extension =>

                !extension.installed

            );

        EventBus.emit(

            "extensions.updated",

            this.extensions

        );

    },

    /* ======================================================
       Install
       ====================================================== */

    install(id) {

        ExtensionManager.install(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Remove
       ====================================================== */

    remove(id) {

        ExtensionManager.remove(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Enable
       ====================================================== */

    enable(id) {

        ExtensionManager.enable(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Disable
       ====================================================== */

    disable(id) {

        ExtensionManager.disable(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        return this.extensions.filter(

            extension =>

            extension.name

                .toLowerCase()

                .includes(

                    keyword.toLowerCase()

                )

        );

    },

    /* ======================================================
       All Extensions
       ====================================================== */

    all() {

        return this.extensions;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ExtensionsPage = ExtensionsPage;