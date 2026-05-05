import { Responder, ResponderType } from '#base';
import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import { User, ActiveMatch } from '#database';
import { getClashPlayer } from '#functions';

new Responder({
    customId: 'add_tag',
    type: ResponderType.Button, cache: 'cached',
    async run(interaction) {
        const userId = interaction.user.id;

        const existing = await User.findOne({ userId });

        if (existing?.clashTag) {
            await interaction.deferReply({ ephemeral });

            let playerInfo: Record<string, unknown> | null = null;
            try {
                playerInfo = await getClashPlayer(existing.clashTag);
            } catch {
                // API indisponível — mostra só a tag
            }

            const name = playerInfo?.name as string | undefined;
            const trophies = playerInfo?.trophies as number | undefined;
            const expLevel = playerInfo?.expLevel as number | undefined;
            const arena = (playerInfo?.arena as { name?: string } | undefined)?.name;
            const clan = (playerInfo?.clan as { name?: string } | undefined)?.name;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🏆 Sua conta vinculada')
                .addFields(
                    { name: 'Jogador', value: name ? `**${name}** (#${existing.clashTag})` : `#${existing.clashTag}`, inline: false },
                    { name: 'Nível', value: expLevel != null ? String(expLevel) : '—', inline: true },
                    { name: 'Troféus', value: trophies != null ? `🏆 ${trophies.toLocaleString('pt-BR')}` : '—', inline: true },
                    { name: 'Arena', value: arena ?? '—', inline: true },
                    { name: 'Clã', value: clan ?? 'Sem clã', inline: true },
                )
                .setFooter({ text: 'Clique em "Alterar tag" para vincular outra conta.' });

            const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('alterar_tag')
                    .setLabel('Alterar tag')
                    .setStyle(ButtonStyle.Secondary),
            );

            await interaction.editReply({ embeds: [embed], components: [button] });
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
    customId: 'alterar_tag',
    type: ResponderType.Button, cache: 'cached',
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('clash_tag_modal')
            .setTitle('Alterar Tag do Clash Royale');

        const tagInput = new TextInputBuilder()
            .setCustomId('clashTag')
            .setLabel('Nova tag do Clash Royale')
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
            const fmt = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
            const channelLink = `<#${partidaAtiva.channelId}>`;

            await interaction.editReply({
                content: [
                    '❌ | Você possui uma partida em andamento — a tag não pode ser alterada agora.',
                    ``,
                    `**Canal:** ${channelLink}`,
                    `**Valor:** ${fmt(partidaAtiva.price)}`,
                    `**Adversário:** <@${partidaAtiva.player1UserId === userId ? partidaAtiva.player2UserId : partidaAtiva.player1UserId}>`,
                    ``,
                    `Acesse o canal acima para finalizar ou cancelar a partida.`,
                ].join('\n'),
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
