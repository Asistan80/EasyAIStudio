/* ==========================================================
   Easy AI Studio
   File: frontend/js/chatView.js
   Version: 1.0.0
   Sprint: 9 - Chat Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Chat View
   ========================================================== */

const ChatView = {

    initialized: false,

    messages: [],

    currentModel: null,


    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.bindEvents();


        this.loadModels();


        console.log(

            "Chat View Ready"

        );


    },



    /* ======================================================
       Bind Events
       ====================================================== */

    bindEvents() {



        const sendButton =

            document.getElementById(

                "send-message"

            );



        const input =

            document.getElementById(

                "chat-input"

            );



        if (sendButton) {


            sendButton.onclick = () => {


                this.send();


            };


        }



        if (input) {


            input.addEventListener(

                "keydown",

                event => {


                    if (

                        event.key ===

                        "Enter"

                        &&

                        !event.shiftKey

                    ) {


                        event.preventDefault();


                        this.send();


                    }


                }

            );


        }





        const newChat =

            document.getElementById(

                "new-chat"

            );



        if (newChat) {


            newChat.onclick = () => {


                this.clear();


            };


        }



    },



    /* ======================================================
       Load Models
       ====================================================== */

    loadModels() {


        const select =

            document.getElementById(

                "chat-model"

            );



        if (

            !select

        ) {

            return;

        }



        if (

            typeof ModelManager !==

            "undefined"

        ) {



            ModelManager.all()

                .forEach(

                    model => {


                        const option =

                            document.createElement(

                                "option"

                            );


                        option.value =

                            model.id;


                        option.textContent =

                            model.name;



                        select.appendChild(

                            option

                        );


                    }

                );



        }


    },



    /* ======================================================
       Send Message
       ====================================================== */

    send() {


        const input =

            document.getElementById(

                "chat-input"

            );



        if (

            !input ||

            !input.value.trim()

        ) {

            return;

        }



        const text =

            input.value.trim();



        this.addMessage(

            "user",

            text

        );



        input.value = "";



        this.askAI(

            text

        );


    },



    /* ======================================================
       Ask AI
       ====================================================== */

    askAI(text) {



        setTimeout(

            () => {


                this.addMessage(

                    "assistant",

                    "AI cevabı hazırlanıyor: " + text

                );



            },

            500

        );



    },



    /* ======================================================
       Add Message
       ====================================================== */

    addMessage(role, content) {


        this.messages.push({

            role,

            content,

            time:

                new Date()

        });



        const container =

            document.getElementById(

                "chat-messages"

            );



        if (

            !container

        ) {

            return;

        }



        const message =

            document.createElement(

                "div"

            );



        message.className =

            "message " + role;



        message.innerText =

            content;



        container.appendChild(

            message

        );



        container.scrollTop =

            container.scrollHeight;


    },



    /* ======================================================
       Clear Chat
       ====================================================== */

    clear() {


        this.messages = [];


        const container =

            document.getElementById(

                "chat-messages"

            );


        if (container) {


            container.innerHTML = "";


        }


    }

};


/* ==========================================================
   Global
   ========================================================== */

window.ChatView = ChatView;