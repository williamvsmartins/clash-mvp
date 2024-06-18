import { TextChannel, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../config';
import { Guild } from './database';
import * as fs from 'fs';

const { channelId } = config;

export const setupFixedMessage = async (client: Client): Promise<void> => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'sendfixmessage') return;

    const channel = await client.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) return;

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('add_tag')
          .setLabel('Adicionar Tag do Clash Royale')
          .setStyle(ButtonStyle.Primary),
      );

    const sentMessage = await channel.send({ content: 'Clique no botão abaixo para adicionar sua tag do Clash Royale:', components: [row] });
    const fixedMessageId = sentMessage.id;
    fs.writeFileSync('./src/config.ts', `const config = ${JSON.stringify(config, null, 2)};\nexport default config;`);

    // Salvar o ID da mensagem fixa no banco de dados
    await saveFixedMessageId(config.guildId, fixedMessageId);

    await interaction.reply({ content: 'Mensagem fixa enviada com sucesso!', ephemeral: true });
  });
};

async function saveFixedMessageId(guildId: string, fixedMessageId: string): Promise<void> {
  try {
    const existingGuild = await Guild.findOne({ guildId });

    if (existingGuild) {
      existingGuild.fixedMessageId = fixedMessageId;
      await existingGuild.save();
    } else {
      await Guild.create({
        guildId,
        fixedMessageId,
      });
    }
  } catch (error) {
    console.error('Erro ao salvar o ID da mensagem fixa:', error);
  }
}
