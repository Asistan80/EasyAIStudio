/* ==========================================================
   Easy AI Studio
   File: frontend/js/layoutManager.js
   Version: 1.0.0
   Sprint: 6 - Layout Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Layout Manager
   ========================================================== */

const LayoutManager = {

    storageKey: "layout",

    layout: {

        sidebar: true,

        rightPanel: true,

        statusBar: true,

        compactMode: false,

        zoom: 100

    },

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.layout = Storage.get(

            this.storageKey,

            this.layout

        );

        this.apply();

        console.log(

            "Layout Manager Ready"

        );

    },

    /* ======================================================
       Apply Layout
       ====================================================== */

    apply() {

        document.body.classList.toggle(

            "compact-mode",

            this.layout.compactMode

        );

        document.body.style.zoom =

            `${this.layout.zoom}%`;

        EventBus.emit(

            "layout.updated",

            this.layout

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.layout

        );

    },

    /* ======================================================
       Set Option
       ====================================================== */

    set(key, value) {

        this.layout[key] = value;

        this.save();

        this.apply();

    },

    /* ======================================================
       Toggle
       ====================================================== */

    toggle(key) {

        this.set(

            key,

            !this.layout[key]

        );

    },

    /* ======================================================
       Reset
       ====================================================== */

    reset() {

        this.layout = {

            sidebar: true,

            rightPanel: true,

            statusBar: true,

            compactMode: false,

            zoom: 100

        };

        this.save();

        this.apply();

    },

    /* ======================================================
       Current Layout
       ====================================================== */

    current() {

        return this.layout;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.LayoutManager = LayoutManager;