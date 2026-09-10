/* ==========================================================
   Easy AI Studio
   File: frontend/js/videoStudio.js
   Version: 1.0.0
   Sprint: 6 - Video Studio
   ========================================================== */

"use strict";

/* ==========================================================
   Video Studio
   ========================================================== */

const VideoStudio = {

    projects: [],

    activeProject: null,

    timeline: [],

    clips: [],

    exports: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Video Studio Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.projects = Storage.get(

            "video-projects",

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            "video-projects",

            this.projects

        );

    },

    /* ======================================================
       Create Project
       ====================================================== */

    create(data = {}) {

        const project = {

            id: Utils.uuid(),

            name: data.name || "New Video Project",

            width: data.width || 1920,

            height: data.height || 1080,

            fps: data.fps || 30,

            duration: 0,

            timeline: [],

            assets: [],

            created: Utils.now(),

            updated: Utils.now()

        };

        this.projects.push(

            project

        );

        this.save();

        EventBus.emit(

            "video.project.created",

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

        this.timeline =

            project.timeline;

        EventBus.emit(

            "video.project.opened",

            project

        );

    },

    /* ======================================================
       Add Clip
       ====================================================== */

    addClip(clip = {}) {

        this.timeline.push({

            id: Utils.uuid(),

            ...clip

        });

    },

    /* ======================================================
       Remove Clip
       ====================================================== */

    removeClip(id) {

        this.timeline =

            this.timeline.filter(

                clip =>

                clip.id !== id

            );

    },

    /* ======================================================
       Export
       ====================================================== */

    export(options = {}) {

        const job = {

            id: Utils.uuid(),

            format:

                options.format || "mp4",

            resolution:

                options.resolution ||

                "1920x1080",

            status: "queued",

            created: Utils.now()

        };

        this.exports.push(job);

        EventBus.emit(

            "video.export.created",

            job

        );

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

window.VideoStudio = VideoStudio;