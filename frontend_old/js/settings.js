/* ==========================================================
   Easy AI Studio
   File: frontend/js/settings.js
   Version: 1.0.0
   Sprint: 5 - Settings Module
   ========================================================== */

"use strict";

/* ==========================================================
   Settings Manager
   ========================================================== */

const Settings = {

    storageKey: "settings",

    defaults: {

        language: "tr",

        theme: "dark",

        autoSave: true,

        autoUpdate: true,

        notifications: true,

        animations: true,

        hardwareAcceleration: true,

        defaultImageModel: "",

        defaultVideoModel: "",

        defaultChatModel: "",

        workspace: "workspace",

        downloads: "downloads"

    },

    data: {},

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Settings Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.data = Storage.get(

            this.storageKey,

            structuredClone(

                this.defaults

            )

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.data

        );

    },

    /* ======================================================
       Get
       ====================================================== */

    get(key) {

        return this.data[key];

    },

    /* ======================================================
       Set
       ====================================================== */

    set(key, value) {

        this.data[key] = value;

        this.save();

    },

    /* ======================================================
       Reset
       ====================================================== */

    reset() {

        this.data = structuredClone(

            this.defaults

        );

        this.save();

        Notification.info(

            "Settings restored."

        );

    },

    /* ======================================================
       Toggle
       ====================================================== */

    toggle(key) {

        if (

            typeof this.data[key]

            !== "boolean"

        ) {

            return;

        }

        this.data[key] =

            !this.data[key];

        this.save();

    },

    /* ======================================================
       Export
       ====================================================== */

    export() {

        return JSON.stringify(

            this.data,

            null,

            4

        );

    },

    /* ======================================================
       Import
       ====================================================== */

    import(json) {

        try {

            this.data = JSON.parse(

                json

            );

            this.save();

            Notification.success(

                "Settings imported."

            );

        }

        catch {

            Notification.error(

                "Invalid settings file."

            );

        }

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Settings = Settings;