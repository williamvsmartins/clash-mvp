import { Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, Interaction } from 'discord.js';

export const setupClashRoyaleForm = async (client: Client, interaction: Interaction) => {

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
};
