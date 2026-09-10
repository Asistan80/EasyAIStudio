/* ==========================================================
   Easy AI Studio
   File: frontend/js/workflowManager.js
   Version: 1.0.0
   Sprint: 6 - Workflow Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Workflow Manager
   ========================================================== */

const WorkflowManager = {

    storageKey: "workflows",

    workflows: [],

    activeWorkflow: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Workflow Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.workflows = Storage.get(

            this.storageKey,

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.workflows

        );

    },

    /* ======================================================
       Create Workflow
       ====================================================== */

    create(data = {}) {

        const workflow = {

            id: Utils.uuid(),

            name: data.name || "New Workflow",

            description: data.description || "",

            nodes: [],

            connections: [],

            variables: {},

            enabled: true,

            created: Utils.now(),

            updated: Utils.now()

        };

        this.workflows.push(workflow);

        this.save();

        Notification.success(

            "Workflow created."

        );

        return workflow;

    },

    /* ======================================================
       Open Workflow
       ====================================================== */

    open(id) {

        const workflow = this.get(id);

        if (!workflow) {

            return;

        }

        this.activeWorkflow = id;

        EventBus.emit(

            "workflow.opened",

            workflow

        );

    },

    /* ======================================================
       Add Node
       ====================================================== */

    addNode(workflowId, node) {

        const workflow = this.get(workflowId);

        if (!workflow) {

            return;

        }

        workflow.nodes.push({

            id: Utils.uuid(),

            ...node

        });

        workflow.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Remove Node
       ====================================================== */

    removeNode(workflowId, nodeId) {

        const workflow = this.get(workflowId);

        if (!workflow) {

            return;

        }

        workflow.nodes = workflow.nodes.filter(

            node => node.id !== nodeId

        );

        workflow.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Find Workflow
       ====================================================== */

    get(id) {

        return this.workflows.find(

            workflow =>

            workflow.id === id

        );

    },

    /* ======================================================
       Delete Workflow
       ====================================================== */

    remove(id) {

        this.workflows = this.workflows.filter(

            workflow =>

            workflow.id !== id

        );

        if (

            this.activeWorkflow === id

        ) {

            this.activeWorkflow = null;

        }

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.workflows;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.WorkflowManager = WorkflowManager;