import 'dotenv/config';
import { z } from "zod";

export const envSchema = z.object({
    BOT_TOKEN: z.string().min(1, "Discord Bot Token is required"),
    GUILD_ID: z.string().optional().default(""),

    // MongoDB
    MONGO_URI: z.string().min(1, "MongoDB URI is required"),

    // Clash Royale API
    API_TOKEN: z.string().min(1, "Clash Royale API Token is required"),

    // Mercado Pago
    MERCADO_PAGO_TOKEN: z.string().optional().default(""),

    // Webhook
    WEBHOOK_PORT: z.string().transform(Number).default("3000"),

    // Notion (credenciais de API externa — audit trail financeiro)
    NOTION_API_KEY: z.string().optional().default(""),
    DATABASE_ID: z.string().optional().default(""),
    DATABASE_DEPOSIT_ID: z.string().optional().default(""),
});

export type EnvSchema = z.infer<typeof envSchema>;

const parsed = envSchema.parse(process.env);

export const env = parsed;

Object.assign(process.env, parsed);

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN?: string;
            GUILD_ID?: string;
            MONGO_URI?: string;
            API_TOKEN?: string;
            MERCADO_PAGO_TOKEN?: string;
            WEBHOOK_PORT?: string;
            NOTION_API_KEY?: string;
            DATABASE_ID?: string;
            DATABASE_DEPOSIT_ID?: string;
            [key: string]: string | undefined;
        }
    }
}
