/* ==========================================================
   Easy AI Studio
   File: frontend/js/workspace.js
   Version: 1.0.0
   Sprint: 5 - Workspace Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Workspace Manager
   ========================================================== */

const Workspace = {

    currentPage: "dashboard",

    pages: new Map(),

    container: null,

    initialized: false,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.container = document.getElementById(

            "workspace"

        );

        if (!this.container) {

            console.error(

                "Workspace not found."

            );

            return;

        }

        this.initialized = true;

        console.log(

            "Workspace Ready"

        );

    },

    /* ======================================================
       Register Page
       ====================================================== */

    register(name, render) {

        if (

            typeof render !== "function"

        ) {

            return false;

        }

        this.pages.set(

            name,

            render

        );

        return true;

    },

    /* ======================================================
       Open Page
       ====================================================== */

    open(name) {

        if (

            !this.pages.has(name)

        ) {

            console.warn(

                "Page not found:",

                name

            );

            return;

        }

        this.currentPage = name;

        this.render();

    },

    /* ======================================================
       Render
       ====================================================== */

    render() {

        const renderer =

            this.pages.get(

                this.currentPage

            );

        if (!renderer) {

            return;

        }

        Utils.clear(

            this.container

        );

        renderer(

            this.container

        );

    },

    /* ======================================================
       Current Page
       ====================================================== */

    current() {

        return this.currentPage;

    },

    /* ======================================================
       Exists
       ====================================================== */

    exists(name) {

        return this.pages.has(name);

    },

    /* ======================================================
       Registered Pages
       ====================================================== */

    list() {

        return Array.from(

            this.pages.keys()

        );

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Workspace = Workspace;