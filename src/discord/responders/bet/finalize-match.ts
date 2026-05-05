import { Responder, ResponderType } from "#base";
import { reply, cancelMatch, checkMatchResult, premio } from "#functions";
import { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { Match } from "#database";
import { deleteChannel } from "#functions";
import { calcularPremio } from "#settings";

new Responder({
    customId: "Finalizar",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        const { channel, guild } = interaction;

        if (!channel || !guild) {
            await reply.danger({ interaction, text: "❌ Canal ou servidor não encontrado!" });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const channelId = channel.id;

            // Valida que quem clicou é um dos jogadores da partida
            const { ActiveMatch } = await import('#database');
            const activeMatchDoc = await ActiveMatch.findOne({ channelId, status: { $in: ['confirmed', 'in_progress'] } });
            if (!activeMatchDoc) {
                await interaction.editReply({ content: "❌ Partida não encontrada ou já finalizada." });
                return;
            }
            const userId = interaction.user.id;
            if (userId !== activeMatchDoc.player1UserId && userId !== activeMatchDoc.player2UserId) {
                await interaction.editReply({ content: "❌ Apenas os jogadores da partida podem finalizá-la." });
                return;
            }

            await interaction.editReply({
                content: "🔍 **Checando vencedor...**\nPor favor, aguarde...",
            });

            const verificationResult = await checkMatchResult(channelId);

            if (verificationResult.success) {
                // Verifica se houve EMPATE
                if (verificationResult.isDraw) {
                    // ✅ EMPATE - REEMBOLSA AMBOS JOGADORES
                    const player1Mention = `<@${verificationResult.player1UserId}>`;
                    const player2Mention = `<@${verificationResult.player2UserId}>`;

                    // Reembolsa ambos os jogadores
                    if (verificationResult.price) {
                        await Promise.all([
                            premio(verificationResult.player1UserId!, verificationResult.price),
                            premio(verificationResult.player2UserId!, verificationResult.price)
                        ]);
                    }

                    const drawEmbed = new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setTitle('🤝 Partida Empatada!')
                        .setDescription(
                            `**⚔️ Resultado:** ${verificationResult.result?.player1.crowns} x ${verificationResult.result?.player2.crowns}\n` +
                            `**🎮 Modo:** ${verificationResult.result?.gameMode}\n` +
                            `**🏟️ Arena:** ${verificationResult.result?.arena}\n` +
                            `**💰 Reembolso:** R$ ${(verificationResult.price! / 100).toFixed(2).replace('.', ',')} para cada jogador\n\n` +
                            `✅ **Ambos os jogadores receberam reembolso completo!**`
                        )
                        .setFooter({ text: `Verificação: ${verificationResult.validation?.appliedRule || 'API_VALIDATION'}` })
                        .setTimestamp();

                    await channel.send({
                        content: `${player1Mention} ${player2Mention}`,
                        embeds: [drawEmbed]
                    });

                    await interaction.editReply({
                        content: "🤝 **Partida empatada!** Valores reembolsados para ambos os jogadores."
                    });

                    // Agenda exclusão do canal
                    setTimeout(async () => {
                        await deleteChannel(channel as any);
                    }, 30000);

                    return;
                }

                // ✅ PARTIDA COM VENCEDOR
                if (verificationResult.winner && verificationResult.winnerUserId) {
                    const winnerMention = `<@${verificationResult.winnerUserId}>`;

                    // Premia o vencedor com o pote bruto — calcularPremio desconta o rake internamente
                    const poteBruto = verificationResult.price ? verificationResult.price * 2 : 0;
                    if (poteBruto) {
                        await premio(verificationResult.winnerUserId, poteBruto);
                    }

                    // Registra no histórico
                    const matchRecord = new Match({
                        channelId: channelId,
                        match: `${verificationResult.result?.player1.name} vs ${verificationResult.result?.player2.name}`,
                        winner: verificationResult.winnerUserId,
                        date: new Date().toISOString()
                    });
                    await matchRecord.save();

                    const { premioVencedor } = calcularPremio(poteBruto);

                    // Embed de resultado verificado
                    const resultEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('🎉 Partida Verificada e Finalizada!')
                        .setDescription(
                            `**🏆 Vencedor:** ${winnerMention}\n` +
                            `**⚔️ Resultado:** ${verificationResult.result?.player1.crowns} x ${verificationResult.result?.player2.crowns}\n` +
                            `**🎮 Modo:** ${verificationResult.result?.gameMode}\n` +
                            `**🏟️ Arena:** ${verificationResult.result?.arena}\n` +
                            `**💰 Prêmio:** R$ ${(premioVencedor / 100).toFixed(2).replace('.', ',')}\n\n` +
                            `✅ **Resultado confirmado via API oficial do Clash Royale!**`
                        )
                        .setFooter({ text: `Verificação: ${verificationResult.validation?.appliedRule || 'API_VALIDATION'}` })
                        .setTimestamp();

                    await channel.send({
                        embeds: [resultEmbed]
                    });

                    await interaction.editReply({
                        content: "✅ **Partida finalizada com sucesso!** Resultado verificado na API do Clash Royale."
                    });

                    // Agenda exclusão do canal
                    setTimeout(async () => {
                        await deleteChannel(channel as any);
                    }, 30000);
                }

            } else {
                // ❌ NÃO FOI POSSÍVEL VERIFICAR NA API
                const errorMessage = verificationResult.error || 'Nenhuma partida encontrada na API';

                const failEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Não Foi Possível Verificar a Partida')
                    .setDescription(
                        `**Motivo:** ${errorMessage}\n\n` +
                        `**Possíveis causas:**\n` +
                        `• Partida ainda não foi jogada\n` +
                        `• Partida foi jogada em modo não válido (Party Mode, etc.)\n` +
                        `• Partida não atende às regras de validação\n` +
                        `• Tempo limite de 30 minutos excedido\n\n` +
                        `**⚠️ A partida não pode ser finalizada sem verificação na API.**\n` +
                        `Jogue a partida no Clash Royale e tente novamente.`
                    )
                    .addFields(
                        { name: "🔄 Tentativas", value: `${verificationResult.attempts || 0}/10`, inline: true },
                        { name: "⏰ Aguardar", value: "2-3 minutos", inline: true }
                    )
                    .setFooter({ text: 'Sistema de Verificação Obrigatória' })
                    .setTimestamp();

                const retryButtons = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retry_verification')
                            .setLabel('🔄 Tentar Novamente')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled((verificationResult.attempts || 0) >= 10),
                        new ButtonBuilder()
                            .setCustomId('Cancelar')
                            .setLabel('❌ Cancelar Partida')
                            .setStyle(ButtonStyle.Danger)
                    );

                await channel.send({
                    embeds: [failEmbed],
                    components: [retryButtons]
                });

                await interaction.editReply({
                    content: "❌ **Partida não encontrada na API.** Jogue a partida no Clash Royale primeiro!"
                });
            }

        } catch (error) {
            console.error('Erro ao verificar partida:', error);
            await interaction.editReply({
                content: "❌ **Erro interno durante a verificação.** Entre em contato com o suporte."
            });
        }
    }
});

new Responder({
    customId: "retry_verification",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        const { channel } = interaction;

        if (!channel) {
            await reply.danger({ interaction, text: "❌ Canal não encontrado!" });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const channelId = channel.id;

            await interaction.followUp({
                content: "🔍 **Tentando verificar novamente...**",
                ephemeral: true
            });

            const verificationResult = await checkMatchResult(channelId);

            if (verificationResult.success) {
                // Verifica se houve EMPATE
                if (verificationResult.isDraw) {
                    // ✅ EMPATE - REEMBOLSA AMBOS JOGADORES
                    const player1Mention = `<@${verificationResult.player1UserId}>`;
                    const player2Mention = `<@${verificationResult.player2UserId}>`;

                    // Reembolsa ambos os jogadores
                    if (verificationResult.price) {
                        await Promise.all([
                            premio(verificationResult.player1UserId!, verificationResult.price),
                            premio(verificationResult.player2UserId!, verificationResult.price)
                        ]);
                    }

                    const drawEmbed = new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setTitle('🤝 Partida Empatada!')
                        .setDescription(
                            `**⚔️ Resultado:** ${verificationResult.result?.player1.crowns} x ${verificationResult.result?.player2.crowns}\n` +
                            `**🎮 Modo:** ${verificationResult.result?.gameMode}\n` +
                            `**🏟️ Arena:** ${verificationResult.result?.arena}\n` +
                            `**💰 Reembolso:** R$ ${(verificationResult.price! / 100).toFixed(2).replace('.', ',')} para cada jogador\n\n` +
                            `✅ **Empate verificado na tentativa ${verificationResult.attempts || 1}!**\n` +
                            `**Ambos os jogadores receberam reembolso completo!**`
                        )
                        .setFooter({ text: `Verificação: ${verificationResult.validation?.appliedRule || 'EMPATE'}` })
                        .setTimestamp();

                    await channel.send({
                        content: `${player1Mention} ${player2Mention}`,
                        embeds: [drawEmbed]
                    });

                    await interaction.editReply({
                        content: "🤝 **Empate detectado!** Valores reembolsados para ambos os jogadores."
                    });

                    // Remove botões da mensagem anterior
                    const messages = await channel.messages.fetch({ limit: 5 });
                    const failMessage = messages.find(m =>
                        m.embeds[0]?.title === '❌ Não Foi Possível Verificar a Partida' &&
                        m.components.length > 0
                    );

                    if (failMessage) {
                        await failMessage.edit({
                            embeds: failMessage.embeds,
                            components: []
                        });
                    }

                    // Agenda exclusão do canal
                    setTimeout(async () => {
                        await deleteChannel(channel as any);
                    }, 30000);

                    return;
                }

                // ✅ AGORA ENCONTROU A PARTIDA COM VENCEDOR!
                if (verificationResult.winner && verificationResult.winnerUserId) {
                    const winnerMention = `<@${verificationResult.winnerUserId}>`;

                    // Premia o vencedor com o pote bruto — calcularPremio desconta o rake internamente
                    const poteBrutoRetry = verificationResult.price ? verificationResult.price * 2 : 0;
                    if (poteBrutoRetry) {
                        await premio(verificationResult.winnerUserId, poteBrutoRetry);
                    }

                    // Registra no histórico
                    const matchRecord = new Match({
                        channelId: channelId,
                        match: `${verificationResult.result?.player1.name} vs ${verificationResult.result?.player2.name}`,
                        winner: verificationResult.winnerUserId,
                        date: new Date().toISOString()
                    });
                    await matchRecord.save();

                    const { premioVencedor: premioRetry } = calcularPremio(poteBrutoRetry);

                    const successEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('🎉 Partida Encontrada e Finalizada!')
                        .setDescription(
                            `**🏆 Vencedor:** ${winnerMention}\n` +
                            `**⚔️ Resultado:** ${verificationResult.result?.player1.crowns} x ${verificationResult.result?.player2.crowns}\n` +
                            `**🎮 Modo:** ${verificationResult.result?.gameMode}\n` +
                            `**🏟️ Arena:** ${verificationResult.result?.arena}\n` +
                            `**💰 Prêmio:** R$ ${(premioRetry / 100).toFixed(2).replace('.', ',')}\n\n` +
                            `✅ **Partida verificada com sucesso na tentativa ${verificationResult.attempts || 1}!**`
                        )
                        .setFooter({ text: 'Verificação Obrigatória - Sucesso' })
                        .setTimestamp();

                    await channel.send({ embeds: [successEmbed] });

                    await interaction.editReply({
                        content: "✅ **Sucesso!** Partida encontrada e finalizada."
                    });

                    // Remove botões da mensagem anterior
                    const messages = await channel.messages.fetch({ limit: 5 });
                    const failMessage = messages.find(m =>
                        m.embeds[0]?.title === '❌ Não Foi Possível Verificar a Partida' &&
                        m.components.length > 0
                    );

                    if (failMessage) {
                        await failMessage.edit({
                            embeds: failMessage.embeds,
                            components: []
                        });
                    }

                    // Agenda exclusão do canal
                    setTimeout(async () => {
                        await deleteChannel(channel as any);
                    }, 30000);
                }

            } else {
                // ❌ AINDA NÃO ENCONTROU
                const errorMessage = verificationResult.error || 'Partida ainda não encontrada';
                const attempts = verificationResult.attempts || 0;

                await interaction.editReply({
                    content: `❌ **Ainda não encontrada:** ${errorMessage}\n` +
                        `**Tentativas:** ${attempts}/10\n\n` +
                        `💡 **Dica:** Aguarde 2-3 minutos após jogar antes de tentar novamente.`
                });

                // Atualiza a mensagem anterior com nova contagem
                const messages = await channel.messages.fetch({ limit: 5 });
                const failMessage = messages.find(m =>
                    m.embeds[0]?.title === '❌ Não Foi Possível Verificar a Partida'
                );

                if (failMessage) {
                    const updatedEmbed = EmbedBuilder.from(failMessage.embeds[0])
                        .setFields(
                            { name: "🔄 Tentativas", value: `${attempts}/10`, inline: true },
                            { name: "⏰ Aguardar", value: "2-3 minutos", inline: true }
                        );

                    const updatedButtons = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('retry_verification')
                                .setLabel('🔄 Tentar Novamente')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(attempts >= 10),
                            new ButtonBuilder()
                                .setCustomId('Cancelar')
                                .setLabel('❌ Cancelar Partida')
                                .setStyle(ButtonStyle.Danger)
                        );

                    await failMessage.edit({
                        embeds: [updatedEmbed],
                        components: attempts >= 10 ? [] : [updatedButtons]
                    });
                }
            }

        } catch (error) {
            console.error('Erro ao tentar verificar novamente:', error);
            await interaction.editReply({
                content: "❌ **Erro interno.** Entre em contato com o suporte."
            });
        }
    }
});

new Responder({
    customId: "Cancelar",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        const { channel } = interaction;

        if (!channel) {
            await reply.danger({ interaction, text: "❌ Canal não encontrado!" });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await cancelMatch(channel.id);

            if (!result.success || !result.price) {
                await interaction.followUp({
                    content: `❌ ${result.error || 'Erro desconhecido'}`,
                    ephemeral: true
                });
                return;
            }

            // Reembolsa ambos os jogadores
            if (result.player1UserId && result.player2UserId) {
                await Promise.all([
                    premio(result.player1UserId, result.price),
                    premio(result.player2UserId, result.price)
                ]);
            }

            const cancelEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Partida Cancelada')
                .setDescription(
                    `A partida foi cancelada por solicitação dos jogadores.\n\n` +
                    `**💰 Reembolso:** R$ ${(result.price / 100).toFixed(2).replace('.', ',')} para cada jogador\n\n` +
                    `Os valores foram estornados para suas carteiras.`
                )
                .setFooter({ text: 'ClashBet • Partida Cancelada' })
                .setTimestamp();

            await channel.send({
                content: `<@${result.player1UserId}> <@${result.player2UserId}>`,
                embeds: [cancelEmbed]
            });

            await interaction.followUp({
                content: "✅ Partida cancelada e valores reembolsados.",
                ephemeral: true
            });

            // Agenda exclusão do canal
            setTimeout(async () => {
                await deleteChannel(channel as any);
            }, 30000);

        } catch (error) {
            console.error('Erro ao cancelar partida:', error);
            await interaction.followUp({
                content: "❌ Erro interno. Entre em contato com o suporte.",
                ephemeral: true
            });
        }
    }
});