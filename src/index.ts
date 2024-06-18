import 'dotenv/config'
import config from '../config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { registerCommands } from './commands';
import { setupFixedMessage } from './fixedMessage';
import { setupClashRoyaleForm } from './clashRoyaleForm';

const { discordToken } = config;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once('ready', async () => {
  console.log(`Bot está online como ${client.user!.tag}`);
  await registerCommands(client);
  setupFixedMessage(client);
  setupClashRoyaleForm(client);
});

client.login(discordToken);
