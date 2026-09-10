/* ==========================================================
   Easy AI Studio
   File: frontend/js/nodeEditor.js
   Version: 1.0.0
   Sprint: 6 - Node Editor
   ========================================================== */

"use strict";

/* ==========================================================
   Node Editor
   ========================================================== */

const NodeEditor = {

    canvas: null,

    nodes: new Map(),

    connections: [],

    selectedNode: null,

    zoom: 1,

    offset: {

        x: 0,

        y: 0

    },

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.canvas = document.getElementById(

            "node-editor"

        );

        console.log(

            "Node Editor Ready"

        );

    },

    /* ======================================================
       Create Node
       ====================================================== */

    create(data = {}) {

        const node = {

            id: Utils.uuid(),

            type: data.type || "custom",

            title: data.title || "Node",

            x: data.x || 0,

            y: data.y || 0,

            inputs: data.inputs || [],

            outputs: data.outputs || [],

            properties: data.properties || {}

        };

        this.nodes.set(

            node.id,

            node

        );

        EventBus.emit(

            "node.created",

            node

        );

        return node;

    },

    /* ======================================================
       Delete Node
       ====================================================== */

    remove(id) {

        this.nodes.delete(id);

        this.connections =

            this.connections.filter(

                connection =>

                connection.from !== id &&

                connection.to !== id

            );

        EventBus.emit(

            "node.removed",

            id

        );

    },

    /* ======================================================
       Connect Nodes
       ====================================================== */

    connect(from, to) {

        this.connections.push({

            id: Utils.uuid(),

            from,

            to

        });

        EventBus.emit(

            "node.connected"

        );

    },

    /* ======================================================
       Disconnect
       ====================================================== */

    disconnect(id) {

        this.connections =

            this.connections.filter(

                connection =>

                connection.id !== id

            );

    },

    /* ======================================================
       Select
       ====================================================== */

    select(id) {

        this.selectedNode = id;

        EventBus.emit(

            "node.selected",

            this.get(id)

        );

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.nodes.get(id);

    },

    /* ======================================================
       Zoom
       ====================================================== */

    setZoom(value) {

        this.zoom = value;

    },

    /* ======================================================
       Clear
       ====================================================== */

    clear() {

        this.nodes.clear();

        this.connections = [];

        this.selectedNode = null;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.NodeEditor = NodeEditor;