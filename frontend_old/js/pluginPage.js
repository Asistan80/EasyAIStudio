/* ==========================================================
   Easy AI Studio
   File: frontend/js/pluginPage.js
   Version: 1.0.0
   Sprint: 7 - Plugin Manager Page
   ========================================================== */

"use strict";

/* ==========================================================
   Plugin Page
   ========================================================== */

const PluginPage = {

    initialized: false,

    plugins: [],

    enabled: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.refresh();

        console.log(

            "Plugin Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.plugins =

            PluginManager.all();

        this.enabled =

            this.plugins.filter(

                plugin =>

                plugin.enabled

            );

        EventBus.emit(

            "plugins.updated",

            this.plugins

        );

    },

    /* ======================================================
       Install Plugin
       ====================================================== */

    install(plugin) {

        PluginManager.install(

            plugin

        );

        this.refresh();

    },

    /* ======================================================
       Remove Plugin
       ====================================================== */

    remove(id) {

        PluginManager.remove(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Enable Plugin
       ====================================================== */

    enable(id) {

        PluginManager.enable(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Disable Plugin
       ====================================================== */

    disable(id) {

        PluginManager.disable(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Plugin List
       ====================================================== */

    all() {

        return this.plugins;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.PluginPage = PluginPage;