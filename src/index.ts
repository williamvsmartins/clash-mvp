import 'dotenv/config'
import config from '../config';
import { Client, GatewayIntentBits, Interaction, Message, Partials } from 'discord.js';
import { registerCommands } from './staff/commands';
import { handleButtonInteraction, pendingConfirmations } from './handlers/handleButtonInteraction';
import { handleFormSubmission } from './handlers/handleFormSubmission';
import { embedConf } from './embed/embed-Confirm-Cancel';
import { handlerComandStaff } from './staff/handlerCommand';
import { handleSelectInteraction } from './handlers/handleSelectInteraction';

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
      await handleButtonInteraction(client, interaction);
    } else if (interaction.isModalSubmit()) {
      await handleFormSubmission(client, interaction);
    } else if (interaction.isCommand()){
      handlerComandStaff(client, interaction);
    } else if (interaction.isStringSelectMenu()){
      handleSelectInteraction(client, interaction);
    }
  });

  client.on('messageCreate', async (msg: Message) => {
    const confirmation = pendingConfirmations.get(msg.channel.id);
    if (confirmation) {
      if (msg.author.id === confirmation.user1 || msg.author.id === confirmation.user2) {
        if (msg.content.includes('https://link.clashroyale.com/invite/friend/')) {
          await confirmation.channel.send(embedConf(msg.content, confirmation.price));
          await confirmation.channel.setName(`Aposta confirmada - ${confirmation.channel.id}`);
        }
      }
    }
  });

  
});

client.login(discordToken);
