import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { Responder, ResponderType } from '#base';
import { getMoney, getGuildConfig } from '#functions';

new Responder({
    customId: 'deposito',
    type: ResponderType.Button,
    cache: 'cached',
    async run(interaction) {
        const config = await getGuildConfig(interaction.guildId!);
        const minDeposit = ((100 + config.taxaDeposito) / 100).toFixed(2).replace('.', ',');

        const modal = new ModalBuilder()
            .setCustomId('deposito_modal')
            .setTitle('Selecione o valor de depósito');

        const depositoInput = new TextInputBuilder()
            .setCustomId('depositoModal')
            .setLabel(`Valor do depósito (mínimo R$ ${minDeposit})`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(depositoInput));
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
            ephemeral
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

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(saqueInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(pixInput),
        );
        await interaction.showModal(modal);
    }
});
