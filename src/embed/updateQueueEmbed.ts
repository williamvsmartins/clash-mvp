import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { filas } from '../handlers/buttons/queueManager';

export const updateQueueEmbed = async (channelId: string, messageId: string, apostaId: string, client: Client): Promise<void> => {
  const channel = await client.channels.fetch(channelId);
  if (!channel || !(channel instanceof TextChannel)) return;

  const message = await channel.messages.fetch(messageId);
  if (!message) return;

  const originalEmbed = message.embeds[0];
  if (!originalEmbed) return;

  const fields = originalEmbed.fields.map(field => ({ ...field }));

  const playersField = fields.find(field => field.name === 'Jogadores');
  if (playersField) {
    const queue = filas.get(apostaId) || [];
    const queueList = queue.length > 0 ? queue.map(id => `<@${id}>`).join('\n') : 'Nenhum jogador na fila';
    playersField.value = `${queueList}\n\n`;
  }

  const updatedEmbed = new EmbedBuilder()
    .setColor(originalEmbed.color)
    .setTitle(originalEmbed.title)
    .setDescription(originalEmbed.description)
    .setFields(fields)
    .setThumbnail(originalEmbed.thumbnail?.url || '')
    .setFooter({ text: originalEmbed.footer?.text || '' });

  await message.edit({ embeds: [updatedEmbed] });
};