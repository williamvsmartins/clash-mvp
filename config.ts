const config = {
  channelId: process.env.CHANNEL_ID || '',
  guildId: process.env.GUILD_ID || '',
  discordToken: process.env.DISCORD_TOKEN,
  clashRoyaleApiToken: process.env.API_TOKEN,
  mongodbUri: process.env.MONGO_URI,
  mercado_pago_token: process.env.MERCADO_PAGO_TOKEN
};

export default config;
