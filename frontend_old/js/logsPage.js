/* ==========================================================
   Easy AI Studio
   File: frontend/js/logsPage.js
   Version: 1.0.0
   Sprint: 7 - Logs Page
   ========================================================== */

"use strict";

/* ==========================================================
   Logs Page
   ========================================================== */

const LogsPage = {

    initialized: false,

    logs: [],

    filterType: "all",

    maxLogs: 1000,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.registerEvents();

        this.refresh();

        console.log(

            "Logs Page Ready"

        );

    },

    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {

        EventBus.on(

            "*",

            data => {

                this.add({

                    type: "event",

                    message:

                        JSON.stringify(data)

                });

            }

        );

    },

    /* ======================================================
       Add Log
       ====================================================== */

    add(log = {}) {

        this.logs.unshift({

            id: Utils.uuid(),

            type:

                log.type ||

                "info",

            message:

                log.message ||

                "",

            created:

                Utils.now()

        });

        if (

            this.logs.length >

            this.maxLogs

        ) {

            this.logs.length =

                this.maxLogs;

        }

        EventBus.emit(

            "logs.updated",

            this.logs

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.logs =

            Logger.all();

    },

    /* ======================================================
       Filter
       ====================================================== */

    filter(type) {

        this.filterType = type;

        if (

            type === "all"

        ) {

            return this.logs;

        }

        return this.logs.filter(

            log =>

            log.type === type

        );

    },

    /* ======================================================
       Clear
       ====================================================== */

    clear() {

        this.logs = [];

        Logger.clear();

    },

    /* ======================================================
       All Logs
       ====================================================== */

    all() {

        return this.logs;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.LogsPage = LogsPage;