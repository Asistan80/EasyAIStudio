/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/controlNetManager.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class ControlNetManager {

    constructor() {

        this.models = [];

        this.activeModel = null;

        this.enabled = false;

    }

    async load() {

        try {

            const response =

                await ControlNetAPI.getModels();

            this.models =

                response.models || [];

            return this.models;

        }

        catch (

            error

        ) {

            Logger.error(

                "ControlNet loading failed.",

                error

            );

            return [];

        }

    }

    list() {

        return this.models;

    }

    find(

        modelId

    ) {

        return this.models.find(

            model =>

                model.id === modelId

        );

    }

    select(

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

        this.activeModel =

            model;

        EventBus.emit(

            "controlnet:selected",

            model

        );

        return true;

    }

    current() {

        return this.activeModel;

    }

    enable() {

        this.enabled = true;

        EventBus.emit(

            "controlnet:enabled",

            this.activeModel

        );

    }

    disable() {

        this.enabled = false;

        EventBus.emit(

            "controlnet:disabled"

        );

    }

    isEnabled() {

        return this.enabled;

    }

    async refresh() {

        return await this.load();

    }

    clear() {

        this.models = [];

        this.activeModel = null;

        this.enabled = false;

    }

}

const ControlNetManagerService =

    new ControlNetManager();

window.ControlNetManager =

    ControlNetManagerService;