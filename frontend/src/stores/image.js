import { defineStore } from "pinia";

export const useImageStore = defineStore("image",{

    state:()=>({

        loading:false,

        image:null,

        error:null

    }),

    actions:{

        async generate(service,prompt){

            this.loading=true;

            this.error=null;

            this.image=null;

            try{

                this.image=await service(prompt);

            }

            catch(e){

                this.error=e.message;

            }

            finally{

                this.loading=false;

            }

        }

    }

});