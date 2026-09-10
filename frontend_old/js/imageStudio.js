/* ==========================================================
   Easy AI Studio
   File: frontend/js/imageStudio.js
   Version: 1.0.0
   Sprint: 6 - Image Studio
   ========================================================== */

"use strict";

/* ==========================================================
   Image Studio
   ========================================================== */

const ImageStudio = {

    projects: [],

    activeProject: null,

    gallery: [],

    generations: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Image Studio Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.projects = Storage.get(

            "image-projects",

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            "image-projects",

            this.projects

        );

    },

    /* ======================================================
       Create Project
       ====================================================== */

    create(data = {}) {

        const project = {

            id: Utils.uuid(),

            name: data.name || "New Image Project",

            width: data.width || 1024,

            height: data.height || 1024,

            prompt: "",

            negativePrompt: "",

            images: [],

            created: Utils.now(),

            updated: Utils.now()

        };

        this.projects.push(

            project

        );

        this.save();

        EventBus.emit(

            "image.project.created",

            project

        );

        return project;

    },

    /* ======================================================
       Open Project
       ====================================================== */

    open(id) {

        const project = this.get(id);

        if (!project) {

            return;

        }

        this.activeProject = id;

        EventBus.emit(

            "image.project.opened",

            project

        );

    },

    /* ======================================================
       Add Image
       ====================================================== */

    addImage(image = {}) {

        const project = this.get(

            this.activeProject

        );

        if (!project) {

            return;

        }

        project.images.push({

            id: Utils.uuid(),

            ...image

        });

        project.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Remove Image
       ====================================================== */

    removeImage(id) {

        const project = this.get(

            this.activeProject

        );

        if (!project) {

            return;

        }

        project.images =

            project.images.filter(

                image =>

                image.id !== id

            );

        project.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Queue Generation
       ====================================================== */

    generate(task = {}) {

        const job = {

            id: Utils.uuid(),

            status: "queued",

            provider:

                task.provider || "",

            model:

                task.model || "",

            prompt:

                task.prompt || "",

            created: Utils.now()

        };

        this.generations.push(job);

        EventBus.emit(

            "image.generation.created",

            job

        );

        return job;

    },

    /* ======================================================
       Find Project
       ====================================================== */

    get(id) {

        return this.projects.find(

            project =>

            project.id === id

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.projects;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.ImageStudio = ImageStudio;