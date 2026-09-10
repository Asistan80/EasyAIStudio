/*
==========================================================
Easy AI Studio
File    : frontend/js/api/providersApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ProvidersAPI {

    async getProviders() {

        return await API.get(

            "/providers"

        );

    }

    async getProvider(

        providerId

    ) {

        return await API.get(

            "/providers/" +

            providerId

        );

    }

    async getDefaultProvider() {

        return await API.get(

            "/providers/default/current"

        );

    }

    async exists(

        providerId

    ) {

        try {

            const provider = await this.getProvider(

                providerId

            );

            return provider.success !== false;

        }

        catch {

            return false;

        }

    }

}

const ProvidersService = new ProvidersAPI();

window.ProvidersAPI = ProvidersService;