import { TextChannel, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from 'discord.js';
import config from '../../config';
import { Guild } from '../db/database';
import * as fs from 'fs';

const { channelId } = config;

export const setupFixedMessagePix = async (client: Client, interaction: Interaction): Promise<void> => {

  if (!interaction.isCommand() || interaction.commandName !== 'pix') return;

  const channel = await client.channels.fetch(channelId);
  if (!channel || !(channel instanceof TextChannel)) return;

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('pix')
        .setLabel('Gerar Pix')
        .setStyle(ButtonStyle.Primary),
    );
  

  const sentMessage = await channel.send({ content: 'Clique no botão abaixo para gerar seu pixs:', components: [row] });
  const fixedMessageId = sentMessage.id;
  fs.writeFileSync('./src/config.ts', `const config = ${JSON.stringify(config, null, 2)};\nexport default config;`);

  // Salvar o ID da mensagem fixa no banco de dados
  await saveFixedMessageId('1270457032406859917', fixedMessageId);

  await interaction.reply({ content: 'Mensagem fixa enviada com sucesso!', ephemeral: true });

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
