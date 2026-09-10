/* ==========================================================
   Easy AI Studio
   File: frontend/js/api.js
   Version: 1.0.0
   Sprint: 4 - Core
   ========================================================== */

"use strict";

/* ==========================================================
   API Manager
   ========================================================== */

const API = {

    baseURL: "",

    timeout: 30000,

    headers: {

        "Content-Type": "application/json"

    },

    /* ======================================================
       Initialize
       ====================================================== */

    init(config = {}) {

        if (config.baseURL) {

            this.baseURL = config.baseURL;

        }

        if (config.timeout) {

            this.timeout = config.timeout;

        }

        console.log("API Ready");

    },

    /* ======================================================
       Request
       ====================================================== */

    async request(url, options = {}) {

        const controller = new AbortController();

        const timer = setTimeout(() => {

            controller.abort();

        }, this.timeout);

        try {

            const response = await fetch(

                this.baseURL + url,

                {

                    ...options,

                    headers: {

                        ...this.headers,

                        ...(options.headers || {})

                    },

                    signal: controller.signal

                }

            );

            clearTimeout(timer);

            if (!response.ok) {

                throw new Error(

                    response.status

                );

            }

            const type =

                response.headers.get(

                    "content-type"

                );

            if (

                type &&

                type.includes(

                    "application/json"

                )

            ) {

                return await response.json();

            }

            return await response.text();

        }

        catch (error) {

            clearTimeout(timer);

            console.error(

                "API Error:",

                error

            );

            throw error;

        }

    },

    /* ======================================================
       GET
       ====================================================== */

    get(url) {

        return this.request(

            url,

            {

                method: "GET"

            }

        );

    },

    /* ======================================================
       POST
       ====================================================== */

    post(url, data = {}) {

        return this.request(

            url,

            {

                method: "POST",

                body: JSON.stringify(data)

            }

        );

    },

    /* ======================================================
       PUT
       ====================================================== */

    put(url, data = {}) {

        return this.request(

            url,

            {

                method: "PUT",

                body: JSON.stringify(data)

            }

        );

    },

    /* ======================================================
       DELETE
       ====================================================== */

    delete(url) {

        return this.request(

            url,

            {

                method: "DELETE"

            }

        );

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.API = API;