import { ApplicationCommandType, ChannelType, EmbedBuilder } from 'discord.js';
import { Command } from '#base';
import { Guild } from '#database';

new Command({
    name: 'support',
    description: 'Fixa o embed para criar um suporte',
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

        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('📞 Suporte')
            .setDescription('Selecione o ticket de suporte que deseja abrir:')
            .setFooter({ text: 'OBS: Caso abra o ticket referente ao assunto errado será fechado!' });

        const message = await channel.send({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            customId: 'ticket_select',
                            placeholder: 'Selecione o ticket que deseja abrir.',
                            options: [
                                {
                                    label: 'DENÚNCIA',
                                    description: 'Clique aqui para abrir um ticket de denuncia',
                                    value: 'denuncia',
                                    emoji: { name: '⚠️' }
                                },
                                {
                                    label: 'PAGAMENTO ERRADO',
                                    description: 'Clique aqui para abrir um ticket sobre pagamento errado de aposta',
                                    value: 'refund',
                                    emoji: { name: '💰' }
                                },
                                {
                                    label: 'DÚVIDAS',
                                    description: 'Clique aqui para abrir um ticket para tirar suas dúvidas',
                                    value: 'duvid',
                                    emoji: { name: '🤔' }
                                }
                            ]
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