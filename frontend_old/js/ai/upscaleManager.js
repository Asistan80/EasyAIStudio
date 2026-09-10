/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/upscaleManager.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class UpscaleManager {

    constructor() {

        this.models = [];

        this.currentModel = null;

        this.running = false;

        this.history = [];

    }

    async load() {

        try {

            const response =

                await UpscaleAPI.getModels();

            this.models =

                response.models || [];

            if (

                this.models.length > 0 &&

                !this.currentModel

            ) {

                this.currentModel =

                    this.models[0];

            }

            return this.models;

        }

        catch (

            error

        ) {

            Logger.error(

                "Upscale models could not be loaded.",

                error

            );

            return [];

        }

    }

    list() {

        return this.models;

    }

    select(

        modelId

    ) {

        const model =

            this.models.find(

                item =>

                    item.id === modelId

            );

        if (

            !model

        ) {

            return false;

        }

        this.currentModel =

            model;

        EventBus.emit(

            "upscale:modelChanged",

            model

        );

        return true;

    }

    current() {

        return this.currentModel;

    }

    async upscale(

        imageId,

        options = {}

    ) {

        if (

            this.running

        ) {

            return null;

        }

        this.running = true;

        Loading.show(

            "Upscaling image..."

        );

        try {

            const result =

                await UpscaleAPI.upscale(

                    imageId,

                    {

                        model:

                            this.currentModel,

                        ...options

                    }

                );

            this.history.push(

                result

            );

            EventBus.emit(

                "upscale:completed",

                result

            );

            Notifications.success(

                "Image upscaled successfully."

            );

            return result;

        }

        catch (

            error

        ) {

            Logger.error(

                "Upscale failed.",

                error

            );

            Notifications.error(

                "Upscale failed."

            );

            return null;

        }

        finally {

            this.running = false;

            Loading.hide();

        }

    }

    historyList() {

        return this.history;

    }

    latest() {

        return this.history.at(

            -1

        ) || null;

    }

    clearHistory() {

        this.history = [];

    }

    isRunning() {

        return this.running;

    }

}

const UpscaleManagerService =

    new UpscaleManager();

window.UpscaleManager =

    UpscaleManagerService;