import { ChannelType } from 'discord.js';
import { Event } from '#base';
import { getConfirmations } from '#functions';

new Event({
    name: 'messageCreate',
    event: 'messageCreate',
    async run(message) {
        if (message.author.bot) return;
        if (message.channel.type !== ChannelType.GuildText) return;

        try {
            const confirmation = await getConfirmations(message.channel.id);

            if (confirmation &&
                (message.author.id === confirmation.user1 || message.author.id === confirmation.user2)) {

                if (message.content.includes('https://link.clashroyale.com/invite/friend/')) {
                    const price = confirmation.price ?? 0;
                    const fmt = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

                    await message.channel.send({
                        content:
                            `🔗 **Link de amizade detectado!**\n\n` +
                            `**O que fazer agora:**\n` +
                            `1️⃣ O adversário deve aceitar o convite no Clash Royale\n` +
                            `2️⃣ Jogue a partida 1v1 em modo **Amistoso**\n` +
                            `3️⃣ Após terminar, clique em **Finalizar Partida** — o sistema verificará o resultado automaticamente na API do Clash Royale\n\n` +
                            `💰 **Valor em jogo:** ${fmt(price)} por jogador\n` +
                            `⏱️ Você tem até **30 minutos** para jogar antes que a partida expire.`
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    }
});