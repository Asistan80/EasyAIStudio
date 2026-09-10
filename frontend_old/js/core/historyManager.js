/*
==========================================================
Easy AI Studio
File    : frontend/js/core/historyManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class HistoryManager {

    constructor() {

        this.history = {

            chats: [],

            images: [],

            videos: [],

            workflows: []

        };

    }

    async load() {

        try {

            const [

                chats,

                images,

                videos,

                workflows

            ] = await Promise.all([

                ChatAPI.getHistory(),

                ImagesAPI.getGallery(),

                VideosAPI.getVideos(),

                WorkflowsAPI.getWorkflows()

            ]);

            this.history.chats =

                chats.history || [];

            this.history.images =

                images.images || [];

            this.history.videos =

                videos.videos || [];

            this.history.workflows =

                workflows.workflows || [];

            return this.history;

        }

        catch (error) {

            console.error(

                "History Load Error",

                error

            );

            return this.history;

        }

    }

    async refresh() {

        return await this.load();

    }

    getChats() {

        return this.history.chats;

    }

    getImages() {

        return this.history.images;

    }

    getVideos() {

        return this.history.videos;

    }

    getWorkflows() {

        return this.history.workflows;

    }

    total() {

        return (

            this.history.chats.length +

            this.history.images.length +

            this.history.videos.length +

            this.history.workflows.length

        );

    }

    clear() {

        this.history = {

            chats: [],

            images: [],

            videos: [],

            workflows: []

        };

    }

    latestChat() {

        return this.history.chats.at(-1) || null;

    }

    latestImage() {

        return this.history.images.at(-1) || null;

    }

    latestVideo() {

        return this.history.videos.at(-1) || null;

    }

    latestWorkflow() {

        return this.history.workflows.at(-1) || null;

    }

}

const HistoryService =

    new HistoryManager();

window.HistoryManager =

    HistoryService;