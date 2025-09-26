import 'dotenv/config'
import { z } from "zod";

const envSchema = z.object({
    // Tokens de API e Autenticação
    BOT_TOKEN: z.string({ description: "Token principal do Bot do Discord" }).min(1),
    DISCORD_TOKEN: z.string({ description: "Token secundário ou alternativo do Discord" }).min(1).optional(),
    API_TOKEN: z.string({ description: "Token para a API do Clash Royale" }).min(1),
    MERCADO_PAGO_TOKEN: z.string({ description: "Token de acesso para a API do Mercado Pago" }).min(1),
    NOTION_API_KEY: z.string({ description: "Chave de API para integração com o Notion" }).min(1),

    // Configurações do MongoDB
    MONGO_URI: z.string({ description: "URI de conexão com o MongoDB" }).min(1),

    // IDs do Discord
    GUILD_ID: z.string({ description: "ID do servidor (Guild) principal" }).min(1),
    CHANNEL_ID: z.string({ description: "ID do canal principal ou geral" }).min(1),
    CHANNEL_ID_QUEUE: z.string({ description: "ID do canal onde as filas são criadas" }).min(1),
    REGISTERED_ROLE_ID: z.string({ description: "ID do cargo para membros registrados" }).min(1),
    SUPORTE_ROLE_ID: z.string({ description: "ID do cargo da equipe de suporte" }).min(1),

    // Outras Configurações
    DATABASE_ID: z.string({ description: "ID do banco de dados no Notion" }).min(1),
    RATE: z.coerce.number({ description: "Taxa ou valor de conversão" }).positive(),
});

type EnvSchema = z.infer<typeof envSchema>;

export { envSchema, type EnvSchema };