import { ApplicationCommandType, ChannelType, PermissionFlagsBits } from 'discord.js';
import { Command } from '#base';
import { betMenu } from '#functions';
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
      description: 'Valor em reais (ex: 0.5 ou 0,5 para R$0,50)',
      type: 3,
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
    const valorStr = interaction.options.getString('valor', true);
    const channelOption = interaction.options.getChannel('canal', true);

    const valorFloat = parseFloat(valorStr.replace(',', '.'));
    if (isNaN(valorFloat) || valorFloat <= 0) {
      await interaction.reply({ content: 'Valor inválido! Use ponto ou vírgula como separador decimal (ex: 0.5 ou 0,5).', ephemeral });
      return;
    }

    if (channelOption.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Por favor, selecione um canal de texto!', ephemeral });
      return;
    }

    const channel = await interaction.guild!.channels.fetch(channelOption.id);
    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: 'Canal inválido!', ephemeral });
      return;
    }

    const amountPayCents = Math.round(valorFloat * 100);
    const { premioVencedor } = calcularPremio(amountPayCents * 2);

    await channel.send(betMenu(amountPayCents, premioVencedor));

    await interaction.reply({ content: 'Fila enviada com sucesso!', ephemeral });
  }
});
