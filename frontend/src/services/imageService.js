import { generateImage } from "../api/images";

export async function createImage(prompt){

    return await generateImage({

        prompt,

        negative_prompt:"",

        width:1024,

        height:1024,

        steps:30,

        cfg:7.5,

        seed:-1

    });

}