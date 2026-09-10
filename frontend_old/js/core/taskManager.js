/*
==========================================================
Easy AI Studio
File    : frontend/js/core/taskManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class TaskManager {

    constructor() {

        this.tasks = [];

        this.currentTask = null;

    }

    async load() {

        try {

            const response =

                await TasksAPI.getTasks();

            this.tasks =

                response.tasks || [];

            return this.tasks;

        }

        catch (error) {

            console.error(

                "Task Load Error",

                error

            );

            return [];

        }

    }

    async create(

        data

    ) {

        const task =

            await TasksAPI.create(

                data

            );

        await this.load();

        return task;

    }

    async get(

        taskId

    ) {

        return await TasksAPI.getTask(

            taskId

        );

    }

    async update(

        taskId,

        data

    ) {

        const task =

            await TasksAPI.update(

                taskId,

                data

            );

        await this.load();

        return task;

    }

    async delete(

        taskId

    ) {

        await TasksAPI.delete(

            taskId

        );

        await this.load();

    }

    setCurrent(

        task

    ) {

        this.currentTask = task;

    }

    current() {

        return this.currentTask;

    }

    list() {

        return this.tasks;

    }

    count() {

        return this.tasks.length;

    }

    latest() {

        if (

            this.tasks.length === 0

        ) {

            return null;

        }

        return this.tasks[

            this.tasks.length - 1

        ];

    }

    find(

        taskId

    ) {

        return this.tasks.find(

            task =>

                task.id === taskId

        );

    }

    exists(

        taskId

    ) {

        return (

            this.find(

                taskId

            ) !== undefined

        );

    }

    clearCurrent() {

        this.currentTask = null;

    }

    clear() {

        this.tasks = [];

    }

}

const TaskService =

    new TaskManager();

window.TaskManager =

    TaskService;