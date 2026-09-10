/* ==========================================================
   Easy AI Studio
   File: frontend/js/modelManager.js
   Version: 1.0.0
   Sprint: 6 - Model Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Model Manager
   ========================================================== */

const ModelManager = {

    providers: [],

    activeModel: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.registerDefaults();

        console.log(

            "Model Manager Ready"

        );

    },

    /* ======================================================
       Register Default Providers
       ====================================================== */

    registerDefaults() {

        this.register({

            id: "ollama",

            name: "Ollama",

            enabled: true

        });

        this.register({

            id: "openai",

            name: "OpenAI",

            enabled: true

        });

        this.register({

            id: "gemini",

            name: "Gemini",

            enabled: true

        });

        this.register({

            id: "claude",

            name: "Claude",

            enabled: true

        });

        this.register({

            id: "grok",

            name: "Grok",

            enabled: true

        });

    },

    /* ======================================================
       Register Provider
       ====================================================== */

    register(provider) {

        this.providers.push({

            id: provider.id,

            name: provider.name,

            enabled: provider.enabled ?? true

        });

    },

    /* ======================================================
       Set Active Model
       ====================================================== */

    setActive(model) {

        this.activeModel = model;

        EventBus.emit(

            "model.changed",

            model

        );

    },

    /* ======================================================
       Active Model
       ====================================================== */

    getActive() {

        return this.activeModel;

    },

    /* ======================================================
       Providers
       ====================================================== */

    getProviders() {

        return this.providers;

    },

    /* ======================================================
       Find Provider
       ====================================================== */

    getProvider(id) {

        return this.providers.find(

            provider =>

            provider.id === id

        );

    },

    /* ======================================================
       Enable
       ====================================================== */

    enable(id) {

        const provider =

            this.getProvider(id);

        if (!provider) {

            return;

        }

        provider.enabled = true;

    },

    /* ======================================================
       Disable
       ====================================================== */

    disable(id) {

        const provider =

            this.getProvider(id);

        if (!provider) {

            return;

        }

        provider.enabled = false;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ModelManager = ModelManager;