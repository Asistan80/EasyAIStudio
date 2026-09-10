/* ==========================================================
   Easy AI Studio
   File: frontend/js/fileManager.js
   Version: 1.0.0
   Sprint: 5 - File Manager
   ========================================================== */

"use strict";

/* ==========================================================
   File Manager
   ========================================================== */

const FileManager = {

    recentFiles: [],

    maxRecentFiles: 20,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "File Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.recentFiles = Storage.get(

            "recent-files",

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            "recent-files",

            this.recentFiles

        );

    },

    /* ======================================================
       Add Recent File
       ====================================================== */

    addRecent(file = {}) {

        this.recentFiles = this.recentFiles.filter(

            item => item.path !== file.path

        );

        this.recentFiles.unshift({

            id: Utils.uuid(),

            name: file.name || "Untitled",

            path: file.path || "",

            type: file.type || "file",

            size: file.size || 0,

            opened: Utils.now()

        });

        if (

            this.recentFiles.length >

            this.maxRecentFiles

        ) {

            this.recentFiles.pop();

        }

        this.save();

    },

    /* ======================================================
       Remove Recent File
       ====================================================== */

    removeRecent(path) {

        this.recentFiles = this.recentFiles.filter(

            item => item.path !== path

        );

        this.save();

    },

    /* ======================================================
       Clear Recent Files
       ====================================================== */

    clearRecent() {

        this.recentFiles = [];

        this.save();

    },

    /* ======================================================
       Get Recent Files
       ====================================================== */

    getRecent() {

        return this.recentFiles;

    },

    /* ======================================================
       Import File
       ====================================================== */

    async import(file) {

        if (!file) {

            return null;

        }

        return {

            name: file.name,

            size: file.size,

            type: file.type,

            data: await file.text()

        };

    },

    /* ======================================================
       Export File
       ====================================================== */

    export(filename, content) {

        const blob = new Blob(

            [content],

            {

                type: "text/plain"

            }

        );

        const url = URL.createObjectURL(

            blob

        );

        const link = document.createElement("a");

        link.href = url;

        link.download = filename;

        link.click();

        URL.revokeObjectURL(url);

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.FileManager = FileManager;