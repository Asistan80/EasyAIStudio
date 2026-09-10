/*
==========================================================
Easy AI Studio
File    : frontend/js/api/apiClient.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class ApiClient {

    constructor() {

        this.baseURL = "http://127.0.0.1:8000/api";

        this.timeout = 60000;

        this.defaultHeaders = {

            "Content-Type": "application/json",

            "Accept": "application/json"

        };

    }

    setBaseURL(url) {

        this.baseURL = url.replace(/\/$/, "");

    }

    getBaseURL() {

        return this.baseURL;

    }

    setToken(token) {

        if (!token) {

            delete this.defaultHeaders.Authorization;

            return;

        }

        this.defaultHeaders.Authorization = `Bearer ${token}`;

    }

    async get(endpoint) {

        return this.request(endpoint, {

            method: "GET"

        });

    }

    async post(endpoint, data = {}) {

        return this.request(endpoint, {

            method: "POST",

            body: JSON.stringify(data)

        });

    }

    async put(endpoint, data = {}) {

        return this.request(endpoint, {

            method: "PUT",

            body: JSON.stringify(data)

        });

    }

    async delete(endpoint) {

        return this.request(endpoint, {

            method: "DELETE"

        });

    }

    async upload(endpoint, formData) {

        const headers = {

            ...this.defaultHeaders

        };

        delete headers["Content-Type"];

        return this.request(endpoint, {

            method: "POST",

            headers,

            body: formData

        });

    }

    async request(endpoint, options = {}) {

        const controller = new AbortController();

        const timeout = setTimeout(() => {

            controller.abort();

        }, this.timeout);

        try {

            const response = await fetch(

                this.baseURL + endpoint,

                {

                    ...options,

                    headers: {

                        ...this.defaultHeaders,

                        ...(options.headers || {})

                    },

                    signal: controller.signal

                }

            );

            clearTimeout(timeout);

            let data = null;

            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {

                data = await response.json();

            } else {

                data = await response.text();

            }

            if (!response.ok) {

                throw {

                    status: response.status,

                    message: data?.message || response.statusText,

                    data

                };

            }

            return data;

        }

        catch (error) {

            Logger.error(

                "API Request Failed",

                error

            );

            throw error;

        }

    }

}

const API = new ApiClient();

window.API = API;