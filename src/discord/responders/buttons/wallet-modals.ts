import { Responder, ResponderType } from '#base';
import { saque, getMoney, criarPagamentoPix } from '#functions';
import { gerarCodigoPix, saveDepositNotion } from '#functions';
import { PixPayment } from '#database';
import { env } from '#settings';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';

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

        if (valorCentavos <= 100 + env.RATE) {
            await interaction.reply({
                content: `O valor deve ser maior ou igual a R$ ${((100 + env.RATE) / 100).toFixed(2)}.`,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        console.log(interaction.user.username)

        try {
            const pixPayment = await criarPagamentoPix(
                valorCentavos,
                interaction.user.username,
                interaction.user.id,
                `Depósito de R$ ${valorReais.toFixed(2)} - ${interaction.user.username}`
            );

            await PixPayment.create({
                userId: interaction.user.id,
                mercadoPagoId: pixPayment.id,
                valor: valorCentavos,
                status: 'pending',
                qrCode: pixPayment.qrCode,
                qrCodeBase64: pixPayment.qrCodeBase64,
            });

            const qrCodeBuffer = Buffer.from(pixPayment.qrCodeBase64, 'base64');
            const qrCodeAttachment = new AttachmentBuilder(qrCodeBuffer, { name: 'qrcode.png' });

            const embed = new EmbedBuilder()
                .setTitle('💰 Pagamento PIX Gerado')
                .setDescription('Escaneie o QR Code ou copie o código PIX abaixo para realizar o pagamento.')
                .addFields(
                    { name: '💵 Valor', value: `R$ ${valorReais.toFixed(2).replace('.', ',')}`, inline: true },
                    { name: '🆔 ID do Pagamento', value: `#${pixPayment.id}`, inline: true },
                    { name: '⏰ Validade', value: '15 minutos', inline: true },
                    { name: '📋 PIX Copia e Cola', value: `\`\`\`${pixPayment.qrCode}\`\`\``, inline: false }
                )
                .setColor('#00b4d8')
                .setImage('attachment://qrcode.png')
                .setFooter({ text: 'O pagamento será confirmado automaticamente após a aprovação.' })
                .setTimestamp();

            try {
                await interaction.user.send({
                    embeds: [embed],
                    files: [qrCodeAttachment],
                });

                await interaction.user.send({
                    content: `${pixPayment.qrCode}`
                });

                await interaction.followUp({
                    content: '✅ QR Code enviado no seu privado! Verifique suas mensagens diretas.',
                    ephemeral: true,
                });
            } catch (dmError) {
                console.error('Não foi possível enviar DM:', dmError);

                const qrCodeBuffer2 = Buffer.from(pixPayment.qrCodeBase64, 'base64');
                const qrCodeAttachment2 = new AttachmentBuilder(qrCodeBuffer2, { name: 'qrcode.png' });

                await interaction.followUp({
                    content: '⚠️ Não foi possível enviar no privado. Aqui está seu QR Code (esta mensagem é visível apenas para você):',
                    embeds: [embed],
                    files: [qrCodeAttachment2],
                    ephemeral: true,
                });

                await interaction.followUp({
                    content: `${pixPayment.qrCode}`,
                    ephemeral: true,
                });
            }

            await saveDepositNotion(interaction.user.id, valorCentavos);

        } catch (error) {
            console.error('Erro ao gerar pagamento PIX:', error);
            await interaction.followUp({
                content: '❌ Erro ao gerar o pagamento PIX. Tente novamente mais tarde ou entre em contato com o suporte.',
                ephemeral: true,
            });
        }
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