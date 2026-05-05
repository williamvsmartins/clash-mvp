import { Responder, ResponderType } from '#base';
import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} from 'discord.js';
import { User, ActiveMatch } from '#database';
import { getClashPlayer } from 'functions/clash-royale/getPlayer.js';

new Responder({
    customId: 'add_tag',
    type: ResponderType.Button, cache: 'cached',
    async run(interaction) {
        const userId = interaction.user.id;

        const existing = await User.findOne({ userId });

        if (existing?.clashTag) {
            const modal = new ModalBuilder()
                .setCustomId('clash_tag_modal')
                .setTitle('Alterar Tag do Clash Royale');

            const tagInput = new TextInputBuilder()
                .setCustomId('clashTag')
                .setLabel(`Tag atual: #${existing.clashTag}`)
                .setPlaceholder('Digite a nova tag (ex: #QV980G)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput));
            await interaction.showModal(modal);
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('clash_tag_modal')
            .setTitle('Adicionar Tag do Clash Royale');

        const tagInput = new TextInputBuilder()
            .setCustomId('clashTag')
            .setLabel('Sua Tag do Clash Royale')
            .setPlaceholder('#QV980G')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput));
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

        // Bloquear alteração de tag com partida ativa
        const partidaAtiva = await ActiveMatch.findOne({
            $or: [{ player1UserId: userId }, { player2UserId: userId }],
            status: { $in: ['confirmed', 'in_progress'] },
        });

        if (partidaAtiva) {
            await interaction.editReply({
                content: '❌ | Você possui uma partida em andamento. Não é possível alterar sua tag agora.',
            });
            return;
        }

        // Verificar se a tag já está em uso por outro usuário
        const tagEmUso = await User.findOne({ clashTag, userId: { $ne: userId } });
        if (tagEmUso) {
            await interaction.editReply({
                content: `❌ | A tag **#${clashTag}** já está vinculada a outra conta.`,
            });
            return;
        }

        try {
            await getClashPlayer(clashTag);

            // Preserva o saldo — nunca sobrescreve moedas
            await User.updateOne(
                { userId },
                { $set: { clashTag } },
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
                content: `✅ | Tag **#${clashTag}** validada e vinculada com sucesso!`,
            });

        } catch {
            await interaction.editReply({
                content: `❌ | Não foi possível encontrar o jogador com a tag **#${clashTag}**. Verifique se digitou corretamente.`,
            });
        }
    },
});
