import { Responder, ResponderType } from '#base';
import { deposito, saque, getMoney } from '#functions';
import { gerarCodigoPix, saveDepositNotion } from '#functions';
import { env } from '#settings';

new Responder({
    customId: 'deposito_modal',
    type: ResponderType.Modal,
    cache: 'cached',
    async run(interaction) {
        const valorInput = interaction.fields.getTextInputValue("depositoModal");

        const regex = /^[0-9]+([.,][0-9]{1,2})?$/;
        if (!regex.test(valorInput)) {
            await interaction.reply({
                content: "O valor inserido é inválido. Use o formato '10.50' ou '10,50'.",
                ephemeral: true,
            });
            return;
        }

        const valorReais = parseFloat(valorInput.replace(",", "."));
        const valorCentavos = Math.round(valorReais * 100);

        if (valorCentavos < 100 + env.RATE) {
            await interaction.reply({
                content: `O valor deve ser maior ou igual a R$ ${((100 + env.RATE) / 100).toFixed(2)}.`,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        // Aqui você implementaria a lógica de pagamento com Mercado Pago
        // Por enquanto, vou simular sucesso
        await deposito(interaction.user.id, valorCentavos);
        await saveDepositNotion(interaction.user.id, valorCentavos);

        await interaction.followUp({
            content: "Depósito confirmado com sucesso! Seu saldo foi atualizado.",
            ephemeral: true,
        });
    }
});

new Responder({
    customId: 'saque_modal',
    type: ResponderType.Modal,
    cache: 'cached',
    async run(interaction) {
        const valorInput = interaction.fields.getTextInputValue("saqueModal");
        const pixKey = interaction.fields.getTextInputValue("pix");

        const isValid = gerarCodigoPix(pixKey, interaction.user.id, "São Luís", 10, interaction.user.id);

        if (!isValid) {
            await interaction.reply({
                content: "Chave PIX inválida! Verifique e tente novamente.",
                ephemeral: true,
            });
            return;
        }

        const regex = /^[0-9]+([.,][0-9]{1,2})?$/;
        if (!regex.test(valorInput)) {
            await interaction.reply({
                content: "O valor inserido é inválido. Use o formato '10.50' ou '10,50'.",
                ephemeral: true,
            });
            return;
        }

        const valorReais = parseFloat(valorInput.replace(",", "."));
        const valorCentavos = Math.round(valorReais * 100);

        const saldo = await getMoney(interaction.user.id);

        if (valorCentavos > saldo) {
            await interaction.reply({
                content: `Saldo insuficiente! Seu saldo atual é de R$ ${(saldo / 100).toFixed(2).replace('.', ',')}`,
                ephemeral: true,
            });
            return;
        }

        if (valorCentavos < 500) {
            await interaction.reply({
                content: "O valor mínimo para saque é R$ 5,00.",
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        await saque(interaction.user.id, valorCentavos, pixKey);

        await interaction.followUp({
            content: `Saque de R$ ${(valorCentavos / 100).toFixed(2).replace('.', ',')} solicitado com sucesso! O valor será transferido para ${pixKey} em até 24h.`,
            ephemeral: true,
        });
    }
});