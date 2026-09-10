/*
==========================================================
Easy AI Studio
File    : frontend/js/core/videoManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class VideoManager {

    constructor() {

        this.videos = [];

    }

    async load() {

        try {

            const response =

                await VideosAPI.getVideos();

            this.videos =

                response.videos || [];

            return this.videos;

        }

        catch (error) {

            console.error(

                "Video Load Error",

                error

            );

            return [];

        }

    }

    async refresh() {

        return await this.load();

    }

    async get(

        videoId

    ) {

        return await VideosAPI.getVideo(

            videoId

        );

    }

    async generate(

        data

    ) {

        const result =

            await VideosAPI.generate(

                data

            );

        await this.load();

        return result;

    }

    async exports() {

        return await VideosAPI.getExports();

    }

    async clear() {

        await VideosAPI.clearHistory();

        this.videos = [];

    }

    list() {

        return this.videos;

    }

    count() {

        return this.videos.length;

    }

    latest() {

        if (

            this.videos.length === 0

        ) {

            return null;

        }

        return this.videos[

            this.videos.length - 1

        ];

    }

    find(

        videoId

    ) {

        return this.videos.find(

            video =>

                video.id === videoId

        );

    }

    exists(

        videoId

    ) {

        return (

            this.find(

                videoId

            ) !== undefined

        );

    }

}

const VideoService =

    new VideoManager();

window.VideoManager =

    VideoService;