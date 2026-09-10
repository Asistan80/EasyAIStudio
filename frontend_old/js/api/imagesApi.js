/*
==========================================================
Easy AI Studio
File    : frontend/js/api/imagesApi.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class ImagesApi {

    constructor(api) {

        this.api = api;

        this.endpoint = "/images";

    }

    /**
     * Yeni görsel oluştur
     */
    async generate(payload) {

        return await this.api.post(

            `${this.endpoint}/generate`,

            payload

        );

    }

    /**
     * Üretimi iptal et
     */
    async cancel(jobId) {

        return await this.api.post(

            `${this.endpoint}/cancel`,

            {

                jobId

            }

        );

    }

    /**
     * Geçmiş üretimleri getir
     */
    async history() {

        return await this.api.get(

            `${this.endpoint}/history`

        );

    }

    /**
     * Tek görsel getir
     */
    async get(imageId) {

        return await this.api.get(

            `${this.endpoint}/${imageId}`

        );

    }

    /**
     * Görsel sil
     */
    async delete(imageId) {

        return await this.api.delete(

            `${this.endpoint}/${imageId}`

        );

    }

    /**
     * Favoriye ekle
     */
    async favorite(imageId) {

        return await this.api.post(

            `${this.endpoint}/${imageId}/favorite`

        );

    }

    /**
     * Favoriden çıkar
     */
    async unfavorite(imageId) {

        return await this.api.delete(

            `${this.endpoint}/${imageId}/favorite`

        );

    }

    /**
     * Metadata getir
     */
    async metadata(imageId) {

        return await this.api.get(

            `${this.endpoint}/${imageId}/metadata`

        );

    }

    /**
     * PNG indir
     */
    download(imageId) {

        window.open(

            API.getBaseURL() +

            `${this.endpoint}/${imageId}/download`,

            "_blank"

        );

    }

}

const ImagesAPI =

    new ImagesApi(API);

window.ImagesAPI =

    ImagesAPI;