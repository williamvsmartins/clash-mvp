import { Event } from '#base';
import { connectDatabase } from '#database';

new Event({
    name: 'ready',
    event: 'ready',  // ✅ Adicionar esta propriedade
    once: true,
    async run(client) {
        console.log(`🤖 Bot está online como ${client.user.tag}`);

        // Conectar ao MongoDB
        await connectDatabase();

        console.log('✅ Todos os sistemas operacionais!');
    }
});