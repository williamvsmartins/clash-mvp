import { Client, TextChannel } from 'discord.js';
import { getGuildConfig } from './guildConfig.js';

interface QueueEntry {
    userId: string;
    messageId: string;
    price: number;
    guildId: string;
    timer: ReturnType<typeof setTimeout>;
}

const queueTimers = new Map<string, QueueEntry>();

const buildAlertMessage = (userId: string, price: number, roleAvailable: string): string => {
    const priceFormatted = `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
    const roleMention = roleAvailable ? `<@&${roleAvailable}> ` : '';
    return (
        `${roleMention}🔔 **Fila aberta!** <@${userId}> está aguardando um adversário ` +
        `na fila de **${priceFormatted}**. Quem topa? ⬆️`
    );
};

const fetchAlertsChannel = async (client: Client, channelId: string): Promise<TextChannel | null> => {
    if (!channelId) return null;
    try {
        const channel = await client.channels.fetch(channelId);
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

export const scheduleQueueNotification = async (
    client: Client,
    queueChannel: TextChannel,
    messageId: string,
    userId: string,
    price: number,
    guildId: string,
) => {
    if (queueTimers.has(messageId)) return;

    const config = await getGuildConfig(guildId);
    const delayMs = config.minutosFila * 60 * 1000;

    const timer = setTimeout(async () => {
        queueTimers.delete(messageId);

        const stillWaiting = await confirmStillWaiting(queueChannel, messageId);
        if (!stillWaiting) return;

        const latestConfig = await getGuildConfig(guildId);
        const alertsChannel = await fetchAlertsChannel(client, latestConfig.channelAlerts);
        if (!alertsChannel) return;

        await alertsChannel.send(buildAlertMessage(userId, price, latestConfig.roleAvailable));
    }, delayMs);

    queueTimers.set(messageId, { userId, messageId, price, guildId, timer });
};

export const cancelQueueNotification = (messageId: string) => {
    const entry = queueTimers.get(messageId);
    if (!entry) return;
    clearTimeout(entry.timer);
    queueTimers.delete(messageId);
};
