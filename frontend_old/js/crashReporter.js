/* ==========================================================
   Easy AI Studio
   File: frontend/js/crashReporter.js
   Version: 1.0.0
   Sprint: 6 - Crash Reporter
   ========================================================== */

"use strict";

/* ==========================================================
   Crash Reporter
   ========================================================== */

const CrashReporter = {

    storageKey: "crash-logs",

    logs: [],

    enabled: true,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.logs = Storage.get(

            this.storageKey,

            []

        );

        window.addEventListener(

            "error",

            this.handleError.bind(this)

        );

        window.addEventListener(

            "unhandledrejection",

            this.handlePromise.bind(this)

        );

        console.log(

            "Crash Reporter Ready"

        );

    },

    /* ======================================================
       JavaScript Error
       ====================================================== */

    handleError(event) {

        if (!this.enabled) {

            return;

        }

        this.record({

            type: "error",

            message: event.message,

            file: event.filename,

            line: event.lineno,

            column: event.colno,

            stack:

                event.error?.stack ||

                ""

        });

    },

    /* ======================================================
       Promise Error
       ====================================================== */

    handlePromise(event) {

        if (!this.enabled) {

            return;

        }

        this.record({

            type: "promise",

            message:

                String(event.reason),

            stack:

                event.reason?.stack ||

                ""

        });

    },

    /* ======================================================
       Record
       ====================================================== */

    record(log) {

        this.logs.unshift({

            id: Utils.uuid(),

            created: Utils.now(),

            ...log

        });

        if (

            this.logs.length > 500

        ) {

            this.logs.length = 500;

        }

        Storage.set(

            this.storageKey,

            this.logs

        );

        EventBus.emit(

            "crash.recorded",

            log

        );

    },

    /* ======================================================
       Clear
       ====================================================== */

    clear() {

        this.logs = [];

        Storage.set(

            this.storageKey,

            []

        );

    },

    /* ======================================================
       Get Logs
       ====================================================== */

    all() {

        return this.logs;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.CrashReporter = CrashReporter;