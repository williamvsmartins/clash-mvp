import { TextChannel, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Guild } from '../database';

export const setupFixedMessageQueue = async (client: Client): Promise<void> => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'fila') return;

    const { options } = interaction

    const channelOption  = options.get('canal')
    const valueOption  = options.get('valor')
    console.log(valueOption)

    if (!channelOption) {
      await interaction.reply({
        content: "É necessário especificar o ID do canal!",
        ephemeral: true
      });
      return;
    }

    if (!valueOption?.value) {
      await interaction.reply({
        content: "É necessário especificar o valor em reais para a fila",
        ephemeral: true
      });
      return;
    }

    const channelId = channelOption.value as string;
    const value = valueOption.value as number
    const channel = await client.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) return;

    const currencyFormatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('1v1 Clássico | Fila de Competição')
        .setDescription(`Formato\n1v1 Clássico\n\nValor\n${currencyFormatter.format(value)}`)
        .addFields([
          { name: 'Jogadores', value: 'Nenhum jogador na fila \n\n', inline: false }
        ])
        .setThumbnail('https://i.ytimg.com/vi/uWsQ5IWVilM/maxresdefault.jpg')
        .setFooter({ text: 'Clash Apostas' });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('enter_queue')
          .setLabel('Entrar na Fila')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('leave_queue')
          .setLabel('Sair da Fila')
          .setStyle(ButtonStyle.Danger)
      );
    

    await channel.send({ content: 'Clique no botão abaixo para entrar na fila:', embeds: [embed], components: [row] });

    await interaction.reply({ content: 'Fila enviada com sucesso!', ephemeral: true });
  });
};

// async function saveFixedMessageId(guildId: string, fixedMessageId: string): Promise<void> {
//   try {
//     const existingGuild = await Guild.findOne({ guildId });

//     if (existingGuild) {
//       existingGuild.fixedMessageId = fixedMessageId;
//       await existingGuild.save();
//     } else {
//       await Guild.create({
//         guildId,
//         fixedMessageId,
//       });
//     }
//   } catch (error) {
//     console.error('Erro ao salvar o ID da mensagem fixa:', error);
//   }
// }