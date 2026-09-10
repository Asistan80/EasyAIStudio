/* ==========================================================
   Easy AI Studio
   File: frontend/js/logger.js
   Version: 1.0.0
   Sprint: 5 - Logger System
   ========================================================== */

"use strict";

/* ==========================================================
   Logger
   ========================================================== */

const Logger = {

    storageKey: "logs",

    entries: [],

    maxEntries: 1000,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.entries = Storage.get(

            this.storageKey,

            []

        );

        console.log(

            "Logger Ready"

        );

    },

    /* ======================================================
       Write
       ====================================================== */

    write(level, message, data = null) {

        const entry = {

            id: Utils.uuid(),

            level,

            message,

            data,

            time: new Date().toISOString()

        };

        this.entries.push(entry);

        if (

            this.entries.length >

            this.maxEntries

        ) {

            this.entries.shift();

        }

        this.save();

        console[level] ??

            console.log;

        console.log(

            `[${level.toUpperCase()}]`,

            message,

            data || ""

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.entries

        );

    },

    /* ======================================================
       Info
       ====================================================== */

    info(message, data = null) {

        this.write(

            "info",

            message,

            data

        );

    },

    /* ======================================================
       Success
       ====================================================== */

    success(message, data = null) {

        this.write(

            "log",

            message,

            data

        );

    },

    /* ======================================================
       Warning
       ====================================================== */

    warning(message, data = null) {

        this.write(

            "warn",

            message,

            data

        );

    },

    /* ======================================================
       Error
       ====================================================== */

    error(message, data = null) {

        this.write(

            "error",

            message,

            data

        );

    },

    /* ======================================================
       Get Logs
       ====================================================== */

    all() {

        return this.entries;

    },

    /* ======================================================
       Clear
       ====================================================== */

    clear() {

        this.entries = [];

        this.save();

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Logger = Logger;