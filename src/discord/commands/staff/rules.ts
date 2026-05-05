import { ApplicationCommandType, ChannelType, PermissionFlagsBits } from 'discord.js';
import { Command } from '#base';
import { rulesMenu } from '#functions';

new Command({
  name: 'regras',
  description: 'Envia o embed de regras em um canal',
  type: ApplicationCommandType.ChatInput,
  dmPermission: false,
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  options: [
    {
      name: 'canal',
      description: 'Canal onde o embed será enviado',
      type: 7,
      required: true,
    },
  ],
  async run(interaction) {
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

    await channel.send(rulesMenu());
    await interaction.reply({ content: 'Regras enviadas com sucesso!', ephemeral });
  },
});
