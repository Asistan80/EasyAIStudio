/* ==========================================================
   Easy AI Studio
   File: frontend/js/plugins.js
   Version: 1.0.0
   Sprint: 5 - Plugin Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Plugin Manager
   ========================================================== */

const Plugins = {

    storageKey: "plugins",

    registry: [],

    loaded: new Map(),

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        this.loadEnabledPlugins();

        console.log(

            "Plugin Manager Ready"

        );

    },

    /* ======================================================
       Load Registry
       ====================================================== */

    load() {

        this.registry = Storage.get(

            this.storageKey,

            []

        );

    },

    /* ======================================================
       Save Registry
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.registry

        );

    },

    /* ======================================================
       Register Plugin
       ====================================================== */

    register(plugin = {}) {

        const item = {

            id: plugin.id || Utils.uuid(),

            name: plugin.name || "Plugin",

            version: plugin.version || "1.0.0",

            author: plugin.author || "Unknown",

            description: plugin.description || "",

            enabled: plugin.enabled ?? true,

            loaded: false,

            created: Utils.now()

        };

        this.registry.push(item);

        this.save();

        Notification.success(

            "Plugin registered."

        );

        return item;

    },

    /* ======================================================
       Load Enabled Plugins
       ====================================================== */

    loadEnabledPlugins() {

        this.registry.forEach(plugin => {

            if (plugin.enabled) {

                this.loaded.set(

                    plugin.id,

                    plugin

                );

                plugin.loaded = true;

            }

        });

    },

    /* ======================================================
       Enable
       ====================================================== */

    enable(id) {

        const plugin = this.get(id);

        if (!plugin) {

            return;

        }

        plugin.enabled = true;

        plugin.loaded = true;

        this.loaded.set(id, plugin);

        this.save();

    },

    /* ======================================================
       Disable
       ====================================================== */

    disable(id) {

        const plugin = this.get(id);

        if (!plugin) {

            return;

        }

        plugin.enabled = false;

        plugin.loaded = false;

        this.loaded.delete(id);

        this.save();

    },

    /* ======================================================
       Remove
       ====================================================== */

    remove(id) {

        this.registry = this.registry.filter(

            plugin => plugin.id !== id

        );

        this.loaded.delete(id);

        this.save();

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.registry.find(

            plugin => plugin.id === id

        );

    },

    /* ======================================================
       Get Loaded
       ====================================================== */

    getLoaded() {

        return Array.from(

            this.loaded.values()

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.registry;

    },

    /* ======================================================
       Clear
       ====================================================== */

    clear() {

        this.registry = [];

        this.loaded.clear();

        this.save();

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Plugins = Plugins;