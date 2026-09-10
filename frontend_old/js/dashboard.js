/* ==========================================================
   Easy AI Studio
   File: frontend/js/dashboard.js
   Version: 1.0.0
   Sprint: 7 - Dashboard
   ========================================================== */

"use strict";

/* ==========================================================
   Dashboard
   ========================================================== */

const Dashboard = {

    initialized: false,

    widgets: [],

    stats: {

        models: 0,

        projects: 0,

        chats: 0,

        images: 0

    },

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.loadWidgets();

        this.refresh();

        console.log(

            "Dashboard Ready"

        );

    },

    /* ======================================================
       Widgets
       ====================================================== */

    loadWidgets() {

        this.widgets = [

            "recent",

            "providers",

            "models",

            "performance",

            "downloads",

            "history",

            "projects",

            "news"

        ];

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.stats.models =

            ProviderManager.all().length;

        this.stats.projects =

            ImageStudio.all().length +

            VideoStudio.all().length;

        this.stats.chats =

            ChatStudio.all().length;

        this.stats.images =

            ImageStudio.generations.length;

        EventBus.emit(

            "dashboard.updated",

            this.stats

        );

    },

    /* ======================================================
       Add Widget
       ====================================================== */

    addWidget(name) {

        if (

            this.widgets.includes(name)

        ) {

            return;

        }

        this.widgets.push(name);

    },

    /* ======================================================
       Remove Widget
       ====================================================== */

    removeWidget(name) {

        this.widgets =

            this.widgets.filter(

                widget =>

                widget !== name

            );

    },

    /* ======================================================
       Widgets
       ====================================================== */

    getWidgets() {

        return this.widgets;

    },

    /* ======================================================
       Stats
       ====================================================== */

    getStats() {

        return this.stats;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Dashboard = Dashboard;