/*
==========================================================
Easy AI Studio
File    : frontend/js/api/modelsApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ModelsAPI {

    async getAllModels() {

        return await API.get(

            "/models"

        );

    }

    async getModels(

        provider

    ) {

        return await API.get(

            "/models/" +

            provider

        );

    }

    async getModel(

        provider,

        modelId

    ) {

        return await API.get(

            "/models/" +

            provider +

            "/" +

            modelId

        );

    }

    async exists(

        provider,

        modelId

    ) {

        try {

            const model = await this.getModel(

                provider,

                modelId

            );

            return model.success !== false;

        }

        catch {

            return false;

        }

    }

}

const ModelsService = new ModelsAPI();

window.ModelsAPI = ModelsService;