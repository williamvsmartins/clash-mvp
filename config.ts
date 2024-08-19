const config = {
  channelId: process.env.CHANNEL_ID || '',
  registeredRoleId: process.env.REGISTERED_ROLE_ID ||'',
  channelIdQueue: process.env.CHANNEL_ID_QUEUE || '',
  guildId: process.env.GUILD_ID || '',
  discordToken: process.env.DISCORD_TOKEN,
  clashRoyaleApiToken: process.env.API_TOKEN,
  mongodbUri: process.env.MONGO_URI,
  mercado_pago_token: process.env.MERCADO_PAGO_TOKEN,
  notion_api_key: process.env.NOTION_API_KEY || '',
  database_id: process.env.DATABASE_ID || '',
};

export default config;
