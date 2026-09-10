/*
==========================================================
Easy AI Studio
File    : frontend/js/core/workflowManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class WorkflowManager {

    constructor() {

        this.workflows = [];

        this.currentWorkflow = null;

    }

    async load() {

        try {

            const response =

                await WorkflowsAPI.getWorkflows();

            this.workflows =

                response.workflows || [];

            return this.workflows;

        }

        catch (error) {

            console.error(

                "Workflow Load Error",

                error

            );

            return [];

        }

    }

    async create(

        data

    ) {

        const workflow =

            await WorkflowsAPI.create(

                data

            );

        await this.load();

        return workflow;

    }

    async open(

        workflowId

    ) {

        const workflow =

            await WorkflowsAPI.getWorkflow(

                workflowId

            );

        this.currentWorkflow = workflow;

        return workflow;

    }

    async save(

        workflowId,

        data

    ) {

        const workflow =

            await WorkflowsAPI.update(

                workflowId,

                data

            );

        await this.load();

        return workflow;

    }

    async delete(

        workflowId

    ) {

        await WorkflowsAPI.delete(

            workflowId

        );

        await this.load();

    }

    current() {

        return this.currentWorkflow;

    }

    list() {

        return this.workflows;

    }

    count() {

        return this.workflows.length;

    }

    find(

        workflowId

    ) {

        return this.workflows.find(

            workflow =>

                workflow.id === workflowId

        );

    }

    exists(

        workflowId

    ) {

        return (

            this.find(

                workflowId

            ) !== undefined

        );

    }

    clearCurrent() {

        this.currentWorkflow = null;

    }

}

const WorkflowService =

    new WorkflowManager();

window.WorkflowManager =

    WorkflowService;