/* ==========================================================
   Easy AI Studio
   File: frontend/js/workflowPage.js
   Version: 1.0.0
   Sprint: 7 - Workflow Page
   ========================================================== */

"use strict";

/* ==========================================================
   Workflow Page
   ========================================================== */

const WorkflowPage = {

    initialized: false,

    workflows: [],

    activeWorkflow: null,

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

            "Workflow Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.workflows =

            WorkflowManager.all();

        EventBus.emit(

            "workflow.updated",

            this.workflows

        );

    },

    /* ======================================================
       Create Workflow
       ====================================================== */

    create(data = {}) {

        const workflow =

            WorkflowManager.create({

                name:

                    data.name ||

                    "New Workflow",

                description:

                    data.description ||

                    ""

            });

        this.refresh();

        return workflow;

    },

    /* ======================================================
       Open Workflow
       ====================================================== */

    open(id) {

        this.activeWorkflow =

            WorkflowManager.get(id);

    },

    /* ======================================================
       Execute Workflow
       ====================================================== */

    run() {

        if (

            !this.activeWorkflow

        ) {

            return;

        }

        WorkflowManager.run(

            this.activeWorkflow.id

        );

    },

    /* ======================================================
       Delete Workflow
       ====================================================== */

    remove(id) {

        WorkflowManager.remove(id);

        this.refresh();

    },

    /* ======================================================
       Workflows
       ====================================================== */

    all() {

        return this.workflows;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.WorkflowPage = WorkflowPage;