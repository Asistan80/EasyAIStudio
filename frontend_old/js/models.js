/* ==========================================================
   Easy AI Studio
   File: frontend/js/models.js
   Version: 1.0.0
   Sprint: 5 - AI Models Module
   ========================================================== */

"use strict";

/* ==========================================================
   Models Manager
   ========================================================== */

const Models = {

    storageKey: "models",

    list: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Models Ready"

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

                "models",

                this.list.length

            );

        }

    },

    /* ======================================================
       Add Model
       ====================================================== */

    add(data = {}) {

        const model = {

            id: Utils.uuid(),

            name: data.name || "New Model",

            provider: data.provider || "Local",

            type: data.type || "LLM",

            version: data.version || "1.0.0",

            path: data.path || "",

            size: data.size || 0,

            installed: true,

            enabled: true,

            created: Utils.now()

        };

        this.list.push(model);

        this.save();

        Notification.success(

            "Model added."

        );

        return model;

    },

    /* ======================================================
       Remove Model
       ====================================================== */

    remove(id) {

        this.list = this.list.filter(

            model => model.id !== id

        );

        this.save();

        Notification.info(

            "Model removed."

        );

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.list.find(

            model =>

            model.id === id

        );

    },

    /* ======================================================
       Enable
       ====================================================== */

    enable(id) {

        const model = this.get(id);

        if (!model) {

            return;

        }

        model.enabled = true;

        this.save();

    },

    /* ======================================================
       Disable
       ====================================================== */

    disable(id) {

        const model = this.get(id);

        if (!model) {

            return;

        }

        model.enabled = false;

        this.save();

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword

            .trim()

            .toLowerCase();

        return this.list.filter(

            model =>

            model.name

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

window.Models = Models;