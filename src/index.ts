import 'dotenv/config'
import config from '../config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { registerCommands } from './commands';
import { setupFixedMessage } from './fixedMessage';
import { setupClashRoyaleForm } from './clashRoyaleForm';
import { setupFixedMessagePix } from './fixed-message-pix';
import { setupPixGenerate } from './pix-generate';
import { setupFixedMessageQueue } from './fixed-message-queue';
import { setupQueueManager } from './queueManager';

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
  setupFixedMessagePix(client);
  setupFixedMessageQueue(client)

  setupClashRoyaleForm(client);
	setupPixGenerate(client);
  setupQueueManager(client)
});

client.login(discordToken);
