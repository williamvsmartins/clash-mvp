import { Client, TextChannel } from 'discord.js';
import { env } from '#settings';
import { QUEUE_NOTIFY_AFTER_MINUTES } from '#settings';

interface QueueEntry {
    userId: string;
    messageId: string;
    price: number;
    timer: ReturnType<typeof setTimeout>;
}

// messageId → entry (uma entrada por mensagem de fila)
const queueTimers = new Map<string, QueueEntry>();

const buildAlertMessage = (userId: string, price: number): string => {
    const priceFormatted = `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
    const roleMention = env.AVAILABLE_ROLE_ID ? `<@&${env.AVAILABLE_ROLE_ID}> ` : '';
    return (
        `${roleMention}🔔 **Fila aberta!** <@${userId}> está aguardando um adversário ` +
        `na fila de **${priceFormatted}**. Quem topa? ⬆️`
    );
};

const fetchAlertsChannel = async (client: Client): Promise<TextChannel | null> => {
    if (!env.CHANNEL_ID_ALERTS) return null;
    try {
        const channel = await client.channels.fetch(env.CHANNEL_ID_ALERTS);
        if (channel?.isTextBased() && 'send' in channel) return channel as TextChannel;
    } catch { /* canal não encontrado ou sem permissão */ }
    return null;
};

const confirmStillWaiting = async (queueChannel: TextChannel, messageId: string): Promise<boolean> => {
    try {
        const msg = await queueChannel.messages.fetch(messageId);
        const fieldValue = msg.embeds[0]?.fields?.[1]?.value ?? '';
        const members = fieldValue
            .split('\n')
            .map(v => v.trim().replace(/<@|>/g, ''))
            .filter(id => /^\d+$/.test(id));
        return members.length === 1;
    } catch {
        return false;
    }
};

export const scheduleQueueNotification = (
    client: Client,
    queueChannel: TextChannel,
    messageId: string,
    userId: string,
    price: number,
) => {
    if (queueTimers.has(messageId)) return;

    const delayMs = QUEUE_NOTIFY_AFTER_MINUTES * 60 * 1000;

    const timer = setTimeout(async () => {
        queueTimers.delete(messageId);

        const stillWaiting = await confirmStillWaiting(queueChannel, messageId);
        if (!stillWaiting) return;

        const alertsChannel = await fetchAlertsChannel(client);
        if (!alertsChannel) return;

        await alertsChannel.send(buildAlertMessage(userId, price));
    }, delayMs);

    queueTimers.set(messageId, { userId, messageId, price, timer });
};

export const cancelQueueNotification = (messageId: string) => {
    const entry = queueTimers.get(messageId);
    if (!entry) return;
    clearTimeout(entry.timer);
    queueTimers.delete(messageId);
};
