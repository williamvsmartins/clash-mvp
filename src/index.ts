import 'dotenv/config'
import config from '../config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { registerCommands } from './commands';
import { setupFixedMessage } from './staff/fixedMessage';
import { setupClashRoyaleForm } from './clashRoyaleForm';
import { setupFixedMessagePix } from './fixed-message-pix';
import { setupFixedMessageQueue } from './staff/fixed-message-queue';
import { setupQueueManager } from './queueManager';
import { setupFixedMessageWalle } from './staff/fixed-message-wallet';
import { buttonsWallet } from './buttons-wallet';

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
  setupFixedMessageWalle(client);
  setupFixedMessageQueue(client)

  setupClashRoyaleForm(client);
  setupQueueManager(client)
  buttonsWallet(client);

});

client.login(discordToken);
