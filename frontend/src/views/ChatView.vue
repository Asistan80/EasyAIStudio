<script setup>
import { ref } from "vue";
import axios from "axios";

const provider = ref("Ollama");
const model = ref("llama3");

const message = ref("");

const loading = ref(false);

const messages = ref([]);

async function sendMessage() {

    if (!message.value.trim()) return;

    const userMessage = message.value;

    messages.value.push({

        role: "user",

        content: userMessage

    });

    message.value = "";

    loading.value = true;

    try {

        const response = await axios.post(

            "http://127.0.0.1:8000/api/chat/",

            {

                provider: provider.value,

                model: model.value,

                message: userMessage

            }

        );

        messages.value.push({

            role: "assistant",

            content: response.data.response.content

        });

    } catch (error) {

        messages.value.push({

            role: "assistant",

            content: "Connection error."

        });

    }

    loading.value = false;

}
</script>

<template>

<div class="chat-page">

    <div class="chat-header">

        <h2>AI Chat</h2>

        <span>{{ provider }} / {{ model }}</span>

    </div>

    <div class="chat-messages">

        <div

            v-for="(msg,index) in messages"

            :key="index"

            :class="['bubble',msg.role]"

        >

            {{ msg.content }}

        </div>

    </div>

    <div class="chat-input">

        <input

            v-model="message"

            placeholder="Type a message..."

            @keyup.enter="sendMessage"

        />

        <button

            @click="sendMessage"

            :disabled="loading"

        >

            {{ loading ? "..." : "Send" }}

        </button>

    </div>

</div>

</template>

<style scoped>

.chat-page{

display:flex;

flex-direction:column;

height:100%;

background:#1b2230;

}

.chat-header{

padding:20px;

border-bottom:1px solid #2d3648;

display:flex;

justify-content:space-between;

align-items:center;

}

.chat-header h2{

margin:0;

}

.chat-messages{

flex:1;

overflow:auto;

padding:20px;

display:flex;

flex-direction:column;

gap:14px;

}

.bubble{

max-width:70%;

padding:14px;

border-radius:14px;

white-space:pre-wrap;

}

.user{

align-self:flex-end;

background:#356df3;

}

.assistant{

align-self:flex-start;

background:#2d3648;

}

.chat-input{

display:flex;

gap:10px;

padding:20px;

border-top:1px solid #2d3648;

}

.chat-input input{

flex:1;

padding:14px;

background:#111827;

color:white;

border:none;

border-radius:10px;

}

.chat-input button{

padding:14px 22px;

border:none;

border-radius:10px;

cursor:pointer;

background:#356df3;

color:white;

}

</style>