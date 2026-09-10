/*
==========================================================
Easy AI Studio
File    : frontend/js/api/api.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class API {

    constructor() {

        this.baseURL = "http://127.0.0.1:8000/api";

    }

    async request(

        endpoint,

        options = {}

    ) {

        const response = await fetch(

            this.baseURL + endpoint,

            {

                headers: {

                    "Content-Type": "application/json"

                },

                ...options

            }

        );

        if (!response.ok) {

            throw new Error(

                "API Error : " +

                response.status

            );

        }

        return await response.json();

    }

    get(endpoint) {

        return this.request(

            endpoint

        );

    }

    post(

        endpoint,

        data

    ) {

        return this.request(

            endpoint,

            {

                method: "POST",

                body: JSON.stringify(data)

            }

        );

    }

    put(

        endpoint,

        data

    ) {

        return this.request(

            endpoint,

            {

                method: "PUT",

                body: JSON.stringify(data)

            }

        );

    }

    delete(endpoint) {

        return this.request(

            endpoint,

            {

                method: "DELETE"

            }

        );

    }

}

const api = new API();

window.API = api;