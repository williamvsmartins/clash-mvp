import { Responder, ResponderType } from "#base";
import { reply } from "#functions";
import { createEmbed, createEmbedAuthor, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { db } from "#database";

// Responder para iniciar processo de pagamento
new Responder({
    customId: "bet/payment/start/:amount",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction, { amount }) {
        const paymentAmount = parseInt(amount);

        try {
            const memberData = await db.members.get({
                id: interaction.user.id,
                guild: { id: interaction.guild!.id }
            });

            if (!memberData.wallet || memberData.wallet.coins < paymentAmount) {
                reply.danger({
                    interaction,
                    text: `Você não possui moedas suficientes! Saldo atual: ${memberData.wallet?.coins || 0}`
                });
                return;
            }

            // Criar modal para confirmação de pagamento
            const modal = new ModalBuilder()
                .setCustomId(`bet/payment/confirm/${paymentAmount}`)
                .setTitle("Confirmar Pagamento");

            const confirmInput = new TextInputBuilder()
                .setCustomId("confirm_text")
                .setLabel("Digite 'CONFIRMAR' para prosseguir")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("CONFIRMAR")
                .setRequired(true)
                .setMaxLength(10);

            const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(confirmInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        } catch (error) {
            reply.danger({
                interaction,
                text: "Erro ao processar pagamento. Tente novamente mais tarde."
            });
        }
    }
});

// Responder para confirmar pagamento
new Responder({
    customId: "bet/payment/confirm/:amount",
    type: ResponderType.Modal,
    cache: "cached",
    async run(interaction, { amount }) {
        const paymentAmount = parseInt(amount);
        const confirmText = interaction.fields.getTextInputValue("confirm_text");

        if (confirmText.toUpperCase() !== "CONFIRMAR") {
            reply.danger({
                interaction,
                text: "Confirmação inválida. Digite exatamente 'CONFIRMAR'."
            });
            return;
        }

        try {
            const memberData = await db.members.get({
                id: interaction.user.id,
                guild: { id: interaction.guild!.id }
            });

            if (!memberData.wallet || memberData.wallet.coins < paymentAmount) {
                reply.danger({
                    interaction,
                    text: `Você não possui moedas suficientes! Saldo atual: ${memberData.wallet?.coins || 0}`
                });
                return;
            }

            // Processar pagamento
            if (!memberData.wallet) {
                memberData.wallet = { coins: 0 };
            }
            memberData.wallet.coins -= paymentAmount;
            await memberData.save();

            const embed = createEmbed({
                author: createEmbedAuthor(interaction.user),
                color: "Success",
                title: "✅ Pagamento Processado",
                description: `**Valor pago:** ${paymentAmount} moedas\n**Saldo restante:** ${memberData.wallet?.coins || 0} moedas\n\nVocê foi adicionado à fila de apostas!`,
                thumbnail: { url: interaction.user.displayAvatarURL() },
                footer: { text: "Clash Bet" }
            });

            reply.success({
                interaction,
                embeds: [embed]
            });
        } catch (error) {
            reply.danger({
                interaction,
                text: "Erro ao processar pagamento. Tente novamente mais tarde."
            });
        }
    }
});
