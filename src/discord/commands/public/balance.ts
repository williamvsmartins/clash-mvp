import { ApplicationCommandType, ChannelType, EmbedBuilder } from 'discord.js';
import { Command } from '#base';

new Command({
    name: 'values',
    description: 'Exibe a tabela de preços',
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
            .setColor('#00FF00')
            .setTitle('TABELA DE PREÇOS 🪙')
            .setDescription(
                'Valor Aposta: 1,25  |  Pagamento: 2,00\n' +
                'Valor Aposta: 2,25  |  Pagamento: 4,00\n' +
                'Valor Aposta: 3,25  |  Pagamento: 6,00\n' +
                'Valor Aposta: 5,25  |  Pagamento: 10,00\n' +
                'Valor Aposta: 10,25 |  Pagamento: 20,00\n' +
                'Valor Aposta: 15,25 |  Pagamento: 30,00\n' +
                'Valor Aposta: 20,25 |  Pagamento: 40,00\n' +
                'Valor Aposta: 50,25 |  Pagamento: 100,00\n' +
                'Valor Aposta: 100,25|  Pagamento: 200,00'
            );

        await channel.send({ embeds: [embed] });

        await interaction.reply({
            content: 'Mensagem fixa enviada com sucesso!',
            ephemeral: true
        });
    }
});