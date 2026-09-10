/*
==========================================================
Easy AI Studio
File    : frontend/js/core/fileManager.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class FileManager {

    constructor() {

        this.files = [];

    }

    async load() {

        try {

            const response = await API.get(

                "/files"

            );

            this.files =

                response.files || [];

            return this.files;

        }

        catch (error) {

            console.error(

                "File Load Error",

                error

            );

            return [];

        }

    }

    async get(

        fileId

    ) {

        return await API.get(

            "/files/" +

            fileId

        );

    }

    async upload(

        data

    ) {

        return await API.post(

            "/files",

            data

        );

    }

    async update(

        fileId,

        data

    ) {

        return await API.put(

            "/files/" +

            fileId,

            data

        );

    }

    async delete(

        fileId

    ) {

        return await API.delete(

            "/files/" +

            fileId

        );

    }

    list() {

        return this.files;

    }

    count() {

        return this.files.length;

    }

    find(

        fileId

    ) {

        return this.files.find(

            file =>

                file.id === fileId

        );

    }

    exists(

        fileId

    ) {

        return (

            this.find(

                fileId

            ) !== undefined

        );

    }

    clear() {

        this.files = [];

    }

}

const FileService =

    new FileManager();

window.FileManager =

    FileService;