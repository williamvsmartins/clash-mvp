import { Client, Interaction } from "discord.js";
import { setupPixGenerate } from "../../payments/pix-generate";
import { paymentChack } from "../../payments/confirm-pix";
import { deposito, saque } from "../../db/moneys";
import { getMoney } from "../../db/getMoneys";

export const buttonsWalletModal = async (client: Client, interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;

    const saldo = await getMoney(interaction.user.id);
    const saldoF = saldo.toFixed(2);

    if (interaction.customId === 'deposito_modal') {
        const valor = interaction.fields.getTextInputValue('depositoModal');

        const valorNumerico = parseFloat(valor);

        if (isNaN(valorNumerico) || valorNumerico < 1.10) {
            await interaction.reply({ content: 'Por favor, insira um valor numérico válido maior ou igual a 1.10.', ephemeral: true });
        } else {
            const paymentId = await setupPixGenerate(client, interaction, valorNumerico);
            if(paymentId != ''){
                interaction.reply({ content: `Qr code e pix copia e cola enviado ao seu canal privado, por favor faca o pagamente em até 5 minutos`, ephemeral: true })
                if(await paymentChack(client, paymentId, interaction.user.id)){
                    deposito(interaction.user.id, valorNumerico);
                }
            }
        }
    } else if(interaction.customId === 'saque_modal'){
        const valor = interaction.fields.getTextInputValue('saqueModal');
        const valorNumerico = parseFloat(valor);
        if(valorNumerico <= saldo){
            await saque(interaction.user.id, valorNumerico);
            await interaction.reply({ content: `Saque sendo processado, em até 24h você terá seu saque concluído`, ephemeral: true })

        } else{
            await interaction.reply({ content: 'valor solicitado indisponível', ephemeral: true })
        }
    }
}