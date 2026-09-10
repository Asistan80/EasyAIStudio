import api from "./client";

export async function generateImage(data){

    const response = await api.post("/api/images/generate", data);

    return response.data;

}