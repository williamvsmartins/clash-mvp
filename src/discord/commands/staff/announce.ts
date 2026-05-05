import {
  ApplicationCommandType,
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Command } from '#base';

new Command({
  name: 'anuncio',
  description: 'Abre editor para enviar um anúncio em um canal',
  type: ApplicationCommandType.ChatInput,
  dmPermission: false,
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  options: [
    {
      name: 'canal',
      description: 'Canal onde o anúncio será enviado',
      type: 7,
      required,
    },
    {
      name: 'cor',
      description: 'Cor hex do embed (ex: #ff0000). Padrão: azul',
      type: 3,
      required: false,
    },
  ],
  async run(interaction) {
    const channelOption = interaction.options.getChannel('canal', true);
    const cor = interaction.options.getString('cor') ?? '#0099ff';

    if (channelOption.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Por favor, selecione um canal de texto!', ephemeral });
      return;
    }

    const modal = new ModalBuilder({
      customId: `announce/send/${channelOption.id}/${encodeURIComponent(cor)}`,
      title: 'Criar Anúncio',
      components: [
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder({
            customId: 'titulo',
            label: 'Título (opcional)',
            style: TextInputStyle.Short,
            required: false,
            maxLength: 256,
            placeholder: 'Deixe em branco para omitir',
          }),
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder({
            customId: 'mensagem',
            label: 'Mensagem',
            style: TextInputStyle.Paragraph,
            required,
            maxLength: 4000,
            placeholder: 'Suporta **negrito**, __sublinhado__, @menções, #canais...',
          }),
        ),
      ],
    });

    await interaction.showModal(modal);
  },
});
