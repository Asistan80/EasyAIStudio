/*
==========================================================
Easy AI Studio
File    : frontend/js/api/chatApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ChatAPI {

    async getHistory() {

        return await API.get(

            "/chat"

        );

    }

    async sendMessage(

        provider,

        model,

        message

    ) {

        return await API.post(

            "/chat",

            {

                provider,

                model,

                message

            }

        );

    }

    async clearHistory() {

        return await API.delete(

            "/chat"

        );

    }

    async lastMessage() {

        const history = await this.getHistory();

        if (

            history.history &&

            history.history.length > 0

        ) {

            return history.history[

                history.history.length - 1

            ];

        }

        return null;

    }

}

const ChatService = new ChatAPI();

window.ChatAPI = ChatService;