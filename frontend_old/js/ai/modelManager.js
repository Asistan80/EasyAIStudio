/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/modelManager.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class ModelManager {

    constructor() {

        this.models = [];

        this.currentModel = null;

    }

    async load() {

        try {

            const response =

                await ModelsAPI.getModels();

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

                "Model loading failed.",

                error

            );

            return [];

        }

    }

    list() {

        return this.models;

    }

    count() {

        return this.models.length;

    }

    current() {

        return this.currentModel;

    }

    set(

        modelId

    ) {

        const model =

            this.find(

                modelId

            );

        if (

            !model

        ) {

            return false;

        }

        this.currentModel =

            model;

        EventBus.emit(

            "model:changed",

            model

        );

        return true;

    }

    find(

        modelId

    ) {

        return this.models.find(

            model =>

                model.id === modelId

        );

    }

    exists(

        modelId

    ) {

        return (

            this.find(

                modelId

            ) !== undefined

        );

    }

    async refresh() {

        return await this.load();

    }

    async reload() {

        return await this.load();

    }

    clear() {

        this.models = [];

        this.currentModel = null;

    }

}

const ModelManagerService =

    new ModelManager();

window.ModelManager =

    ModelManagerService;