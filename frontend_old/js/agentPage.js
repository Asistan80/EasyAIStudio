/* ==========================================================
   Easy AI Studio
   File: frontend/js/agentPage.js
   Version: 1.0.0
   Sprint: 7 - Agent Page
   ========================================================== */

"use strict";

/* ==========================================================
   Agent Page
   ========================================================== */

const AgentPage = {

    initialized: false,

    agents: [],

    activeAgent: null,

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

            "Agent Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.agents =

            AgentManager.all();

        EventBus.emit(

            "agents.updated",

            this.agents

        );

    },

    /* ======================================================
       Create Agent
       ====================================================== */

    create(data = {}) {

        const agent =

            AgentManager.create({

                name:

                    data.name ||

                    "New Agent",

                provider:

                    data.provider ||

                    "ollama",

                model:

                    data.model ||

                    ""

            });

        this.refresh();

        return agent;

    },

    /* ======================================================
       Open Agent
       ====================================================== */

    open(id) {

        this.activeAgent =

            AgentManager.get(id);

    },

    /* ======================================================
       Run Agent
       ====================================================== */

    run(prompt) {

        if (

            !this.activeAgent

        ) {

            return;

        }

        AgentManager.run(

            this.activeAgent.id,

            prompt

        );

    },

    /* ======================================================
       Delete Agent
       ====================================================== */

    remove(id) {

        AgentManager.remove(id);

        this.refresh();

    },

    /* ======================================================
       Agent List
       ====================================================== */

    all() {

        return this.agents;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.AgentPage = AgentPage;