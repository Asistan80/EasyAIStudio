/* ==========================================================
   Easy AI Studio
   File: frontend/js/licenseManager.js
   Version: 1.0.0
   Sprint: 6 - License Manager
   ========================================================== */

"use strict";

/* ==========================================================
   License Manager
   ========================================================== */

const LicenseManager = {

    storageKey: "license",

    license: null,

    activated: false,

    plan: "Free",

    expires: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "License Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.license = Storage.get(

            this.storageKey,

            null

        );

        if (this.license) {

            this.activated = true;

            this.plan =

                this.license.plan ||

                "Free";

            this.expires =

                this.license.expires ||

                null;

        }

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.license

        );

    },

    /* ======================================================
       Activate
       ====================================================== */

    activate(data = {}) {

        this.license = {

            key:

                data.key || "",

            plan:

                data.plan || "Pro",

            expires:

                data.expires || null,

            activated:

                Utils.now()

        };

        this.activated = true;

        this.plan =

            this.license.plan;

        this.expires =

            this.license.expires;

        this.save();

        EventBus.emit(

            "license.activated",

            this.license

        );

    },

    /* ======================================================
       Deactivate
       ====================================================== */

    deactivate() {

        this.license = null;

        this.activated = false;

        this.plan = "Free";

        this.expires = null;

        Storage.remove(

            this.storageKey

        );

        EventBus.emit(

            "license.deactivated"

        );

    },

    /* ======================================================
       Status
       ====================================================== */

    status() {

        return {

            active:

                this.activated,

            plan:

                this.plan,

            expires:

                this.expires

        };

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.LicenseManager = LicenseManager;