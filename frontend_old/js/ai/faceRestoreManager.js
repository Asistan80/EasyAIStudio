/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/faceRestoreManager.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class FaceRestoreManager {

    constructor() {

        this.models = [];

        this.currentModel = null;

        this.processing = false;

        this.history = [];

    }

    async load() {

        try {

            const response =

                await FaceRestoreAPI.getModels();

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

                "Face Restore models could not be loaded.",

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

            "faceRestore:modelChanged",

            model

        );

        return true;

    }

    current() {

        return this.currentModel;

    }

    async restore(

        imageId,

        options = {}

    ) {

        if (

            this.processing

        ) {

            return null;

        }

        this.processing = true;

        Loading.show(

            "Restoring face..."

        );

        try {

            const result =

                await FaceRestoreAPI.restore(

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

                "faceRestore:completed",

                result

            );

            Notifications.success(

                "Face restoration completed."

            );

            return result;

        }

        catch (

            error

        ) {

            Logger.error(

                "Face restoration failed.",

                error

            );

            Notifications.error(

                "Face restoration failed."

            );

            return null;

        }

        finally {

            this.processing = false;

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

    isProcessing() {

        return this.processing;

    }

}

const FaceRestoreManagerService =

    new FaceRestoreManager();

window.FaceRestoreManager =

    FaceRestoreManagerService;