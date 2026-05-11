import type { Client } from 'discord.js';
import { PendingMatch } from '#database';
import { PENDING_MATCH_TIMEOUT_MINUTES } from '#settings';
import { matchData } from '../../discord/responders/bet/queue.js';

const pendingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Schedules auto-deletion of a pending match channel.
 *
 * @param client       Discord client (to fetch the channel)
 * @param channelId    The aposta-* channel to delete on expiry
 * @param delayMs      Milliseconds until expiry. Defaults to PENDING_MATCH_TIMEOUT_MINUTES.
 */
export function schedulePendingMatchTimeout(
    client: Client,
    channelId: string,
    delayMs = PENDING_MATCH_TIMEOUT_MINUTES * 60 * 1000,
): void {
    cancelPendingMatchTimeout(channelId);

    const handle = setTimeout(async () => {
        pendingTimeouts.delete(channelId);

        const stillPending = await PendingMatch.findOne({ channelId });
        if (!stillPending) return;

        matchData.delete(channelId);
        await PendingMatch.deleteOne({ channelId });

        try {
            const channel = await client.channels.fetch(channelId);
            if (channel && 'send' in channel) {
                await channel.send(
                    '⏱️ O tempo para confirmar a partida expirou — nenhum valor foi descontado. Este canal será deletado em 30 segundos.'
                );
            }
            setTimeout(async () => {
                try {
                    const ch = await client.channels.fetch(channelId);
                    if (ch && 'delete' in ch) await (ch as { delete(): Promise<unknown> }).delete();
                } catch { /* canal já deletado */ }
            }, 30_000);
        } catch { /* canal já deletado */ }
    }, delayMs);

    pendingTimeouts.set(channelId, handle);
}

export function cancelPendingMatchTimeout(channelId: string): void {
    const handle = pendingTimeouts.get(channelId);
    if (handle) {
        clearTimeout(handle);
        pendingTimeouts.delete(channelId);
    }
}
