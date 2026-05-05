import { EmbedBuilder } from 'discord.js';
import { Responder, ResponderType } from '#base';
import { hexToRgb } from '@magicyan/discord';

new Responder({
  customId: 'announce/send/:channelId/:cor',
  type: ResponderType.Modal,
  cache: 'cached',
  async run(interaction, params) {
    const channelId = params?.channelId as string;
    const cor = decodeURIComponent(params?.cor as string ?? '#0099ff');

    const titulo = interaction.fields.getTextInputValue('titulo').trim();
    const mensagem = interaction.fields.getTextInputValue('mensagem').trim();

    const channel = await interaction.guild!.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: 'Canal inválido ou não encontrado.', ephemeral });
      return;
    }

    let color: number;
    try {
      color = hexToRgb(cor);
    } catch {
      color = hexToRgb('#0099ff');
    }

    const embed = new EmbedBuilder({ description: mensagem, color });
    if (titulo) embed.setTitle(titulo);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'Anúncio enviado com sucesso!', ephemeral });
  },
});
