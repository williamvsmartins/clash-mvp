import { Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from 'discord.js';
import { User } from './database';
import axios from 'axios';
import config from '../config';

const { clashRoyaleApiToken } = config;

export const setupClashRoyaleForm = (client: Client): void => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() || interaction.customId !== 'add_tag') return;

    const modal = new ModalBuilder()
      .setCustomId('clash_tag_modal')
      .setTitle('Adicionar Tag do Clash Royale');

    const tagInput = new TextInputBuilder()
      .setCustomId('clashTag')
      .setLabel("Sua Tag do Clash Royale")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput);
    modal.addComponents(actionRow);
    await interaction.showModal(modal);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'clash_tag_modal') return;

    const clashTag = interaction.fields.getTextInputValue('clashTag');
    const userId = interaction.user.id;

    try {
      const response = await axios.get(`https://api.clashroyale.com/v1/players/%23${clashTag}`, {
        headers: { 'Authorization': `Bearer ${clashRoyaleApiToken}` },
      });

      await User.updateOne(
        { userId },
        { clashTag },
        { upsert: true },
      );

      await interaction.reply({content: `Tag do Clash Royale ${clashTag} foi validada e salva com sucesso!`, ephemeral: true });
    } catch (error) {
      await interaction.reply(`Falha ao validar a tag do Clash Royale: ${error}`);
    }
  });
};
