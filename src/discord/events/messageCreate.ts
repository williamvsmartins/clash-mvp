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

                    await message.channel.send({
                        content: `Link do Clash Royale detectado!\nValor da aposta: R$ ${(price / 100).toFixed(2)}`
                    });

                    // Verificar se o canal é do tipo TextChannel antes de usar setName
                    if (message.channel.type === ChannelType.GuildText) {
                        await message.channel.setName(`Aposta confirmada - ${message.channel.id}`);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    }
});