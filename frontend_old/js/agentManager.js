/* ==========================================================
   Easy AI Studio
   File: frontend/js/agentManager.js
   Version: 1.0.0
   Sprint: 6 - AI Agent Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Agent Manager
   ========================================================== */

const AgentManager = {

    storageKey: "agents",

    agents: [],

    activeAgent: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Agent Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.agents = Storage.get(

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

            this.agents

        );

    },

    /* ======================================================
       Create Agent
       ====================================================== */

    create(data = {}) {

        const agent = {

            id: Utils.uuid(),

            name: data.name || "New Agent",

            description: data.description || "",

            model: data.model || "",

            systemPrompt: data.systemPrompt || "",

            temperature: data.temperature ?? 0.7,

            maxTokens: data.maxTokens ?? 4096,

            tools: data.tools || [],

            enabled: true,

            created: Utils.now(),

            updated: Utils.now()

        };

        this.agents.push(agent);

        this.save();

        Notification.success(

            "Agent created."

        );

        return agent;

    },

    /* ======================================================
       Set Active
       ====================================================== */

    activate(id) {

        const agent = this.get(id);

        if (!agent) {

            return;

        }

        this.activeAgent = id;

        EventBus.emit(

            "agent.changed",

            agent

        );

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.agents.find(

            agent =>

            agent.id === id

        );

    },

    /* ======================================================
       Update
       ====================================================== */

    update(id, data = {}) {

        const agent = this.get(id);

        if (!agent) {

            return;

        }

        Object.assign(

            agent,

            data

        );

        agent.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Delete
       ====================================================== */

    remove(id) {

        this.agents = this.agents.filter(

            agent =>

            agent.id !== id

        );

        if (

            this.activeAgent === id

        ) {

            this.activeAgent = null;

        }

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.agents;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.AgentManager = AgentManager;