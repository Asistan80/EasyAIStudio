/* ==========================================================
   Easy AI Studio
   File: frontend/js/updateManager.js
   Version: 1.0.0
   Sprint: 6 - Update Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Update Manager
   ========================================================== */

const UpdateManager = {

    currentVersion: "1.0.0",

    latestVersion: "1.0.0",

    updateAvailable: false,

    checking: false,

    repository:

        "https://update.easyaistudio.org",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Update Manager Ready"

        );

    },

    /* ======================================================
       Check Updates
       ====================================================== */

    async check() {

        this.checking = true;

        EventBus.emit(

            "update.check.started"

        );

        try {

            const result = await API.get(

                this.repository +

                "/version.json"

            );

            this.latestVersion =

                result.version ||

                this.currentVersion;

            this.updateAvailable =

                this.latestVersion !==

                this.currentVersion;

            EventBus.emit(

                "update.check.finished",

                result

            );

        }

        catch (error) {

            Logger.error(

                "Update check failed.",

                error

            );

        }

        this.checking = false;

    },

    /* ======================================================
       Download Update
       ====================================================== */

    download() {

        if (

            !this.updateAvailable

        ) {

            return;

        }

        EventBus.emit(

            "update.download.started"

        );

    },

    /* ======================================================
       Install Update
       ====================================================== */

    install() {

        if (

            !this.updateAvailable

        ) {

            return;

        }

        EventBus.emit(

            "update.install.started"

        );

    },

    /* ======================================================
       Information
       ====================================================== */

    info() {

        return {

            current:

                this.currentVersion,

            latest:

                this.latestVersion,

            available:

                this.updateAvailable

        };

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.UpdateManager = UpdateManager;