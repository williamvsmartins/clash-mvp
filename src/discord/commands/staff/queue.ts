import { ApplicationCommandType, ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '#base';
import { calcularPremio } from '#settings';

new Command({
  name: 'fila',
  description: 'Cria nova fila de apostas',
  type: ApplicationCommandType.ChatInput,
  dmPermission: false,
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  options: [
    {
      name: 'valor',
      description: 'Valor em reais para a fila',
      type: 4,
      required: true
    },
    {
      name: 'canal',
      description: 'O canal onde a mensagem será enviada',
      type: 7,
      required: true
    }
  ],
  async run(interaction) {
    const valor = interaction.options.getInteger('valor', true);
    const channelOption = interaction.options.getChannel('canal', true);

    if (channelOption.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Por favor, selecione um canal de texto!', ephemeral });
      return;
    }

    const channel = await interaction.guild!.channels.fetch(channelOption.id);
    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: 'Canal inválido!', ephemeral });
      return;
    }

    const currencyFormatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

    const poteBruto = valor * 2 * 100; // centavos
    const { premioVencedor } = calcularPremio(poteBruto);
    const amountReceive = premioVencedor / 100; // reais

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('1v1 Clássico | Fila de Competição')
      .setDescription(`Formato\n1v1 Clássico\n\n`)
      .addFields([
        {
          name: 'Valor',
          value: `${currencyFormatter.format(valor)} / ${currencyFormatter.format(amountReceive)}`
        },
        {
          name: 'Jogadores',
          value: 'Nenhum jogador na fila \n\n',
          inline: false
        },
      ])
      .setThumbnail('https://cdn.discordapp.com/attachments/1276274460449575021/1276275081722593359/clashBet.jpg')
      .setFooter({ text: 'ClashBet' });

    await channel.send({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 1, label: 'Entrar na Fila', customId: 'bet/queue/enter_bet' },
            { type: 2, style: 4, label: 'Sair da Fila',   customId: 'bet/queue/leave_bet' }
          ]
        }
      ]
    });

    await interaction.reply({ content: 'Fila enviada com sucesso!', ephemeral });
  }
});
