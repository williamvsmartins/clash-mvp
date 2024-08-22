import { ActionRowBuilder, Client, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { getMoney } from "../../db/getMoneys";


export const buttonsWallet = async (client: Client, interaction: Interaction) => {

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
}