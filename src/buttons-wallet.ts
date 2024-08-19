import { ActionRowBuilder, Client, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { setupPixGenerate } from "./pix-generate";
import { paymentChack } from "./confirm-pix";
import { deposito, saque } from "./moneys";
import { getMoney } from "./getMoneys";


export const buttonsWallet = (client: Client): void => {
    client.on('interactionCreate', async interaction => {
        if(!interaction.isButton()) return;

        const saldo = await getMoney(interaction.user.id);
        const saldoF = saldo.toFixed(2);

        if(interaction.customId === 'deposito'){
            const modal = new ModalBuilder()
                .setCustomId('deposito_modal')
                .setTitle('Selecione o valor de depósito');

                const depositoInput = new TextInputBuilder()
                .setCustomId('depositoModal')
                .setLabel("Valor do depósito (mínimo 1.10)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

                const depositoRow = new ActionRowBuilder<TextInputBuilder>().addComponents(depositoInput);

                modal.addComponents(depositoRow);
                await interaction.showModal(modal);
        } else if(interaction.customId === 'saldo'){
            await interaction.reply({ content: `Seu saldo atual é de ${saldoF} R$`, ephemeral: true })
        } else if(interaction.customId === 'sacar'){
            
            const modal = new ModalBuilder()
                .setCustomId('saque_modal')
                .setTitle('Selecione o valor de saque');

                const depositoInput = new TextInputBuilder()
                .setCustomId('saqueModal')
                .setLabel(`seu saldo atual é de ${saldoF} R$`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

                const depositoRow = new ActionRowBuilder<TextInputBuilder>().addComponents(depositoInput);

                modal.addComponents(depositoRow);
                await interaction.showModal(modal);
        }
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isModalSubmit()) return;

        const saldo = await getMoney(interaction.user.id);

        if (interaction.customId === 'deposito_modal') {
            const valor = interaction.fields.getTextInputValue('depositoModal');

            const valorNumerico = parseFloat(valor);

            if (isNaN(valorNumerico) || valorNumerico < 1.10) {
                await interaction.reply({ content: 'Por favor, insira um valor numérico válido maior ou igual a 1.10.', ephemeral: true });
            } else {
                console.log('pagamento')
                const paymentId = await setupPixGenerate(client, interaction, valorNumerico);
                if(await paymentChack(client, paymentId, interaction.user.id)){
                    deposito(interaction.user.id, valorNumerico);
                }
            }
        } else if(interaction.customId === 'saque_modal'){
            const valor = interaction.fields.getTextInputValue('saqueModal');
            const valorNumerico = parseFloat(valor);
            console.log(valorNumerico);
            console.log(saldo)
            if(valorNumerico <= saldo){
                await saque(interaction.user.id, valorNumerico);
                await interaction.reply({ content: `Saque sendo processado, em até 24h você terá seu saque concluído`, ephemeral: true })

            } else{
                await interaction.reply({ content: 'valor solicitado indisponível', ephemeral: true })
            }
        }
    });
}