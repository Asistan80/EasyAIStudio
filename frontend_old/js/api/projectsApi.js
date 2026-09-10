/*
==========================================================
Easy AI Studio
File    : frontend/js/api/projectsApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ProjectsAPI {

    async getProjects() {

        return await API.get(

            "/projects"

        );

    }

    async getProject(

        projectId

    ) {

        return await API.get(

            "/projects/" + projectId

        );

    }

    async createProject(

        data

    ) {

        return await API.post(

            "/projects",

            data

        );

    }

    async updateProject(

        projectId,

        data

    ) {

        return await API.put(

            "/projects/" + projectId,

            data

        );

    }

    async deleteProject(

        projectId

    ) {

        return await API.delete(

            "/projects/" + projectId

        );

    }

}

const ProjectsService = new ProjectsAPI();

window.ProjectsAPI = ProjectsService;