/* ==========================================================
   Easy AI Studio
   File: frontend/js/extensions.js
   Version: 1.0.0
   Sprint: 5 - Extensions Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Extensions Manager
   ========================================================== */

const Extensions = {

    storageKey: "extensions",

    list: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Extensions Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.list = Storage.get(

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

            this.list

        );

        if (window.Dashboard) {

            Dashboard.set(

                "plugins",

                this.list.length

            );

        }

    },

    /* ======================================================
       Install
       ====================================================== */

    install(data = {}) {

        const extension = {

            id: Utils.uuid(),

            name: data.name || "New Extension",

            version: data.version || "1.0.0",

            author: data.author || "Unknown",

            description: data.description || "",

            enabled: true,

            installed: Utils.now(),

            homepage: data.homepage || "",

            repository: data.repository || ""

        };

        this.list.push(extension);

        this.save();

        Notification.success(

            "Extension installed."

        );

        return extension;

    },

    /* ======================================================
       Remove
       ====================================================== */

    remove(id) {

        this.list = this.list.filter(

            extension =>

            extension.id !== id

        );

        this.save();

        Notification.info(

            "Extension removed."

        );

    },

    /* ======================================================
       Enable
       ====================================================== */

    enable(id) {

        const extension = this.get(id);

        if (!extension) {

            return;

        }

        extension.enabled = true;

        this.save();

    },

    /* ======================================================
       Disable
       ====================================================== */

    disable(id) {

        const extension = this.get(id);

        if (!extension) {

            return;

        }

        extension.enabled = false;

        this.save();

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.list.find(

            extension =>

            extension.id === id

        );

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword

            .trim()

            .toLowerCase();

        return this.list.filter(

            extension =>

            extension.name

                .toLowerCase()

                .includes(keyword)

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.list;

    },

    /* ======================================================
       Clear
       ====================================================== */

    clear() {

        this.list = [];

        this.save();

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Extensions = Extensions;