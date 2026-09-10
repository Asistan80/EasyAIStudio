/*
==========================================================
Easy AI Studio
File    : frontend/js/gallery/galleryManager.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class GalleryManager {

    constructor() {

        this.images = [];

        this.filteredImages = [];

        this.favorites = [];

        this.searchQuery = "";

        this.sortMode = "newest";

    }

    async load() {

        try {

            const response =

                await ImagesAPI.getGallery();

            this.images =

                response.images || [];

            this.filteredImages =

                [...this.images];

            EventBus.emit(

                "gallery:loaded",

                this.filteredImages

            );

            return this.filteredImages;

        }

        catch (

            error

        ) {

            Logger.error(

                "Gallery loading failed.",

                error

            );

            return [];

        }

    }

    all() {

        return this.filteredImages;

    }

    original() {

        return this.images;

    }

    add(

        image

    ) {

        this.images.unshift(

            image

        );

        this.filteredImages =

            [...this.images];

        EventBus.emit(

            "gallery:imageAdded",

            image

        );

    }

    remove(

        imageId

    ) {

        this.images =

            this.images.filter(

                image =>

                    image.id !== imageId

            );

        this.filteredImages =

            this.filteredImages.filter(

                image =>

                    image.id !== imageId

            );

        this.favorites =

            this.favorites.filter(

                id =>

                    id !== imageId

            );

        EventBus.emit(

            "gallery:imageRemoved",

            imageId

        );

    }

    find(

        imageId

    ) {

        return this.images.find(

            image =>

                image.id === imageId

        );

    }

    search(

        query

    ) {

        this.searchQuery =

            query.toLowerCase();

        this.filteredImages =

            this.images.filter(

                image =>

                    (

                        image.prompt ||

                        ""

                    )

                        .toLowerCase()

                        .includes(

                            this.searchQuery

                        )

            );

        return this.filteredImages;

    }

    clearSearch() {

        this.searchQuery = "";

        this.filteredImages =

            [...this.images];

    }

    sort(

        mode = "newest"

    ) {

        this.sortMode = mode;

        switch (

            mode

        ) {

            case "oldest":

                this.filteredImages.sort(

                    (

                        a,

                        b

                    ) =>

                        new Date(

                            a.createdAt

                        ) -

                        new Date(

                            b.createdAt

                        )

                );

                break;

            case "name":

                this.filteredImages.sort(

                    (

                        a,

                        b

                    ) =>

                        (

                            a.fileName ||

                            ""

                        ).localeCompare(

                            b.fileName ||

                            ""

                        )

                );

                break;

            default:

                this.filteredImages.sort(

                    (

                        a,

                        b

                    ) =>

                        new Date(

                            b.createdAt

                        ) -

                        new Date(

                            a.createdAt

                        )

                );

        }

        return this.filteredImages;

    }

    favorite(

        imageId

    ) {

        if (

            !this.favorites.includes(

                imageId

            )

        ) {

            this.favorites.push(

                imageId

            );

        }

    }

    unfavorite(

        imageId

    ) {

        this.favorites =

            this.favorites.filter(

                id =>

                    id !== imageId

            );

    }

    favoritesList() {

        return this.images.filter(

            image =>

                this.favorites.includes(

                    image.id

                )

        );

    }

    isFavorite(

        imageId

    ) {

        return this.favorites.includes(

            imageId

        );

    }

    clear() {

        this.images = [];

        this.filteredImages = [];

        this.favorites = [];

    }

    count() {

        return this.images.length;

    }

}

const GalleryManagerService =

    new GalleryManager();

window.GalleryManager =

    GalleryManagerService;