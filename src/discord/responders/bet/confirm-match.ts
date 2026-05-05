import { Responder, ResponderType } from "#base";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextChannel } from "discord.js";
import { Confirmation, User, PendingMatch } from "#database";
import { descontoPartida, estornoPartida, createActiveMatch, getMoney } from "#functions";
import { matchData } from "./queue.js";

const confirmations = new Map<string, Set<string>>();

new Responder({
    customId: "bet/match/accept",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        const channel = interaction.channel as TextChannel;
        const userId = interaction.user.id;
        const channelId = channel.id;

        const match = matchData.get(channelId);

        if (!match) {
            console.error(`❌ Dados da partida não encontrados para o canal: ${channelId}`);

            await interaction.reply({
                content: '❌ Erro: Dados da partida não encontrados! O canal pode ter expirado.',
                ephemeral: true
            });
            return;
        }

        const { user1, user2, price: priceInCents } = match;

        if (isNaN(priceInCents) || priceInCents <= 0) {
            console.error(`❌ Preço inválido: ${priceInCents}`);

            await interaction.reply({
                content: '❌ Erro: Valor da aposta inválido!',
                ephemeral: true
            });
            return;
        }

        if (userId !== user1 && userId !== user2) {
            await interaction.reply({
                content: '❌ Você não é um dos jogadores desta partida!',
                ephemeral: true
            });
            return;
        }

        if (!confirmations.has(channelId)) {
            confirmations.set(channelId, new Set());
        }

        const channelConfirmations = confirmations.get(channelId)!;

        if (channelConfirmations.has(userId)) {
            await interaction.reply({
                content: '✅ Você já confirmou a partida!',
                ephemeral: true
            });
            return;
        }

        channelConfirmations.add(userId);

        if (channelConfirmations.size >= 2) {
            await interaction.deferUpdate();

            try {
                const [saldo1, saldo2, player1, player2] = await Promise.all([
                    getMoney(user1),
                    getMoney(user2),
                    User.findOne({ userId: user1 }),
                    User.findOne({ userId: user2 }),
                ]);

                if (!player1?.clashTag || !player2?.clashTag) {
                    confirmations.delete(channelId);
                    matchData.delete(channelId);
                    await PendingMatch.deleteOne({ channelId });

                    const semTagEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ Tag não registrada')
                        .setDescription(
                            `Um dos jogadores não possui tag do Clash Royale registrada.\n\n` +
                            `Use o comando de registro antes de entrar em uma partida.\n\n` +
                            `⏱️ Este canal será deletado em 30 segundos...`
                        )
                        .setFooter({ text: 'ClashBet' })
                        .setTimestamp();

                    await interaction.message.edit({ embeds: [semTagEmbed], components: [] });

                    setTimeout(async () => {
                        try { await channel.delete(); } catch {}
                    }, 30000);
                    return;
                }

                if (saldo1 < priceInCents || saldo2 < priceInCents) {
                    confirmations.delete(channelId);
                    matchData.delete(channelId);
                    await PendingMatch.deleteOne({ channelId });

                    const semSaldoEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ Saldo Insuficiente')
                        .setDescription(
                            `Um dos jogadores não possui saldo suficiente para confirmar a partida.\n\n` +
                            `**Necessário:** R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}\n\n` +
                            `⏱️ Este canal será deletado em 30 segundos...`
                        )
                        .setFooter({ text: 'ClashBet' })
                        .setTimestamp();

                    await interaction.message.edit({ embeds: [semSaldoEmbed], components: [] });

                    setTimeout(async () => {
                        try { await channel.delete(); } catch {}
                    }, 30000);
                    return;
                }

                await descontoPartida(user1, user2, priceInCents);

                try {
                    await createActiveMatch({
                        channelId,
                        player1UserId: user1,
                        player2UserId: user2,
                        player1Tag: player1.clashTag,
                        player2Tag: player2.clashTag,
                        price: priceInCents,
                        autoVerificationEnabled: true,
                        timeoutMinutes: 30
                    });
                } catch (error) {
                    // Débito já ocorreu — estorna antes de propagar
                    console.error('Erro ao criar partida ativa, estornando débito:', error);
                    await estornoPartida(user1, user2, priceInCents);
                    throw error;
                }

                await Confirmation.create({
                    channelId: channel.id,
                    user1: user1,
                    user2: user2,
                    messageId: interaction.message.id,
                    date: new Date(),
                    price: Number(priceInCents),
                });

                const confirmedEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Partida Confirmada!')
                    .setDescription(
                        `**Jogadores:**\n` +
                        `<@${user1}> ✅\n` +
                        `<@${user2}> ✅\n\n` +
                        `**Valor Descontado:** R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}\n\n` +
                        `🎮 **Agora vocês podem jogar!**\n\n` +
                        `📎 **Envie o link de amizade do Clash Royale aqui:**\n` +
                        `Formato: \`https://link.clashroyale.com/invite/friend/...\`\n\n` +
                        `O vencedor deve clicar em **Finalizar** após a partida.`
                    )
                    .setFooter({ text: 'ClashBet • Boa sorte! 🍀' })
                    .setTimestamp();

                const finalButtons = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('Finalizar')
                            .setLabel('Finalizar Partida')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('Cancelar')
                            .setLabel('Cancelar Partida')
                            .setStyle(ButtonStyle.Danger)
                    );

                await interaction.message.edit({
                    embeds: [confirmedEmbed],
                    components: [finalButtons]
                });

                await channel.send({
                    content: `🎉 **Partida confirmada por ambos os jogadores!**\n\n` +
                        `💰 Valor de R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')} foi descontado de cada jogador.\n` +
                        `⚔️ **Que comece a batalha!**\n\n` +
                        `Envie o link de amizade abaixo para iniciar a partida.`
                });

                confirmations.delete(channelId);
                matchData.delete(channelId);
                await PendingMatch.deleteOne({ channelId });

            } catch (error) {
                console.error('Erro ao confirmar partida:', error);
                await interaction.followUp({
                    content: '❌ Erro ao processar confirmação. Entre em contato com o suporte.',
                    ephemeral: true
                });
            }

        } else {
            await interaction.deferUpdate();

            const otherUser = channelConfirmations.has(user1) ? user2 : user1;

            const waitingEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⏳ Aguardando Confirmação')
                .setDescription(
                    `**Jogadores:**\n` +
                    `<@${user1}> ${channelConfirmations.has(user1) ? '✅' : '⏳'}\n` +
                    `<@${user2}> ${channelConfirmations.has(user2) ? '✅' : '⏳'}\n\n` +
                    `**Valor da Aposta:** R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}\n\n` +
                    `⏳ **Aguardando <@${otherUser}> confirmar a partida...**`
                )
                .setFooter({ text: 'ClashBet' })
                .setTimestamp();

            await interaction.message.edit({
                embeds: [waitingEmbed]
            });

            await channel.send({
                content: `✅ <@${userId}> confirmou a partida!\n<@${otherUser}>, clique em **Aceitar** para confirmar.`
            });
        }
    },
});

new Responder({
    customId: "bet/match/cancel",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        const channel = interaction.channel as TextChannel;
        const userId = interaction.user.id;
        const channelId = channel.id;

        const match = matchData.get(channelId);

        if (!match) {
            await interaction.reply({
                content: '❌ Erro: Dados da partida não encontrados!',
                ephemeral: true
            });
            return;
        }

        const { user1, user2 } = match;

        if (userId !== user1 && userId !== user2) {
            await interaction.reply({
                content: '❌ Você não é um dos jogadores desta partida!',
                ephemeral: true
            });
            return;
        }

        await interaction.deferUpdate();

        confirmations.delete(channelId);
        matchData.delete(channelId);
        await PendingMatch.deleteOne({ channelId });

        const canceledEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Partida Cancelada')
            .setDescription(
                `A partida foi cancelada por <@${userId}>.\n\n` +
                `✅ Nenhum valor foi descontado.\n\n` +
                `⏱️ Este canal será deletado em 30 segundos...`
            )
            .setFooter({ text: 'ClashBet • Até a próxima!' })
            .setTimestamp();

        await interaction.message.edit({
            embeds: [canceledEmbed],
            components: []
        });

        setTimeout(async () => {
            try {
                await channel.delete();
            } catch (error) {
                console.error('Erro ao deletar canal:', error);
            }
        }, 30000);
    },
});
