/* ==========================================================
   Easy AI Studio
   File: frontend/js/theme.js
   Version: 1.0.0
   Sprint: 4 - Core
   ========================================================== */

"use strict";

/* ==========================================================
   Theme Manager
   ========================================================== */

const Theme = {

    current: "dark",

    storageKey: "easy-ai-theme",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        this.apply(this.current);

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        const savedTheme = localStorage.getItem(

            this.storageKey

        );

        if (savedTheme) {

            this.current = savedTheme;

        }

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        localStorage.setItem(

            this.storageKey,

            this.current

        );

    },

    /* ======================================================
       Apply
       ====================================================== */

    apply(theme) {

        this.current = theme;

        document.body.classList.remove(

            "theme-dark",

            "theme-light"

        );

        document.body.classList.add(

            "theme-" + theme

        );

        this.updateMetaColor();

        this.save();

        console.log(

            "Theme:",

            theme

        );

    },

    /* ======================================================
       Toggle
       ====================================================== */

    toggle() {

        if (this.current === "dark") {

            this.apply("light");

        } else {

            this.apply("dark");

        }

    },

    /* ======================================================
       Meta Color
       ====================================================== */

    updateMetaColor() {

        const meta = document.querySelector(

            'meta[name="theme-color"]'

        );

        if (!meta) {

            return;

        }

        meta.content =

            this.current === "dark"

            ? "#0f1117"

            : "#ffffff";

    },

    /* ======================================================
       Getter
       ====================================================== */

    getCurrentTheme() {

        return this.current;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Theme = Theme;