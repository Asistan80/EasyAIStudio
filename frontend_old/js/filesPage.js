/* ==========================================================
   Easy AI Studio
   File: frontend/js/filesPage.js
   Version: 1.0.0
   Sprint: 7 - Files Manager Page
   ========================================================== */

"use strict";

/* ==========================================================
   Files Page
   ========================================================== */

const FilesPage = {

    initialized: false,

    files: [],

    currentFolder: "/",

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

            "Files Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.files =

            FileManager.all(

                this.currentFolder

            );

        EventBus.emit(

            "files.updated",

            this.files

        );

    },

    /* ======================================================
       Open Folder
       ====================================================== */

    open(folder) {

        this.currentFolder =

            folder;

        this.refresh();

    },

    /* ======================================================
       Upload File
       ====================================================== */

    upload(file) {

        FileManager.upload(

            this.currentFolder,

            file

        );

        this.refresh();

    },

    /* ======================================================
       Delete File
       ====================================================== */

    remove(id) {

        FileManager.remove(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Rename File
       ====================================================== */

    rename(id, name) {

        FileManager.rename(

            id,

            name

        );

        this.refresh();

    },

    /* ======================================================
       Download File
       ====================================================== */

    download(id) {

        FileManager.download(

            id

        );

    },

    /* ======================================================
       File List
       ====================================================== */

    all() {

        return this.files;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.FilesPage = FilesPage;