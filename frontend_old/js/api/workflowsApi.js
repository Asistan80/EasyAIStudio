/*
==========================================================
Easy AI Studio
File    : frontend/js/api/workflowsApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class WorkflowsAPI {

    async getWorkflows() {

        return await API.get(

            "/workflows"

        );

    }

    async getWorkflow(

        workflowId

    ) {

        return await API.get(

            "/workflows/" +

            workflowId

        );

    }

    async create(

        data

    ) {

        return await API.post(

            "/workflows",

            data

        );

    }

    async update(

        workflowId,

        data

    ) {

        return await API.put(

            "/workflows/" +

            workflowId,

            data

        );

    }

    async delete(

        workflowId

    ) {

        return await API.delete(

            "/workflows/" +

            workflowId

        );

    }

}

const WorkflowsService = new WorkflowsAPI();

window.WorkflowsAPI = WorkflowsService;