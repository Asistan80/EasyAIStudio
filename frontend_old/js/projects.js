/* ==========================================================
   Easy AI Studio
   File: frontend/js/projects.js
   Version: 1.0.0
   Sprint: 5 - Projects Module
   ========================================================== */

"use strict";

/* ==========================================================
   Projects Manager
   ========================================================== */

const Projects = {

    storageKey: "projects",

    list: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Projects Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.list =

            Storage.get(

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

            this.list

        );

        if (window.Dashboard) {

            Dashboard.set(

                "projects",

                this.list.length

            );

        }

    },

    /* ======================================================
       Create
       ====================================================== */

    create(name) {

        const project = {

            id: Utils.uuid(),

            name: name,

            description: "",

            created: Utils.now(),

            updated: Utils.now(),

            favorite: false

        };

        this.list.push(project);

        this.save();

        Notification.success(

            "Project created."

        );

        return project;

    },

    /* ======================================================
       Delete
       ====================================================== */

    remove(id) {

        this.list =

            this.list.filter(

                project =>

                project.id !== id

            );

        this.save();

        Notification.info(

            "Project removed."

        );

    },

    /* ======================================================
       Update
       ====================================================== */

    rename(id, name) {

        const project =

            this.get(id);

        if (!project) {

            return;

        }

        project.name = name;

        project.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Favorite
       ====================================================== */

    favorite(id) {

        const project =

            this.get(id);

        if (!project) {

            return;

        }

        project.favorite =

            !project.favorite;

        this.save();

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.list.find(

            project =>

            project.id === id

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.list;

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword =

            keyword

            .toLowerCase()

            .trim();

        return this.list.filter(

            project =>

            project.name

            .toLowerCase()

            .includes(keyword)

        );

    },

    /* ======================================================
       Clear
       ====================================================== */

    clear() {

        this.list = [];

        this.save();

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Projects = Projects;