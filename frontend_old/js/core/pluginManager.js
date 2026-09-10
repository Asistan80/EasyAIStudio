/*
==========================================================
Easy AI Studio
File    : frontend/js/core/pluginManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class PluginManager {

    constructor() {

        this.plugins = [];

        this.currentPlugin = null;

    }

    async load() {

        try {

            const response =

                await PluginsAPI.getPlugins();

            this.plugins =

                response.plugins || [];

            return this.plugins;

        }

        catch (error) {

            console.error(

                "Plugin Load Error",

                error

            );

            return [];

        }

    }

    async install(

        data

    ) {

        const plugin =

            await PluginsAPI.install(

                data

            );

        await this.load();

        return plugin;

    }

    async get(

        pluginId

    ) {

        return await PluginsAPI.getPlugin(

            pluginId

        );

    }

    async update(

        pluginId,

        data

    ) {

        const plugin =

            await PluginsAPI.update(

                pluginId,

                data

            );

        await this.load();

        return plugin;

    }

    async uninstall(

        pluginId

    ) {

        await PluginsAPI.uninstall(

            pluginId

        );

        await this.load();

    }

    setCurrent(

        plugin

    ) {

        this.currentPlugin = plugin;

    }

    current() {

        return this.currentPlugin;

    }

    list() {

        return this.plugins;

    }

    count() {

        return this.plugins.length;

    }

    latest() {

        if (

            this.plugins.length === 0

        ) {

            return null;

        }

        return this.plugins[

            this.plugins.length - 1

        ];

    }

    find(

        pluginId

    ) {

        return this.plugins.find(

            plugin =>

                plugin.id === pluginId

        );

    }

    exists(

        pluginId

    ) {

        return (

            this.find(

                pluginId

            ) !== undefined

        );

    }

    clearCurrent() {

        this.currentPlugin = null;

    }

    clear() {

        this.plugins = [];

    }

}

const PluginService =

    new PluginManager();

window.PluginManager =

    PluginService;