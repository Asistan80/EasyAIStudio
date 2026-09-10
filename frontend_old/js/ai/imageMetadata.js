/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/imageMetadata.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class ImageMetadataManager {

    constructor() {

        this.records = [];

    }

    create(

        data

    ) {

        const metadata = {

            id:

                crypto.randomUUID(),

            createdAt:

                new Date().toISOString(),

            prompt:

                data.prompt ||

                "",

            negativePrompt:

                data.negativePrompt ||

                "",

            seed:

                data.seed ||

                null,

            model:

                data.model ||

                null,

            loras:

                data.loras ||

                [],

            controlNet:

                data.controlNet ||

                null,

            width:

                data.width ||

                1024,

            height:

                data.height ||

                1024,

            steps:

                data.steps ||

                30,

            cfgScale:

                data.cfgScale ||

                7,

            sampler:

                data.sampler ||

                "",

            scheduler:

                data.scheduler ||

                "",

            fileName:

                data.fileName ||

                "",

            provider:

                data.provider ||

                ""

        };

        this.records.push(

            metadata

        );

        EventBus.emit(

            "metadata:created",

            metadata

        );

        return metadata;

    }

    all() {

        return this.records;

    }

    find(

        id

    ) {

        return this.records.find(

            item =>

                item.id === id

        );

    }

    update(

        id,

        values

    ) {

        const metadata =

            this.find(

                id

            );

        if (

            !metadata

        ) {

            return false;

        }

        Object.assign(

            metadata,

            values

        );

        EventBus.emit(

            "metadata:updated",

            metadata

        );

        return true;

    }

    remove(

        id

    ) {

        this.records =

            this.records.filter(

                item =>

                    item.id !== id

            );

    }

    latest() {

        return this.records.at(

            -1

        ) || null;

    }

    clear() {

        this.records = [];

    }

    count() {

        return this.records.length;

    }

}

const ImageMetadataService =

    new ImageMetadataManager();

window.ImageMetadata =

    ImageMetadataService;