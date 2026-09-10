/* ==========================================================
   Easy AI Studio
   File: frontend/js/trainingPage.js
   Version: 1.0.0
   Sprint: 7 - Training Page
   ========================================================== */

"use strict";

/* ==========================================================
   Training Page
   ========================================================== */

const TrainingPage = {

    initialized: false,

    jobs: [],

    selectedDataset: null,

    selectedModel: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.registerEvents();

        console.log(

            "Training Page Ready"

        );

    },

    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {

        EventBus.on(

            "training.created",

            job => {

                this.jobs.push(

                    job

                );

            }

        );

        EventBus.on(

            "training.completed",

            () => {

                this.refresh();

            }

        );

    },

    /* ======================================================
       Create Training
       ====================================================== */

    create(options = {}) {

        TrainingManager.create({

            dataset:

                this.selectedDataset,

            model:

                this.selectedModel,

            ...options

        });

    },

    /* ======================================================
       Dataset
       ====================================================== */

    selectDataset(id) {

        this.selectedDataset = id;

    },

    /* ======================================================
       Model
       ====================================================== */

    selectModel(id) {

        this.selectedModel = id;

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.jobs =

            TrainingManager.all();

    },

    /* ======================================================
       Jobs
       ====================================================== */

    all() {

        return this.jobs;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.TrainingPage = TrainingPage;