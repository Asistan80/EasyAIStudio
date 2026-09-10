/*
==========================================================
Easy AI Studio
File    : frontend/js/api/videosApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class VideosAPI {

    async getVideos() {

        return await API.get(

            "/videos"

        );

    }

    async generate(

        data

    ) {

        return await API.post(

            "/videos/generate",

            data

        );

    }

    async getVideo(

        videoId

    ) {

        return await API.get(

            "/videos/" +

            videoId

        );

    }

    async getExports() {

        return await API.get(

            "/videos/exports/list"

        );

    }

    async clearHistory() {

        return await API.delete(

            "/videos"

        );

    }

}

const VideosService = new VideosAPI();

window.VideosAPI = VideosService;