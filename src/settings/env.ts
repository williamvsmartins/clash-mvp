import 'dotenv/config';
import { z } from "zod";

export const envSchema = z.object({
    BOT_TOKEN: z.string().min(1, "Discord Bot Token is required"),
    GUILD_ID: z.string().min(1, "Guild ID is required"),

    // MongoDB
    MONGO_URI: z.string().min(1, "MongoDB URI is required"),

    // Clash Royale API
    API_TOKEN: z.string().min(1, "Clash Royale API Token is required"),

    // Mercado Pago
    MERCADO_PAGO_TOKEN: z.string().optional().default(""),

    // Webhook
    WEBHOOK_PORT: z.string().transform(Number).default("3000"),

    // Notion
    NOTION_API_KEY: z.string().optional().default(""),
    DATABASE_ID: z.string().optional().default(""),
    DATABASE_DEPOSIT_ID: z.string().optional().default(""),

    // Discord IDs
    CHANNEL_ID: z.string().optional().default(""),
    CHANNEL_ID_QUEUE: z.string().optional().default(""),
    REGISTERED_ROLE_ID: z.string().optional().default(""),
    SUPORTE_ROLE_ID: z.string().optional().default(""),

    // Settings
    RATE: z.string().transform(Number).default("10"),
});

export type EnvSchema = z.infer<typeof envSchema>;

// Parse e valida as variáveis
const parsed = envSchema.parse(process.env);

// Exporta o env parseado
export const env = parsed;

// Estende o process.env com os valores parseados
Object.assign(process.env, parsed);

// Declaração global para TypeScript
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
            CHANNEL_ID?: string;
            CHANNEL_ID_QUEUE?: string;
            REGISTERED_ROLE_ID?: string;
            SUPORTE_ROLE_ID?: string;
            RATE?: string;
            [key: string]: string | undefined;
        }
    }
}