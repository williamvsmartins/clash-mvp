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

    const amountPayCents = valor * 100;
    const { premioVencedor } = calcularPremio(amountPayCents * 2);

    await channel.send(betMenu(amountPayCents, premioVencedor));

    await interaction.reply({ content: 'Fila enviada com sucesso!', ephemeral });
  }
});
