import { Responder, ResponderType } from '#base';
import { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
} from 'discord.js';
import { User } from '#database';
import { getClashPlayer } from 'functions/clash-royale/getPlayer.js';

new Responder({
    customId: 'add_tag',
    type: ResponderType.Button, cache: 'cached',
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('clash_tag_modal')
            .setTitle('Adicionar Tag do Clash Royale');

        const tagInput = new TextInputBuilder()
            .setCustomId('clashTag')
            .setLabel("Sua Tag do Clash Royale")
            .setPlaceholder("#QV980G")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    },
});

new Responder({
    customId: 'clash_tag_modal',
    type: ResponderType.Modal, cache: 'cached',
    async run(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let clashTag = interaction.fields.getTextInputValue('clashTag');
        const userId = interaction.user.id;
        if (clashTag.startsWith('#')) {
            clashTag = clashTag.slice(1);
        }
        clashTag = clashTag.toUpperCase();

        try {
            await getClashPlayer(clashTag);
            
            await User.updateOne(
                { userId },
                { clashTag, moedas: 0.0 },
                { upsert: true }
            );

            const registeredRoleId = process.env.REGISTERED_ROLE_ID;
            if (registeredRoleId) {
                const member = interaction.member;
                if (member && !member.roles.cache.has(registeredRoleId)) {
                     await member.roles.add(registeredRoleId).catch(() => null);
                }
            }

            await interaction.editReply({
                content: `✅ | Tag **#${clashTag}** validada e vinculada com sucesso!`
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: `❌ | Não foi possível encontrar o jogador com a tag **#${clashTag}**. Verifique se digitou corretamente.`
            });
        }
    },
});