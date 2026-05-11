import { Event } from '#base';
import { connectDatabase, PendingMatch } from '#database';
import { matchData } from '../responders/bet/queue.js';
import { schedulePendingMatchTimeout } from '#functions';
import { PENDING_MATCH_TIMEOUT_MINUTES } from '#settings';

new Event({
    name: 'ready',
    event: 'ready',
    once: true,
    async run(client) {
        console.log(`🤖 Bot está online como ${client.user.tag}`);

        await connectDatabase();

        // Recarrega partidas pendentes perdidas em memória após reinício
        const pending = await PendingMatch.find();
        const timeoutMs = PENDING_MATCH_TIMEOUT_MINUTES * 60 * 1000;

        for (const p of pending) {
            matchData.set(p.channelId, { user1: p.user1, user2: p.user2, price: p.price });

            // Retoma o timeout com o tempo restante baseado no createdAt original
            const elapsed = Date.now() - p.createdAt.getTime();
            const remaining = timeoutMs - elapsed;

            if (remaining <= 0) {
                // Já expirou durante o downtime — expira imediatamente
                schedulePendingMatchTimeout(client, p.channelId, 0);
            } else {
                schedulePendingMatchTimeout(client, p.channelId, remaining);
            }
        }

        if (pending.length > 0) {
            console.log(`♻️ ${pending.length} partida(s) pendente(s) restaurada(s) em memória`);
        }

        console.log('✅ Todos os sistemas operacionais!');
    }
});