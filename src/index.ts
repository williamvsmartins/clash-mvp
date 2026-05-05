import { bootstrapApp } from "#base";
import { startWebhookServer } from "./webhook/server.js";
import { initDmClient } from "#functions";
import { env } from "#settings";

await bootstrapApp({
    workdir: import.meta.dirname,
    commands: {
        guilds: env.GUILD_ID ? [env.GUILD_ID] : undefined,
    },
    whenReady(client) {
        initDmClient(client);
    }
});

startWebhookServer();
