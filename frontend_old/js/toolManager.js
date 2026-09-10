/* ==========================================================
   Easy AI Studio
   File: frontend/js/toolManager.js
   Version: 1.0.0
   Sprint: 6 - Tool Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Tool Manager
   ========================================================== */

const ToolManager = {

    storageKey: "tools",

    tools: [],

    enabledTools: new Set(),

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Tool Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.tools = Storage.get(

            this.storageKey,

            []

        );

        this.enabledTools = new Set(

            this.tools

                .filter(

                    tool => tool.enabled

                )

                .map(

                    tool => tool.id

                )

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.tools

        );

    },

    /* ======================================================
       Register Tool
       ====================================================== */

    register(data = {}) {

        const tool = {

            id: Utils.uuid(),

            name: data.name || "New Tool",

            description:

                data.description || "",

            category:

                data.category || "General",

            version:

                data.version || "1.0.0",

            enabled:

                data.enabled ?? true,

            created:

                Utils.now()

        };

        this.tools.push(

            tool

        );

        if (

            tool.enabled

        ) {

            this.enabledTools.add(

                tool.id

            );

        }

        this.save();

        EventBus.emit(

            "tool.registered",

            tool

        );

        return tool;

    },

    /* ======================================================
       Enable Tool
       ====================================================== */

    enable(id) {

        const tool = this.get(id);

        if (!tool) {

            return;

        }

        tool.enabled = true;

        this.enabledTools.add(id);

        this.save();

    },

    /* ======================================================
       Disable Tool
       ====================================================== */

    disable(id) {

        const tool = this.get(id);

        if (!tool) {

            return;

        }

        tool.enabled = false;

        this.enabledTools.delete(id);

        this.save();

    },

    /* ======================================================
       Find Tool
       ====================================================== */

    get(id) {

        return this.tools.find(

            tool =>

            tool.id === id

        );

    },

    /* ======================================================
       Remove Tool
       ====================================================== */

    remove(id) {

        this.tools = this.tools.filter(

            tool =>

            tool.id !== id

        );

        this.enabledTools.delete(id);

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.tools;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ToolManager = ToolManager;