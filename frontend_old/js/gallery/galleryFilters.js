/*
==========================================================
Easy AI Studio
File    : frontend/js/gallery/galleryFilters.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class GalleryFilters {

    constructor() {

        this.filters = {

            model: null,

            provider: null,

            favorite: false,

            minWidth: null,

            minHeight: null,

            fromDate: null,

            toDate: null,

            tags: []

        };

    }

    set(

        key,

        value

    ) {

        if (

            key in this.filters

        ) {

            this.filters[key] =

                value;

        }

    }

    get(

        key

    ) {

        return this.filters[key];

    }

    reset() {

        this.filters = {

            model: null,

            provider: null,

            favorite: false,

            minWidth: null,

            minHeight: null,

            fromDate: null,

            toDate: null,

            tags: []

        };

    }

    apply(

        images

    ) {

        return images.filter(

            image => {

                if (

                    this.filters.model &&

                    image.model !==

                    this.filters.model

                ) {

                    return false;

                }

                if (

                    this.filters.provider &&

                    image.provider !==

                    this.filters.provider

                ) {

                    return false;

                }

                if (

                    this.filters.favorite &&

                    !GalleryManager.isFavorite(

                        image.id

                    )

                ) {

                    return false;

                }

                if (

                    this.filters.minWidth &&

                    image.width <

                    this.filters.minWidth

                ) {

                    return false;

                }

                if (

                    this.filters.minHeight &&

                    image.height <

                    this.filters.minHeight

                ) {

                    return false;

                }

                if (

                    this.filters.fromDate

                ) {

                    const created =

                        new Date(

                            image.createdAt

                        );

                    if (

                        created <

                        new Date(

                            this.filters.fromDate

                        )

                    ) {

                        return false;

                    }

                }

                if (

                    this.filters.toDate

                ) {

                    const created =

                        new Date(

                            image.createdAt

                        );

                    if (

                        created >

                        new Date(

                            this.filters.toDate

                        )

                    ) {

                        return false;

                    }

                }

                if (

                    this.filters.tags.length >

                    0

                ) {

                    const tags =

                        image.tags || [];

                    const matched =

                        this.filters.tags.every(

                            tag =>

                                tags.includes(

                                    tag

                                )

                        );

                    if (

                        !matched

                    ) {

                        return false;

                    }

                }

                return true;

            }

        );

    }

    current() {

        return {

            ...this.filters

        };

    }

}

const GalleryFiltersService =

    new GalleryFilters();

window.GalleryFilters =

    GalleryFiltersService;