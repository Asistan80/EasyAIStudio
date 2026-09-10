/*
==========================================================
Easy AI Studio
File    : frontend/js/api/pluginsApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class PluginsAPI {

    async getPlugins() {

        return await API.get(

            "/plugins"

        );

    }

    async getPlugin(

        pluginId

    ) {

        return await API.get(

            "/plugins/" +

            pluginId

        );

    }

    async install(

        data

    ) {

        return await API.post(

            "/plugins",

            data

        );

    }

    async update(

        pluginId,

        data

    ) {

        return await API.put(

            "/plugins/" +

            pluginId,

            data

        );

    }

    async uninstall(

        pluginId

    ) {

        return await API.delete(

            "/plugins/" +

            pluginId

        );

    }

}

const PluginsService = new PluginsAPI();

window.PluginsAPI = PluginsService;