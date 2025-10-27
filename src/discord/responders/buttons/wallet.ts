import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { Responder, ResponderType } from '#base';
import { getMoney } from '#functions';
import { env } from '#settings';

new Responder({
    customId: 'deposito',
    type: ResponderType.Button,
    cache: 'cached',
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('deposito_modal')
            .setTitle('Selecione o valor de depósito');

        const depositoInput = new TextInputBuilder()
            .setCustomId('depositoModal')
            .setLabel(`Valor do depósito (mínimo R$ ${((100 + env.RATE) / 100).toFixed(2).replace('.', ',')})`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const depositoRow = new ActionRowBuilder<TextInputBuilder>().addComponents(depositoInput);

        modal.addComponents(depositoRow);
        await interaction.showModal(modal);
    }
});

new Responder({
    customId: 'saldo',
    type: ResponderType.Button,
    cache: 'cached',
    async run(interaction) {
        const saldo = await getMoney(interaction.user.id);
        await interaction.reply({
            content: `Seu saldo atual é de R$ ${(saldo / 100).toFixed(2).replace('.', ',')}`,
            ephemeral: true
        });
    }
});

new Responder({
    customId: 'sacar',
    type: ResponderType.Button,
    cache: 'cached',
    async run(interaction) {
        const saldo = await getMoney(interaction.user.id);

        const modal = new ModalBuilder()
            .setCustomId('saque_modal')
            .setTitle('Selecione o valor de saque');

        const saqueInput = new TextInputBuilder()
            .setCustomId('saqueModal')
            .setLabel(`Seu saldo atual é de R$ ${(saldo / 100).toFixed(2).replace('.', ',')}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const pixInput = new TextInputBuilder()
            .setCustomId('pix')
            .setLabel('Sua chave pix')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const saqueRow = new ActionRowBuilder<TextInputBuilder>().addComponents(saqueInput);
        const pixRow = new ActionRowBuilder<TextInputBuilder>().addComponents(pixInput);

        modal.addComponents(saqueRow, pixRow);
        await interaction.showModal(modal);
    }
});