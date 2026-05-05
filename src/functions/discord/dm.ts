import { EmbedBuilder, Client, MessageCreateOptions } from 'discord.js';

let discordClient: Client | null = null;

export function initDmClient(client: Client) {
    discordClient = client;
}

export async function sendDM(
    userId: string,
    content: string | MessageCreateOptions
): Promise<boolean> {
    if (!discordClient) return false;

    try {
        const user = await discordClient.users.fetch(userId);
        if (typeof content === 'string') {
            await user.send(content);
        } else {
            await user.send(content);
        }
        return true;
    } catch {
        return false;
    }
}

export function buildDepositApprovedEmbed(amountCents: number, paymentId: number): EmbedBuilder {
    const amountFormatted = (amountCents / 100).toFixed(2).replace('.', ',');

    return new EmbedBuilder()
        .setTitle('✅ Pagamento Aprovado!')
        .setDescription('Seu depósito foi confirmado com sucesso!')
        .addFields(
            { name: '💰 Valor Depositado', value: `R$ ${amountFormatted}`, inline: true },
            { name: '🆔 ID do Pagamento', value: `#${paymentId}`, inline: true },
            { name: '📅 Data', value: new Date().toLocaleString('pt-BR'), inline: false }
        )
        .setColor('#00FF00')
        .setFooter({ text: 'Obrigado por usar nosso sistema!' })
        .setTimestamp();
}

export function buildDepositExpiredEmbed(amountCents: number, paymentId: number): EmbedBuilder {
    const amountFormatted = (amountCents / 100).toFixed(2).replace('.', ',');

    return new EmbedBuilder()
        .setTitle('⏰ Pagamento Expirado')
        .setDescription('O tempo para realizar o pagamento expirou (15 minutos).')
        .addFields(
            { name: '💰 Valor', value: `R$ ${amountFormatted}`, inline: true },
            { name: '🆔 ID do Pagamento', value: `#${paymentId}`, inline: true },
            { name: '📝 O que fazer?', value: 'Você pode criar um novo depósito usando `/wallet`', inline: false }
        )
        .setColor('#FF9900')
        .setFooter({ text: 'O QR Code gerado não é mais válido' })
        .setTimestamp();
}

export function buildDepositCancelledEmbed(amountCents: number, paymentId: number): EmbedBuilder {
    const amountFormatted = (amountCents / 100).toFixed(2).replace('.', ',');

    return new EmbedBuilder()
        .setTitle('❌ Pagamento Cancelado')
        .setDescription('O pagamento foi cancelado.')
        .addFields(
            { name: '💰 Valor', value: `R$ ${amountFormatted}`, inline: true },
            { name: '🆔 ID do Pagamento', value: `#${paymentId}`, inline: true },
            { name: '📝 O que fazer?', value: 'Você pode criar um novo depósito usando `/wallet`', inline: false }
        )
        .setColor('#FF0000')
        .setFooter({ text: 'Entre em contato com o suporte se tiver dúvidas' })
        .setTimestamp();
}
