/* ==========================================================
   Easy AI Studio
   File: frontend/js/providerManager.js
   Version: 1.0.0
   Sprint: 6 - AI Provider Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Provider Manager
   ========================================================== */

const ProviderManager = {

    providers: new Map(),

    activeProvider: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.registerDefaults();

        console.log(

            "Provider Manager Ready"

        );

    },

    /* ======================================================
       Register Default Providers
       ====================================================== */

    registerDefaults() {

        this.register({

            id: "ollama",

            name: "Ollama",

            manager: window.OllamaManager

        });

        this.register({

            id: "openai",

            name: "OpenAI",

            manager: window.OpenAIManager

        });

        this.register({

            id: "gemini",

            name: "Gemini",

            manager: window.GeminiManager

        });

        this.register({

            id: "claude",

            name: "Claude",

            manager: window.ClaudeManager

        });

        this.register({

            id: "grok",

            name: "Grok",

            manager: window.GrokManager

        });

        this.register({

            id: "stable-diffusion",

            name: "Stable Diffusion",

            manager: window.StableDiffusionManager

        });

        this.register({

            id: "comfyui",

            name: "ComfyUI",

            manager: window.ComfyUIManager

        });

        this.register({

            id: "flux",

            name: "FLUX",

            manager: window.FluxManager

        });

    },

    /* ======================================================
       Register Provider
       ====================================================== */

    register(provider) {

        this.providers.set(

            provider.id,

            provider

        );

    },

    /* ======================================================
       Active Provider
       ====================================================== */

    setActive(id) {

        if (

            !this.providers.has(id)

        ) {

            return;

        }

        this.activeProvider = id;

        EventBus.emit(

            "provider.changed",

            this.get(id)

        );

    },

    /* ======================================================
       Current Provider
       ====================================================== */

    current() {

        return this.get(

            this.activeProvider

        );

    },

    /* ======================================================
       Find Provider
       ====================================================== */

    get(id) {

        return this.providers.get(id);

    },

    /* ======================================================
       List Providers
       ====================================================== */

    all() {

        return Array.from(

            this.providers.values()

        );

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ProviderManager = ProviderManager;