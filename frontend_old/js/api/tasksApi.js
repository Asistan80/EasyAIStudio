/*
==========================================================
Easy AI Studio
File    : frontend/js/api/tasksApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class TasksAPI {

    async getTasks() {

        return await API.get(

            "/tasks"

        );

    }

    async getTask(

        taskId

    ) {

        return await API.get(

            "/tasks/" +

            taskId

        );

    }

    async create(

        data

    ) {

        return await API.post(

            "/tasks",

            data

        );

    }

    async update(

        taskId,

        data

    ) {

        return await API.put(

            "/tasks/" +

            taskId,

            data

        );

    }

    async delete(

        taskId

    ) {

        return await API.delete(

            "/tasks/" +

            taskId

        );

    }

}

const TasksService = new TasksAPI();

window.TasksAPI = TasksService;