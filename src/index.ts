import 'dotenv/config'
import config from '../config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { registerCommands } from './commands';
import { setupFixedMessage } from './fixedMessage';
import { setupClashRoyaleForm } from './clashRoyaleForm';
import { setupFixedMessagePix } from './fixed-message-pix';
import { setupPixGenerate } from './pix-generate';

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
	setupFixedMessagePix(client);
	setupPixGenerate(client);
});

client.login(discordToken);
