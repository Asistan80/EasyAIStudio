/*
==========================================================
Easy AI Studio
File    : frontend/js/gallery/galleryImporter.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class GalleryImporter {

    constructor() {

        this.supportedFormats = [

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

    async importFile(

        file,

        format = "zip"

    ) {

        if (

            !this.isSupported(

                format

            )

        ) {

            throw new Error(

                "Unsupported import format."

            );

        }

        Loading.show(

            "Importing gallery..."

        );

        try {

            const response =

                await API.upload(

                    "/gallery/import",

                    file,

                    {

                        format

                    }

                );

            EventBus.emit(

                "gallery:imported",

                response

            );

            Notifications.success(

                "Gallery imported successfully."

            );

            return response;

        }

        catch (

            error

        ) {

            Logger.error(

                "Gallery import failed.",

                error

            );

            Notifications.error(

                "Gallery import failed."

            );

            return null;

        }

        finally {

            Loading.hide();

        }

    }

    async importMetadata(

        file

    ) {

        return await API.upload(

            "/gallery/import/metadata",

            file

        );

    }

    async validate(

        file

    ) {

        return await API.upload(

            "/gallery/import/validate",

            file

        );

    }

}

const GalleryImporterService =

    new GalleryImporter();

window.GalleryImporter =

    GalleryImporterService;