import { Responder, ResponderType } from "#base";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextChannel, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Confirmation, User, PendingMatch } from "#database";
import { debitMatchFee, refundMatchFee, createActiveMatch, getBalance, cancelPendingMatchTimeout } from "#functions";
import { calcularPremio } from "#settings";
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

        // Valida cadastro e saldo do jogador que está clicando ANTES de registrar a confirmação
        const [player, saldo] = await Promise.all([
            User.findOne({ userId }),
            getBalance(userId),
        ]);

        if (!player?.clashTag) {
            const registerButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('add_tag')
                    .setLabel('Criar cadastro')
                    .setStyle(ButtonStyle.Primary),
            );
            await interaction.reply({
                content: [
                    '❌ Você precisa ter um cadastro para confirmar a partida.',
                    '',
                    'Vincule sua conta do Clash Royale clicando no botão abaixo e depois volte aqui para confirmar.',
                ].join('\n'),
                components: [registerButton],
                ephemeral: true,
            });
            return;
        }

        if (saldo < priceInCents) {
            const fmt = (c: number) => `R$ ${(c / 100).toFixed(2).replace('.', ',')}`;

            const depositModal = new ModalBuilder()
                .setCustomId('deposito_modal')
                .setTitle('Depositar para confirmar partida');

            const depositInput = new TextInputBuilder()
                .setCustomId('depositoModal')
                .setLabel(`Saldo atual: ${fmt(saldo)} — Necessário: ${fmt(priceInCents)}`)
                .setPlaceholder(fmt(priceInCents).replace('R$ ', ''))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            depositModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(depositInput));
            await interaction.showModal(depositModal);
            return;
        }

        channelConfirmations.add(userId);

        if (channelConfirmations.size >= 2) {
            await interaction.deferUpdate();

            try {
                const [player1, player2] = await Promise.all([
                    User.findOne({ userId: user1 }),
                    User.findOne({ userId: user2 }),
                ]);

                // Dupla checagem defensiva (ambos já validaram individualmente ao clicar)
                if (!player1?.clashTag || !player2?.clashTag) {
                    channelConfirmations.delete(user1 === userId ? user2 : user1);
                    await interaction.followUp({
                        content: '❌ O outro jogador ainda não possui cadastro. Aguarde ele se registrar e tente novamente.',
                        ephemeral: true,
                    });
                    return;
                }

                await debitMatchFee(user1, user2, priceInCents);

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
                    await refundMatchFee(user1, user2, priceInCents);
                    throw error;
                }

                await Confirmation.create({
                    channelId: channel.id,
                    user1,
                    user2,
                    messageId: interaction.message.id,
                    price: Number(priceInCents),
                });

                const { premioVencedor } = calcularPremio(priceInCents * 2);
                const fmt = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

                const confirmedEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Partida Confirmada — Siga os passos abaixo!')
                    .setDescription(
                        `**Jogadores:**\n` +
                        `<@${user1}> ✅\n` +
                        `<@${user2}> ✅\n\n` +
                        `**Valor descontado:** ${fmt(priceInCents)} por jogador\n` +
                        `**Prêmio do vencedor:** ${fmt(premioVencedor)} *(após rake de 10%)*\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n` +
                        `**📋 Como jogar:**\n\n` +
                        `**Passo 1 —** Um dos jogadores envia o link de amizade do Clash Royale **neste canal**:\n` +
                        `\`https://link.clashroyale.com/invite/friend/...\`\n` +
                        `*(Abra o Clash Royale → Perfil → Compartilhar → copie o link)*\n\n` +
                        `**Passo 2 —** O outro jogador aceita o convite no jogo e inicia uma partida **1v1 Amistosa**\n\n` +
                        `**Passo 3 —** Após a partida terminar, qualquer um dos jogadores clica em **Finalizar Partida**\n` +
                        `O resultado será verificado automaticamente via API do Clash Royale\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n` +
                        `⏱️ Você tem **30 minutos** para jogar — após isso a partida expira e os valores são estornados.`
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
                    content:
                        `<@${user1}> <@${user2}>\n\n` +
                        `🎉 **Ambos confirmaram! A partida está pronta.**\n\n` +
                        `**Próximo passo:** Um de vocês deve enviar o link de amizade do Clash Royale aqui.\n` +
                        `Para pegar o link: abra o Clash Royale → toque no seu perfil → **Compartilhar** → copie o link e cole aqui.`
                });

                cancelPendingMatchTimeout(channelId);
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

        cancelPendingMatchTimeout(channelId);
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
