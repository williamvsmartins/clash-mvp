import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { Responder, ResponderType } from '#base';

new Responder({
    customId: 'ticket_select',
    type: ResponderType.StringSelect,
    cache: 'cached',
    async run(interaction) {
        const id = interaction.values[0];

        if (!interaction.guild || !interaction.channel) return;

        const category = interaction.channel.parent;
        if (!category) {
            await interaction.reply({
                content: 'Não foi possível encontrar a categoria do canal.',
                ephemeral: true
            });
            return;
        }

        let channelName = '';
        if (id === 'denuncia') {
            channelName = `denuncia-${interaction.user.username}`;
        } else if (id === 'refund') {
            channelName = `reembolso-${interaction.user.username}`;
        } else if (id === 'duvid') {
            channelName = `duvida-${interaction.user.username}`;
        }

        const privateChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                },
            ],
        });

        await interaction.reply({
            content: `Canal privado criado: ${privateChannel}`,
            ephemeral: true
        });

        await privateChannel.send({
            content: `${interaction.user}, seu ticket foi criado! Nossa equipe irá te atender em breve.`
        });
    }
});