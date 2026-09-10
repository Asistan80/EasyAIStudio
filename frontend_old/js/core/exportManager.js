/*
==========================================================
Easy AI Studio
File    : frontend/js/core/exportManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ExportManager {

    constructor() {

        this.supportedFormats = [

            "json",

            "txt",

            "png",

            "jpg",

            "webp",

            "mp4",

            "zip"

        ];

    }

    async exportProject(

        projectId,

        format = "json"

    ) {

        return await API.get(

            "/export/project/" +

            projectId +

            "?format=" +

            format

        );

    }

    async exportChat(

        format = "txt"

    ) {

        return await API.get(

            "/export/chat?format=" +

            format

        );

    }

    async exportImage(

        imageId,

        format = "png"

    ) {

        return await API.get(

            "/export/image/" +

            imageId +

            "?format=" +

            format

        );

    }

    async exportVideo(

        videoId,

        format = "mp4"

    ) {

        return await API.get(

            "/export/video/" +

            videoId +

            "?format=" +

            format

        );

    }

    async exportWorkflow(

        workflowId,

        format = "json"

    ) {

        return await API.get(

            "/export/workflow/" +

            workflowId +

            "?format=" +

            format

        );

    }

    async exportSettings() {

        return await API.get(

            "/export/settings"

        );

    }

    async exportEverything() {

        return await API.get(

            "/export/all"

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

const ExportService =

    new ExportManager();

window.ExportManager =

    ExportService;