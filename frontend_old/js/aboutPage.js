/* ==========================================================
   Easy AI Studio
   File: frontend/js/aboutPage.js
   Version: 1.0.0
   Sprint: 7 - About Page
   ========================================================== */

"use strict";

/* ==========================================================
   About Page
   ========================================================== */

const AboutPage = {

    initialized: false,

    information: {

        name: "Easy AI Studio",

        version: "1.0.0",

        description:

            "Yerel ve çevrim içi yapay zeka araçlarını tek merkezden yönetmek için geliştirilmiş AI çalışma ortamı.",

        author:

            "Easy AI Studio Team",

        license:

            "Open Source"

    },

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        console.log(

            "About Page Ready"

        );

    },

    /* ======================================================
       Version
       ====================================================== */

    version() {

        return this.information.version;

    },

    /* ======================================================
       Information
       ====================================================== */

    info() {

        return this.information;

    },

    /* ======================================================
       Credits
       ====================================================== */

    credits() {

        return [

            "Easy AI Studio",

            "AI Tools",

            "Open Source Community"

        ];

    },

    /* ======================================================
       System
       ====================================================== */

    systemInfo() {

        return {

            browser:

                navigator.userAgent,

            language:

                navigator.language,

            platform:

                navigator.platform,

            time:

                Utils.now()

        };

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.AboutPage = AboutPage;