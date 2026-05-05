import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Responder, ResponderType } from '#base';
import { FIELD_META } from '#functions';
import { GuildConfigField } from '#functions';

new Responder({
    customId: 'config/edit/:field',
    type: ResponderType.Button,
    cache: 'cached',
    async run(interaction, params) {
        const field = params?.field as GuildConfigField | undefined;
        if (!field || !(field in FIELD_META)) {
            await interaction.reply({ content: 'Campo inválido.', ephemeral });
            return;
        }

        const meta = FIELD_META[field];

        const modal = new ModalBuilder()
            .setCustomId(`config/modal/${field}`)
            .setTitle(`Editar: ${meta.label}`);

        const input = new TextInputBuilder()
            .setCustomId('value')
            .setLabel(meta.label)
            .setPlaceholder(meta.placeholder)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

        await interaction.showModal(modal);
    },
});
