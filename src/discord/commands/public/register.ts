import { ApplicationCommandType, ChannelType } from 'discord.js';
import { Command } from '#base';
import { Guild } from '#database';

new Command({
    name: 'registro',
    description: 'Envia a mensagem fixa com o botão para adicionar tag do Clash Royale',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'canal',
            description: 'O canal onde a mensagem será fixada',
            type: 7, // CHANNEL
            required: true
        }
    ],
    async run(interaction) {
        const channelOption = interaction.options.getChannel('canal', true);

        if (channelOption.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: 'Por favor, selecione um canal de texto!',
                ephemeral: true
            });
            return;
        }

        const channel = await interaction.guild!.channels.fetch(channelOption.id);
        if (!channel || !channel.isTextBased()) {
            await interaction.reply({
                content: 'Canal inválido!',
                ephemeral: true
            });
            return;
        }

        const message = await channel.send({
            content: 'Clique no botão abaixo para adicionar sua tag do Clash Royale:',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: 'Adicionar Tag do Clash Royale',
                            customId: 'add_tag'
                        }
                    ]
                }
            ]
        });

        // Salvar no banco
        await Guild.updateOne(
            { guildId: channelOption.id },
            { fixedMessageId: message.id },
            { upsert: true }
        );

        await interaction.reply({
            content: 'Mensagem fixa enviada com sucesso!',
            ephemeral: true
        });
    }
});