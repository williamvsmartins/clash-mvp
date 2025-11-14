import { bootstrapApp } from "#base";
import { iniciarServidorWebhook } from "./webhook/server.js";
import { inicializarClientDM } from "#functions";

await bootstrapApp({
    workdir: import.meta.dirname,
    whenReady(client) {
        // Inicializa o client para envio de DMs quando o bot estiver pronto
        inicializarClientDM(client);
    }
});

// Inicia o servidor de webhooks
iniciarServidorWebhook();