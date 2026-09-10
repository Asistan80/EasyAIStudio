/*
==========================================================
Easy AI Studio
File    : frontend/js/api/index.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class APILoader {

    constructor() {

        this.services = {

            api: window.API,

            status: window.StatusAPI,

            system: window.SystemAPI,

            settings: window.SettingsAPI,

            projects: window.ProjectsAPI,

            providers: window.ProvidersAPI,

            models: window.ModelsAPI,

            chat: window.ChatAPI,

            images: window.ImagesAPI,

            videos: window.VideosAPI,

            workflows: window.WorkflowsAPI,

            tasks: window.TasksAPI,

            plugins: window.PluginsAPI

        };

    }

    get(

        service

    ) {

        return this.services[service];

    }

    exists(

        service

    ) {

        return service in this.services;

    }

    names() {

        return Object.keys(

            this.services

        );

    }

    count() {

        return this.names().length;

    }

    all() {

        return this.services;

    }

}

const APIServices = new APILoader();

window.APIServices = APIServices;