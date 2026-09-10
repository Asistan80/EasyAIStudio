/* ==========================================================
   Easy AI Studio
   File: frontend/js/extensionStore.js
   Version: 1.0.0
   Sprint: 6 - Extension Store
   ========================================================== */

"use strict";

/* ==========================================================
   Extension Store
   ========================================================== */

const ExtensionStore = {

    repository:

        "https://extensions.easyaistudio.org",

    extensions: [],

    installed: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.installed = Storage.get(

            "installed-extensions",

            []

        );

        console.log(

            "Extension Store Ready"

        );

    },

    /* ======================================================
       Refresh Repository
       ====================================================== */

    async refresh() {

        try {

            const result = await API.get(

                this.repository +

                "/extensions.json"

            );

            this.extensions = result;

            EventBus.emit(

                "extensions.updated",

                result

            );

        }

        catch (error) {

            Logger.error(

                "Extension repository unavailable.",

                error

            );

        }

    },

    /* ======================================================
       Install
       ====================================================== */

    install(extension) {

        this.installed.push(

            extension

        );

        Storage.set(

            "installed-extensions",

            this.installed

        );

        EventBus.emit(

            "extension.installed",

            extension

        );

        Notification.success(

            "Extension installed."

        );

    },

    /* ======================================================
       Uninstall
       ====================================================== */

    uninstall(id) {

        this.installed =

            this.installed.filter(

                item =>

                item.id !== id

            );

        Storage.set(

            "installed-extensions",

            this.installed

        );

        EventBus.emit(

            "extension.removed",

            id

        );

    },

    /* ======================================================
       Installed
       ====================================================== */

    isInstalled(id) {

        return this.installed.some(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword

            .trim()

            .toLowerCase();

        return this.extensions.filter(

            item =>

            item.name

                .toLowerCase()

                .includes(keyword)

        );

    },

    /* ======================================================
       Repository
       ====================================================== */

    all() {

        return this.extensions;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ExtensionStore = ExtensionStore;