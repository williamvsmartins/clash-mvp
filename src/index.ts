import 'dotenv/config'
import config from '../config';
import { Client, GatewayIntentBits, Interaction, Message, Partials } from 'discord.js';
import { registerCommands } from './commands';
import { handleButtonInteraction, pendingConfirmations } from './handlers/handleButtonInteraction';
import { handleFormSubmission } from './handlers/handleFormSubmission';
import { embedConf } from './embed-Confirm-Cancel';

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
  
   client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isButton()) {
      console.log('botao')
      await handleButtonInteraction(client, interaction);
    } else if (interaction.isModalSubmit()) {
      console.log('modal')
      await handleFormSubmission(client, interaction);
    }
  });

  client.on('messageCreate', async (msg: Message) => {
    const confirmation = pendingConfirmations.get(msg.channel.id);
    if (confirmation) {
      if (msg.author.id === confirmation.user1 || msg.author.id === confirmation.user2) {
        if (msg.content.includes('https://link.clashroyale.com/invite/friend/')) {
          await confirmation.channel.send(embedConf(msg.content));
          await confirmation.channel.setName(`Aposta confirmada - ${confirmation.channel.id}`);
        }
      }
    }
  });

  
});

client.login(discordToken);
