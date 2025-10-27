import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { Responder, ResponderType } from '#base';

new Responder({
    customId: 'add_tag',
    type: ResponderType.Button,
    cache: 'cached',
    async run(interaction) {
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
    }
});