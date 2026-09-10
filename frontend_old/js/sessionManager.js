/* ==========================================================
   Easy AI Studio
   File: frontend/js/sessionManager.js
   Version: 1.0.0
   Sprint: 6 - Session Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Session Manager
   ========================================================== */

const SessionManager = {

    storageKey: "session",

    session: null,

    started: null,

    lastActivity: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        this.touch();

        console.log(

            "Session Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.session = Storage.get(

            this.storageKey,

            null

        );

        if (!this.session) {

            this.create();

        }

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.session

        );

    },

    /* ======================================================
       Create Session
       ====================================================== */

    create() {

        this.session = {

            id: Utils.uuid(),

            started: Utils.now(),

            lastActivity: Utils.now(),

            workspace: "default",

            status: "active"

        };

        this.started =

            this.session.started;

        this.lastActivity =

            this.session.lastActivity;

        this.save();

    },

    /* ======================================================
       Update Activity
       ====================================================== */

    touch() {

        if (!this.session) {

            return;

        }

        this.session.lastActivity =

            Utils.now();

        this.lastActivity =

            this.session.lastActivity;

        this.save();

    },

    /* ======================================================
       End Session
       ====================================================== */

    end() {

        if (!this.session) {

            return;

        }

        this.session.status =

            "closed";

        this.save();

        EventBus.emit(

            "session.closed",

            this.session

        );

    },

    /* ======================================================
       Current Session
       ====================================================== */

    current() {

        return this.session;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.SessionManager = SessionManager;