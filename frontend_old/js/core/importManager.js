/*
==========================================================
Easy AI Studio
File    : frontend/js/core/importManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ImportManager {

    constructor() {

        this.supportedFormats = [

            "json",

            "txt",

            "zip"

        ];

    }

    async importProject(

        data

    ) {

        return await API.post(

            "/import/project",

            data

        );

    }

    async importSettings(

        data

    ) {

        return await API.post(

            "/import/settings",

            data

        );

    }

    async importWorkflow(

        data

    ) {

        return await API.post(

            "/import/workflow",

            data

        );

    }

    async importChat(

        data

    ) {

        return await API.post(

            "/import/chat",

            data

        );

    }

    async importGallery(

        data

    ) {

        return await API.post(

            "/import/gallery",

            data

        );

    }

    async importAll(

        data

    ) {

        return await API.post(

            "/import/all",

            data

        );

    }

    formats() {

        return this.supportedFormats;

    }

    isSupported(

        format

    ) {

        return this.supportedFormats.includes(

            format.toLowerCase()

        );

    }

}

const ImportService =

    new ImportManager();

window.ImportManager =

    ImportService;