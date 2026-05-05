import { Event } from '#base';
import { connectDatabase, PendingMatch } from '#database';
import { matchData } from '../responders/bet/queue.js';

new Event({
    name: 'ready',
    event: 'ready',
    once: true,
    async run(client) {
        console.log(`🤖 Bot está online como ${client.user.tag}`);

        await connectDatabase();

        // Recarrega partidas pendentes perdidas em memória após reinício
        const pending = await PendingMatch.find();
        for (const p of pending) {
            matchData.set(p.channelId, { user1: p.user1, user2: p.user2, price: p.price });
        }
        if (pending.length > 0) {
            console.log(`♻️ ${pending.length} partida(s) pendente(s) restaurada(s) em memória`);
        }

        console.log('✅ Todos os sistemas operacionais!');
    }
});