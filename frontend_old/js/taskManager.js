/* ==========================================================
   Easy AI Studio
   File: frontend/js/taskManager.js
   Version: 1.0.0
   Sprint: 5 - Task Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Task Manager
   ========================================================== */

const TaskManager = {

    tasks: [],

    running: false,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Task Manager Ready"

        );

    },

    /* ======================================================
       Add Task
       ====================================================== */

    add(task = {}) {

        const item = {

            id: Utils.uuid(),

            name: task.name || "Task",

            action: task.action || null,

            status: "waiting",

            progress: 0,

            created: Utils.now()

        };

        this.tasks.push(item);

        this.run();

        return item;

    },

    /* ======================================================
       Run Queue
       ====================================================== */

    async run() {

        if (

            this.running

        ) {

            return;

        }

        const task = this.tasks.find(

            item =>

            item.status === "waiting"

        );

        if (!task) {

            return;

        }

        this.running = true;

        task.status = "running";

        for (

            let progress = 0;

            progress <= 100;

            progress += 10

        ) {

            task.progress = progress;

            await Utils.delay(100);

        }

        if (

            typeof task.action ===

            "function"

        ) {

            await task.action();

        }

        task.status = "completed";

        task.progress = 100;

        Notification.success(

            `${task.name} completed.`

        );

        this.running = false;

        this.run();

    },

    /* ======================================================
       Cancel
       ====================================================== */

    cancel(id) {

        const task = this.get(id);

        if (!task) {

            return;

        }

        task.status = "cancelled";

    },

    /* ======================================================
       Find
       ====================================================== */

    get(id) {

        return this.tasks.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Remove Completed
       ====================================================== */

    clearCompleted() {

        this.tasks = this.tasks.filter(

            item =>

            item.status !==

            "completed"

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.tasks;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.TaskManager = TaskManager;