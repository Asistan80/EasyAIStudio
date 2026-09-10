/*
==========================================================
Easy AI Studio
File    : frontend/js/gallery/gallerySelection.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class GallerySelection {

    constructor() {

        this.selected = new Set();

    }

    select(

        imageId

    ) {

        this.selected.add(

            imageId

        );

        EventBus.emit(

            "gallery:selectionChanged",

            this.list()

        );

    }

    deselect(

        imageId

    ) {

        this.selected.delete(

            imageId

        );

        EventBus.emit(

            "gallery:selectionChanged",

            this.list()

        );

    }

    toggle(

        imageId

    ) {

        if (

            this.selected.has(

                imageId

            )

        ) {

            this.deselect(

                imageId

            );

        }

        else {

            this.select(

                imageId

            );

        }

    }

    selectAll() {

        GalleryManager.all().forEach(

            image =>

                this.selected.add(

                    image.id

                )

        );

        EventBus.emit(

            "gallery:selectionChanged",

            this.list()

        );

    }

    clear() {

        this.selected.clear();

        EventBus.emit(

            "gallery:selectionChanged",

            []

        );

    }

    list() {

        return [

            ...this.selected

        ];

    }

    count() {

        return this.selected.size;

    }

    has(

        imageId

    ) {

        return this.selected.has(

            imageId

        );

    }

    async deleteSelected() {

        const ids =

            this.list();

        for (

            const id of ids

        ) {

            GalleryManager.remove(

                id

            );

        }

        this.clear();

    }

    async favoriteSelected() {

        this.list().forEach(

            id =>

                GalleryManager.favorite(

                    id

                )

        );

    }

    async unfavoriteSelected() {

        this.list().forEach(

            id =>

                GalleryManager.unfavorite(

                    id

                )

        );

    }

    async downloadSelected() {

        EventBus.emit(

            "gallery:downloadSelection",

            this.list()

        );

    }

    async tagSelected(

        tags = []

    ) {

        this.list().forEach(

            id => {

                const image =

                    GalleryManager.find(

                        id

                    );

                if (

                    image

                ) {

                    image.tags =

                        [

                            ...(image.tags || []),

                            ...tags

                        ];

                }

            }

        );

    }

}

const GallerySelectionService =

    new GallerySelection();

window.GallerySelection =

    GallerySelectionService;