/*
==========================================================
Easy AI Studio
File    : frontend/js/core/storage.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class StorageManager {

    set(

        key,

        value

    ) {

        localStorage.setItem(

            key,

            JSON.stringify(

                value

            )

        );

    }

    get(

        key,

        defaultValue = null

    ) {

        const value =

            localStorage.getItem(

                key

            );

        if (

            value === null

        ) {

            return defaultValue;

        }

        try {

            return JSON.parse(

                value

            );

        }

        catch {

            return value;

        }

    }

    remove(

        key

    ) {

        localStorage.removeItem(

            key

        );

    }

    clear() {

        localStorage.clear();

    }

    has(

        key

    ) {

        return (

            localStorage.getItem(

                key

            ) !== null

        );

    }

    setSession(

        key,

        value

    ) {

        sessionStorage.setItem(

            key,

            JSON.stringify(

                value

            )

        );

    }

    getSession(

        key,

        defaultValue = null

    ) {

        const value =

            sessionStorage.getItem(

                key

            );

        if (

            value === null

        ) {

            return defaultValue;

        }

        try {

            return JSON.parse(

                value

            );

        }

        catch {

            return value;

        }

    }

    removeSession(

        key

    ) {

        sessionStorage.removeItem(

            key

        );

    }

    clearSession() {

        sessionStorage.clear();

    }

    keys() {

        return Object.keys(

            localStorage

        );

    }

    sessionKeys() {

        return Object.keys(

            sessionStorage

        );

    }

}

const StorageService =

    new StorageManager();

window.Storage =

    StorageService;