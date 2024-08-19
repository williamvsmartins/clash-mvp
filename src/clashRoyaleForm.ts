import { Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from 'discord.js';
import { User } from './database';
import axios from 'axios';
import config from '../config';

const { clashRoyaleApiToken, registeredRoleId } = config;

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
    
    const pixInput = new TextInputBuilder()
      .setCustomId('pix')
      .setLabel('Sua chave pix')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput);
    const pixRow = new ActionRowBuilder<TextInputBuilder>().addComponents(pixInput);

    modal.addComponents(actionRow, pixRow);
    await interaction.showModal(modal);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'clash_tag_modal') return;

    const clashTag = interaction.fields.getTextInputValue('clashTag');
    const pix = interaction.fields.getTextInputValue('pix');
    const userId = interaction.user.id;
    const guild = interaction.guild;

    try {
      const response = await axios.get(`https://api.clashroyale.com/v1/players/%23${clashTag}`, {
        headers: { 'Authorization': `Bearer ${clashRoyaleApiToken}` },
      });

      await User.updateOne(
        { userId },
        { clashTag, pix },
        { upsert: true },
      );

      await interaction.reply({content: `Tag do Clash Royale ${clashTag} e Pix foi validada e salva com sucesso!`, ephemeral: true });
      const role = guild?.roles.cache.find(r => r.id === registeredRoleId);

      if (role && guild!=null) {
        const member = guild.members.cache.get(userId);
        if (member) {
          await member.roles.add(role);
        }
      }
      
    } catch (error) {
      await interaction.reply({ content: `Falha ao validar a tag do Clash Royale: ${error}`, ephemeral: true });
    }
  });
};
