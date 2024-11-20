import { Client, Interaction } from "discord.js";
import { setupPixGenerate } from "../../payments/pix-generate";
import { paymentChack } from "../../payments/confirm-pix";
import { deposito, saque } from "../../db/moneys";
import { getMoney } from "../../db/getMoneys";
import { saveDepositNotion } from "../../notion/depositoNotion";

export const buttonsWalletModal = async (client: Client, interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.replied || interaction.deferred) {
        console.log('Interação já processada.');
        return;
    }

    try {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.customId === 'deposito_modal') {
            const valor = interaction.fields.getTextInputValue('depositoModal');
            const valorNumerico = parseFloat(valor);

            if (isNaN(valorNumerico) || valorNumerico < 1.10) {
                await interaction.followUp({
                    content: 'Por favor, insira um valor numérico válido maior ou igual a 1.10.',
                    ephemeral: true,
                });
                return;
            }

            const paymentId = await setupPixGenerate(client, interaction, valorNumerico);

            if (paymentId) {
                await interaction.followUp({
                    content: 'Qr code e pix copia e cola enviado ao seu canal privado, por favor faça o pagamento em até 5 minutos.',
                    ephemeral: true,
                });

                const paymentConfirmed = await paymentChack(client, paymentId, interaction.user.id);

                if (paymentConfirmed) {
                    await deposito(interaction.user.id, valorNumerico);
                    await saveDepositNotion(interaction.user.id, valorNumerico);
                }
            } else {
                await interaction.followUp({
                    content: 'Ocorreu um erro ao gerar o pagamento. Por favor, tente novamente mais tarde.',
                    ephemeral: true,
                });
            }
        } else if (interaction.customId === 'saque_modal') {
            const valor = interaction.fields.getTextInputValue('saqueModal');
            const pix = interaction.fields.getTextInputValue('pix');
            const valorNumerico = parseFloat(valor);
            const saldo = await getMoney(interaction.user.id);

            if (valorNumerico <= saldo) {
                await saque(interaction.user.id, valorNumerico, pix);
                await interaction.followUp({
                    content: 'Saque sendo processado. Em até 24h você terá seu saque concluído.',
                    ephemeral: true,
                });
            } else {
                await interaction.followUp({
                    content: 'Valor solicitado indisponível.',
                    ephemeral: true,
                });
            }
        }
    } catch (error) {
        console.error('Erro ao processar interação:', error);
        if (!interaction.replied) {
            await interaction.followUp({
                content: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
                ephemeral: true,
            });
        }
    }
};
