/* ==========================================================
   Easy AI Studio
   File: frontend/js/projectManager.js
   Version: 1.0.0
   Sprint: 9 - Project Manager
   ========================================================== */

"use strict";



/* ==========================================================
   Project Manager
   ========================================================== */

const ProjectManager = {



    projects: [],



    current: null,







    /* ======================================================
       Initialize
       ====================================================== */

    init() {



        this.load();



        console.log(

            "Project Manager Ready"

        );



    },







    /* ======================================================
       Create Project
       ====================================================== */

    create(name) {



        const project = {



            id:

                Utils.uuid(),



            name:

                name || "Yeni Proje",



            created:

                new Date(),



            updated:

                new Date(),



            files:

                [],



            settings:

                {}



        };





        this.projects.push(

            project

        );



        this.current =

            project;



        this.save();





        EventBus.emit(

            "project.created",

            project

        );



        return project;



    },







    /* ======================================================
       Save Current
       ====================================================== */

    saveCurrent(data = null) {



        if (

            !this.current

        ) {



            return false;



        }





        if (

            data

        ) {



            Object.assign(

                this.current,

                data

            );



        }





        this.current.updated =

            new Date();



        this.save();



        EventBus.emit(

            "project.saved",

            this.current

        );



        return true;



    },







    /* ======================================================
       Open Project
       ====================================================== */

    open(id) {



        const project =

            this.projects.find(

                item =>

                item.id === id

            );





        if (

            !project

        ) {



            return null;



        }





        this.current =

            project;



        EventBus.emit(

            "project.opened",

            project

        );



        return project;



    },







    /* ======================================================
       Delete
       ====================================================== */

    remove(id) {



        this.projects =

            this.projects.filter(

                item =>

                item.id !== id

            );





        if (

            this.current &&

            this.current.id === id

        ) {



            this.current =

                null;



        }





        this.save();



    },







    /* ======================================================
       Load
       ====================================================== */

    load() {



        this.projects =

            Storage.get(

                "projects",

                []

            );



    },







    /* ======================================================
       Save
       ====================================================== */

    save() {



        Storage.set(

            "projects",

            this.projects

        );



    },







    /* ======================================================
       All
       ====================================================== */

    all() {



        return this.projects;



    }






};







/* ==========================================================
   Global
   ========================================================== */

window.ProjectManager = ProjectManager;