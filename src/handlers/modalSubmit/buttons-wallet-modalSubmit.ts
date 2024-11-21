import { Client, EmbedBuilder, Interaction } from "discord.js";
import { setupPixGenerate } from "../../payments/pix-generate";
import { paymentChack } from "../../payments/confirm-pix";
import { deposito, saque } from "../../db/moneys";
import { getMoney } from "../../db/getMoneys";
import { saveDepositNotion } from "../../notion/depositoNotion";
import { gerarCodigoPix } from "../../notion/notion";
import { createSaqueEmbed } from "../../embed/embed-comprovante-saque";
import config from "../../../config";

export const buttonsWalletModal = async (client: Client, interaction: Interaction) => {
    const { rate } = config;
    if (!interaction.isModalSubmit()) return;

    if (interaction.replied || interaction.deferred) {
        console.log("Interação já processada.");
        return;
    }

    try {
        await interaction.deferReply({ ephemeral: true });

        // Depósito
        if (interaction.customId === "deposito_modal") {
            const valorInput = interaction.fields.getTextInputValue("depositoModal");

            // Validação de entrada
            const regex = /^[0-9]+([.,][0-9]{1,2})?$/; // Aceita formatos "123", "123.45" ou "123,45"
            if (!regex.test(valorInput)) {
                await interaction.followUp({
                    content: "O valor inserido é inválido. Use o formato '10.50' ou '10,50'.",
                    ephemeral: true,
                });
                return;
            }

            const valorReais = parseFloat(valorInput.replace(",", "."));
            const valorCentavos = Math.round(valorReais * 100);

            if (valorCentavos < 110 + rate) { // Valor mínimo de R$ 1,10 + rate
                await interaction.followUp({
                    content: "O valor deve ser maior ou igual a R$ 1,10.",
                    ephemeral: true,
                });
                return;
            }

            const paymentId = await setupPixGenerate(client, interaction, valorCentavos);

            if (paymentId) {
                await interaction.followUp({
                    content: "QR code e Pix Copia e Cola enviado ao seu canal privado. Faça o pagamento em até 5 minutos.",
                    ephemeral: true,
                });

                const paymentConfirmed = await paymentChack(client, paymentId, interaction.user.id);

                if (paymentConfirmed) {
                    await deposito(interaction.user.id, valorCentavos);
                    await saveDepositNotion(interaction.user.id, valorCentavos);

                    await interaction.followUp({
                        content: "Depósito confirmado com sucesso! Seu saldo foi atualizado.",
                        ephemeral: true,
                    });
                } else {
                    await interaction.followUp({
                        content: "O pagamento não foi confirmado dentro do tempo limite.",
                        ephemeral: true,
                    });
                }
            } else {
                await interaction.followUp({
                    content: "Erro ao gerar o pagamento. Tente novamente mais tarde.",
                    ephemeral: true,
                });
            }
        }

        // Saque
        else if (interaction.customId === "saque_modal") {
            const valorInput = interaction.fields.getTextInputValue("saqueModal");
            const pixKey = interaction.fields.getTextInputValue("pix");

            const isValid = gerarCodigoPix(pixKey, interaction.user.id, "São Luís", 10 / 100, interaction.user.id);
            if(!isValid) {
                await interaction.followUp({
                    content: "Chave Pix inválida.",
                    ephemeral: true,
                });
                return;
            }
            // Validação de entrada
            const regex = /^[0-9]+([.,][0-9]{1,2})?$/; // Aceita formatos "123", "123.45" ou "123,45"
            if (!regex.test(valorInput)) {
                await interaction.followUp({
                    content: "O valor inserido é inválido. Use o formato 10.50 ou 10,50.",
                    ephemeral: true,
                });
                return;
            }

            const valorReais = parseFloat(valorInput.replace(",", "."));
            const valorCentavos = Math.round(valorReais * 100);

            const saldoAtual = await getMoney(interaction.user.id);

            if (valorCentavos > saldoAtual) {
                await interaction.followUp({
                    content: "Você não tem saldo suficiente para este saque.",
                    ephemeral: true,
                });
                return;
            }

            await saque(interaction.user.id, valorCentavos, pixKey);
            const novoSaldo = saldoAtual - valorCentavos;

            const saqueEmbed = createSaqueEmbed(valorCentavos, pixKey, novoSaldo);

            const user = await client.users.fetch(interaction.user.id);
            if (user) {
                const dmChannel = await user.createDM();
                await dmChannel.send({ embeds: [saqueEmbed] });
            } else {
                console.warn("Não foi possível enviar a mensagem ao usuário.");
            }



            await interaction.followUp({
                content: "Saque solicitado com sucesso. O processamento será concluído em até 24h.",
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error("Erro ao processar interação:", error);
        if (!interaction.replied) {
            await interaction.followUp({
                content: "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
                ephemeral: true,
            });
        }
    }
};
