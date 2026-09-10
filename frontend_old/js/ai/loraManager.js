/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/loraManager.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class LoRAManager {

    constructor() {

        this.models = [];

        this.activeModels = [];

    }

    async load() {

        try {

            const response =

                await LoRAAPI.getModels();

            this.models =

                response.models || [];

            return this.models;

        }

        catch (

            error

        ) {

            Logger.error(

                "LoRA loading failed.",

                error

            );

            return [];

        }

    }

    list() {

        return this.models;

    }

    active() {

        return this.activeModels;

    }

    enable(

        modelId,

        weight = 1.0

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

        if (

            this.isEnabled(

                modelId

            )

        ) {

            return true;

        }

        this.activeModels.push({

            id: model.id,

            name: model.name,

            weight

        });

        EventBus.emit(

            "lora:enabled",

            model

        );

        return true;

    }

    disable(

        modelId

    ) {

        this.activeModels =

            this.activeModels.filter(

                item =>

                    item.id !== modelId

            );

        EventBus.emit(

            "lora:disabled",

            modelId

        );

    }

    setWeight(

        modelId,

        weight

    ) {

        const model =

            this.activeModels.find(

                item =>

                    item.id === modelId

            );

        if (

            !model

        ) {

            return false;

        }

        model.weight =

            weight;

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

    isEnabled(

        modelId

    ) {

        return this.activeModels.some(

            model =>

                model.id === modelId

        );

    }

    clear() {

        this.activeModels = [];

    }

}

const LoRAManagerService =

    new LoRAManager();

window.LoRAManager =

    LoRAManagerService;