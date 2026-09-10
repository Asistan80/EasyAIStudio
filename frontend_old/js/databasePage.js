/* ==========================================================
   Easy AI Studio
   File: frontend/js/databasePage.js
   Version: 1.0.0
   Sprint: 7 - Database Page
   ========================================================== */

"use strict";

/* ==========================================================
   Database Page
   ========================================================== */

const DatabasePage = {

    initialized: false,

    databases: [],

    activeDatabase: null,

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

            "Database Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.databases =

            DatabaseManager.all();

        EventBus.emit(

            "database.updated",

            this.databases

        );

    },

    /* ======================================================
       Create Database
       ====================================================== */

    create(name) {

        DatabaseManager.create(

            name

        );

        this.refresh();

    },

    /* ======================================================
       Open Database
       ====================================================== */

    open(id) {

        this.activeDatabase =

            DatabaseManager.get(id);

    },

    /* ======================================================
       Delete Database
       ====================================================== */

    remove(id) {

        DatabaseManager.remove(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Backup Database
       ====================================================== */

    backup(id) {

        DatabaseManager.backup(

            id

        );

    },

    /* ======================================================
       Restore Database
       ====================================================== */

    restore(id) {

        DatabaseManager.restore(

            id

        );

    },

    /* ======================================================
       Database List
       ====================================================== */

    all() {

        return this.databases;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.DatabasePage = DatabasePage;