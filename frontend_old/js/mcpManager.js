/* ==========================================================
   Easy AI Studio
   File: frontend/js/mcpManager.js
   Version: 1.0.0
   Sprint: 6 - MCP Manager
   ========================================================== */

"use strict";

/* ==========================================================
   MCP Manager
   ========================================================== */

const MCPManager = {

    servers: [],

    activeServer: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "MCP Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.servers = Storage.get(

            "mcp-servers",

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            "mcp-servers",

            this.servers

        );

    },

    /* ======================================================
       Register Server
       ====================================================== */

    register(data = {}) {

        const server = {

            id: Utils.uuid(),

            name: data.name || "New MCP Server",

            transport: data.transport || "stdio",

            host: data.host || "",

            port: data.port || "",

            command: data.command || "",

            args: data.args || [],

            enabled: true,

            connected: false,

            created: Utils.now()

        };

        this.servers.push(

            server

        );

        this.save();

        EventBus.emit(

            "mcp.server.registered",

            server

        );

        return server;

    },

    /* ======================================================
       Connect
       ====================================================== */

    async connect(id) {

        const server = this.get(id);

        if (!server) {

            return false;

        }

        server.connected = true;

        this.activeServer = id;

        EventBus.emit(

            "mcp.connected",

            server

        );

        return true;

    },

    /* ======================================================
       Disconnect
       ====================================================== */

    disconnect(id) {

        const server = this.get(id);

        if (!server) {

            return;

        }

        server.connected = false;

        if (

            this.activeServer === id

        ) {

            this.activeServer = null;

        }

        EventBus.emit(

            "mcp.disconnected",

            server

        );

    },

    /* ======================================================
       Find Server
       ====================================================== */

    get(id) {

        return this.servers.find(

            server =>

            server.id === id

        );

    },

    /* ======================================================
       Remove Server
       ====================================================== */

    remove(id) {

        this.servers = this.servers.filter(

            server =>

            server.id !== id

        );

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.servers;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.MCPManager = MCPManager;