import { TextChannel } from 'discord.js';
import { QUEUE_NOTIFY_AFTER_MINUTES } from '#settings';

interface QueueEntry {
    userId: string;
    channelId: string;
    messageId: string;
    price: number;
    timer: ReturnType<typeof setTimeout>;
}

// messageId → entry (uma entrada por mensagem de fila)
const queueTimers = new Map<string, QueueEntry>();

export const scheduleQueueNotification = (
    channel: TextChannel,
    messageId: string,
    userId: string,
    price: number,
) => {
    // Não agendar duas vezes para a mesma mensagem
    if (queueTimers.has(messageId)) return;

    const delayMs = QUEUE_NOTIFY_AFTER_MINUTES * 60 * 1000;

    const timer = setTimeout(async () => {
        queueTimers.delete(messageId);

        // Busca a mensagem para confirmar que ainda há exatamente 1 jogador esperando
        try {
            const msg = await channel.messages.fetch(messageId);
            const fieldValue = msg.embeds[0]?.fields?.[1]?.value ?? '';
            const members = fieldValue
                .split('\n')
                .map(v => v.trim().replace(/<@|>/g, ''))
                .filter(id => /^\d+$/.test(id));

            if (members.length !== 1) return; // já entrou alguém ou ficou vazia

            const priceFormatted = `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;

            await channel.send(
                `🔔 **Adversário procurado!** <@${members[0]}> está aguardando um oponente na fila de **${priceFormatted}** há mais de ${QUEUE_NOTIFY_AFTER_MINUTES} minuto(s). Quem topa? ⬆️`
            );
        } catch {
            // Mensagem deletada ou canal inacessível — sem ação necessária
        }
    }, delayMs);

    queueTimers.set(messageId, { userId, channelId: channel.id, messageId, price, timer });
};

export const cancelQueueNotification = (messageId: string) => {
    const entry = queueTimers.get(messageId);
    if (!entry) return;
    clearTimeout(entry.timer);
    queueTimers.delete(messageId);
};
