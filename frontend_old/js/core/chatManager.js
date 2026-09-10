/*
==========================================================
Easy AI Studio
File    : frontend/js/core/chatManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ChatManager {

    constructor() {

        this.messages = [];

        this.provider = "openai";

        this.model = "gpt-5.5";

    }

    async load() {

        try {

            const response =

                await ChatAPI.getHistory();

            this.messages =

                response.history || [];

            return this.messages;

        }

        catch (error) {

            console.error(

                "Chat Load Error",

                error

            );

            return [];

        }

    }

    async send(

        message

    ) {

        Loading.show(

            "AI is thinking..."

        );

        try {

            const response =

                await ChatAPI.sendMessage(

                    this.provider,

                    this.model,

                    message

                );

            await this.load();

            Notifications.success(

                "Message sent successfully."

            );

            return response;

        }

        catch (error) {

            console.error(

                error

            );

            Notifications.error(

                "Message could not be sent."

            );

            return null;

        }

        finally {

            Loading.hide();

        }

    }

    async clear() {

        await ChatAPI.clearHistory();

        this.messages = [];

    }

    setProvider(

        provider

    ) {

        this.provider = provider;

    }

    getProvider() {

        return this.provider;

    }

    setModel(

        model

    ) {

        this.model = model;

    }

    getModel() {

        return this.model;

    }

    list() {

        return this.messages;

    }

    count() {

        return this.messages.length;

    }

    latest() {

        if (

            this.messages.length === 0

        ) {

            return null;

        }

        return this.messages[

            this.messages.length - 1

        ];

    }

}

const ChatService =

    new ChatManager();

window.ChatManager =

    ChatService;