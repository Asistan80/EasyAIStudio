/* ==========================================================
   Easy AI Studio
   File: frontend/js/welcomePage.js
   Version: 1.0.0
   Sprint: 7 - Welcome Page
   ========================================================== */

"use strict";

/* ==========================================================
   Welcome Page
   ========================================================== */

const WelcomePage = {

    initialized: false,

    firstRun: true,

    shortcuts: [

        {

            title:

                "Start Chat",

            action:

                "chat"

        },

        {

            title:

                "Create Image",

            action:

                "image"

        },

        {

            title:

                "Create Video",

            action:

                "video"

        },

        {

            title:

                "Manage Models",

            action:

                "models"

        }

    ],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.checkFirstRun();

        console.log(

            "Welcome Page Ready"

        );

    },

    /* ======================================================
       First Run Check
       ====================================================== */

    checkFirstRun() {

        this.firstRun =

            !Storage.get(

                "welcome-completed",

                false

            );

    },

    /* ======================================================
       Complete Welcome
       ====================================================== */

    complete() {

        this.firstRun = false;

        Storage.set(

            "welcome-completed",

            true

        );

        EventBus.emit(

            "welcome.completed"

        );

    },

    /* ======================================================
       Open Action
       ====================================================== */

    open(action) {

        EventBus.emit(

            "page.open",

            action

        );

    },

    /* ======================================================
       Shortcuts
       ====================================================== */

    getShortcuts() {

        return this.shortcuts;

    },

    /* ======================================================
       Status
       ====================================================== */

    status() {

        return {

            firstRun:

                this.firstRun,

            shortcuts:

                this.shortcuts.length

        };

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.WelcomePage = WelcomePage;