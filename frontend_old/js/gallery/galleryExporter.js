/*
==========================================================
Easy AI Studio
File    : frontend/js/gallery/galleryExporter.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class GalleryExporter {

    constructor() {

        this.supportedFormats = [

            "png",

            "jpg",

            "webp",

            "zip",

            "json"

        ];

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

    async exportImage(

        imageId,

        format = "png"

    ) {

        if (

            !this.isSupported(

                format

            )

        ) {

            throw new Error(

                "Unsupported export format."

            );

        }

        return await ExportManager.exportImage(

            imageId,

            format

        );

    }

    async exportSelected(

        imageIds,

        format = "zip"

    ) {

        if (

            !this.isSupported(

                format

            )

        ) {

            throw new Error(

                "Unsupported export format."

            );

        }

        return await API.post(

            "/gallery/export",

            {

                images:

                    imageIds,

                format

            }

        );

    }

    async exportFavorites(

        format = "zip"

    ) {

        const favorites =

            GalleryManager

                .favoritesList()

                .map(

                    image =>

                        image.id

                );

        return await this.exportSelected(

            favorites,

            format

        );

    }

    async exportAll(

        format = "zip"

    ) {

        const images =

            GalleryManager

                .all()

                .map(

                    image =>

                        image.id

                );

        return await this.exportSelected(

            images,

            format

        );

    }

    async exportMetadata(

        imageId

    ) {

        return await API.get(

            "/gallery/" +

            imageId +

            "/metadata"

        );

    }

    async exportMetadataAll() {

        return await API.get(

            "/gallery/metadata"

        );

    }

}

const GalleryExporterService =

    new GalleryExporter();

window.GalleryExporter =

    GalleryExporterService;