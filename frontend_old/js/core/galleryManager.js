/*
==========================================================
Easy AI Studio
File    : frontend/js/core/galleryManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class GalleryManager {

    constructor() {

        this.images = [];

    }

    async load() {

        try {

            const response =

                await ImagesAPI.getGallery();

            this.images =

                response.images || [];

            return this.images;

        }

        catch (error) {

            console.error(

                "Gallery Load Error",

                error

            );

            return [];

        }

    }

    async refresh() {

        return await this.load();

    }

    async get(

        imageId

    ) {

        return await ImagesAPI.getImage(

            imageId

        );

    }

    async generate(

        data

    ) {

        const result =

            await ImagesAPI.generate(

                data

            );

        await this.load();

        return result;

    }

    async clear() {

        await ImagesAPI.clearHistory();

        this.images = [];

    }

    list() {

        return this.images;

    }

    count() {

        return this.images.length;

    }

    latest() {

        if (

            this.images.length === 0

        ) {

            return null;

        }

        return this.images[

            this.images.length - 1

        ];

    }

    find(

        imageId

    ) {

        return this.images.find(

            image =>

                image.id === imageId

        );

    }

    exists(

        imageId

    ) {

        return (

            this.find(

                imageId

            ) !== undefined

        );

    }

}

const GalleryService =

    new GalleryManager();

window.GalleryManager =

    GalleryService;