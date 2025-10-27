import { ApplicationCommandType, ChannelType } from 'discord.js';
import { Command } from '#base';
import { Guild } from '#database';

new Command({
    name: 'carteira',
    description: 'Fixa os dados da carteira',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'canal',
            description: 'O canal onde a mensagem será fixada',
            type: 7,
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
            content: 'Selecione a operação que deseja realizar:',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: 'Depositar',
                            customId: 'deposito'
                        },
                        {
                            type: 2,
                            style: 3,
                            label: 'Saldo',
                            customId: 'saldo'
                        },
                        {
                            type: 2,
                            style: 2,
                            label: 'Sacar',
                            customId: 'sacar'
                        }
                    ]
                }
            ]
        });

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