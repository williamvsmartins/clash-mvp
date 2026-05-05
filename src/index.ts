import { bootstrapApp } from "#base";
import { iniciarServidorWebhook } from "./webhook/server.js";
import { inicializarClientDM } from "#functions";
import { env } from "#settings";

await bootstrapApp({
    workdir: import.meta.dirname,
    commands: {
        guilds: env.GUILD_ID ? [env.GUILD_ID] : undefined,
    },
    whenReady(client) {
        inicializarClientDM(client);
    }
});

iniciarServidorWebhook();
