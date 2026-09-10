/* ==========================================================
   Easy AI Studio
   File: frontend/js/settingsPage.js
   Version: 1.0.0
   Sprint: 7 - Settings Page
   ========================================================== */

"use strict";

/* ==========================================================
   Settings Page
   ========================================================== */

const SettingsPage = {

    initialized: false,

    sections: [

        "general",

        "appearance",

        "providers",

        "models",

        "audio",

        "video",

        "shortcuts",

        "advanced"

    ],

    currentSection: "general",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.load();

        console.log(

            "Settings Page Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.currentSection =

            Storage.get(

                "settings-section",

                "general"

            );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            "settings-section",

            this.currentSection

        );

    },

    /* ======================================================
       Open Section
       ====================================================== */

    open(section) {

        if (

            !this.sections.includes(

                section

            )

        ) {

            return;

        }

        this.currentSection =

            section;

        this.save();

        EventBus.emit(

            "settings.changed",

            section

        );

    },

    /* ======================================================
       Reset
       ====================================================== */

    reset() {

        ThemeManager.apply(

            "dark"

        );

        LayoutManager.reset();

        ShortcutManager.enable();

        Notification.success(

            "Settings reset."

        );

    },

    /* ======================================================
       Current Section
       ====================================================== */

    current() {

        return this.currentSection;

    },

    /* ======================================================
       Sections
       ====================================================== */

    all() {

        return this.sections;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.SettingsPage = SettingsPage;