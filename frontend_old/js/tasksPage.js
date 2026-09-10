/* ==========================================================
   Easy AI Studio
   File: frontend/js/tasksPage.js
   Version: 1.0.0
   Sprint: 7 - Tasks Page
   ========================================================== */

"use strict";

/* ==========================================================
   Tasks Page
   ========================================================== */

const TasksPage = {

    initialized: false,

    tasks: [],

    activeTasks: [],

    completedTasks: [],

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

            "Tasks Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.tasks =

            TaskManager.all();

        this.activeTasks =

            this.tasks.filter(

                task =>

                task.status === "active"

            );

        this.completedTasks =

            this.tasks.filter(

                task =>

                task.status === "completed"

            );

        EventBus.emit(

            "tasks.updated",

            this.tasks

        );

    },

    /* ======================================================
       Create Task
       ====================================================== */

    create(data = {}) {

        const task =

            TaskManager.create({

                title:

                    data.title ||

                    "New Task",

                description:

                    data.description ||

                    "",

                priority:

                    data.priority ||

                    "normal"

            });

        this.refresh();

        return task;

    },

    /* ======================================================
       Complete Task
       ====================================================== */

    complete(id) {

        TaskManager.complete(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Delete Task
       ====================================================== */

    remove(id) {

        TaskManager.remove(

            id

        );

        this.refresh();

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        return this.tasks.filter(

            task =>

            task.title

                .toLowerCase()

                .includes(

                    keyword.toLowerCase()

                )

        );

    },

    /* ======================================================
       All Tasks
       ====================================================== */

    all() {

        return this.tasks;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.TasksPage = TasksPage;