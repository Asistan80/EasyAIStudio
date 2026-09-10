/*
==========================================================
Easy AI Studio
File    : frontend/js/core/projectManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ProjectManager {

    constructor() {

        this.projects = [];

        this.currentProject = null;

    }

    async load() {

        try {

            const response =

                await ProjectsAPI.getProjects();

            this.projects =

                response.projects || [];

            return this.projects;

        }

        catch (error) {

            console.error(

                "Project Load Error",

                error

            );

            return [];

        }

    }

    async create(

        data

    ) {

        const project =

            await ProjectsAPI.createProject(

                data

            );

        await this.load();

        return project;

    }

    async open(

        projectId

    ) {

        const project =

            await ProjectsAPI.getProject(

                projectId

            );

        this.currentProject =

            project;

        return project;

    }

    async save(

        projectId,

        data

    ) {

        const project =

            await ProjectsAPI.updateProject(

                projectId,

                data

            );

        await this.load();

        return project;

    }

    async delete(

        projectId

    ) {

        await ProjectsAPI.deleteProject(

            projectId

        );

        await this.load();

    }

    current() {

        return this.currentProject;

    }

    list() {

        return this.projects;

    }

    count() {

        return this.projects.length;

    }

    exists(

        projectId

    ) {

        return this.projects.some(

            project =>

                project.id === projectId

        );

    }

    clearCurrent() {

        this.currentProject = null;

    }

}

const ProjectService =

    new ProjectManager();

window.ProjectManager =

    ProjectService;