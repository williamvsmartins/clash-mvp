import { EmbedBuilder, Client } from 'discord.js';

// Armazena a instância do client para uso posterior
let discordClient: Client | null = null;

/**
 * Inicializa o client do Discord para envio de DMs
 * Deve ser chamado no index.ts após o client estar pronto
 */
export function inicializarClientDM(client: Client) {
    discordClient = client;
    console.log('✅ Client Discord inicializado para envio de DMs');
}

/**
 * Envia uma mensagem no DM de um usuário
 * @param userId - ID do usuário Discord
 * @param content - Conteúdo da mensagem (string ou embed)
 * @returns true se enviou com sucesso, false se falhou
 */
export async function enviarDM(
    userId: string,
    content: string | { embeds: EmbedBuilder[] }
): Promise<boolean> {
    if (!discordClient) {
        console.error('❌ Client Discord não inicializado! Chame inicializarClientDM() primeiro.');
        return false;
    }

    try {
        const user = await discordClient.users.fetch(userId);

        if (typeof content === 'string') {
            await user.send(content);
        } else {
            await user.send(content);
        }

        console.log(`✅ DM enviado para o usuário ${userId}`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao enviar DM para ${userId}:`, error);
        return false;
    }
}

/**
 * Cria um embed de pagamento aprovado
 */
export function criarEmbedPagamentoAprovado(valor: number, paymentId: number): EmbedBuilder {
    const valorReais = (valor / 100).toFixed(2).replace('.', ',');

    return new EmbedBuilder()
        .setTitle('✅ Pagamento Aprovado!')
        .setDescription('Seu depósito foi confirmado com sucesso!')
        .addFields(
            { name: '💰 Valor Depositado', value: `R$ ${valorReais}`, inline: true },
            { name: '🆔 ID do Pagamento', value: `#${paymentId}`, inline: true },
            { name: '📅 Data', value: new Date().toLocaleString('pt-BR'), inline: false }
        )
        .setColor('#00FF00')
        .setFooter({ text: 'Obrigado por usar nosso sistema!' })
        .setTimestamp();
}

/**
 * Cria um embed de pagamento expirado
 */
export function criarEmbedPagamentoExpirado(valor: number, paymentId: number): EmbedBuilder {
    const valorReais = (valor / 100).toFixed(2).replace('.', ',');

    return new EmbedBuilder()
        .setTitle('⏰ Pagamento Expirado')
        .setDescription('O tempo para realizar o pagamento expirou (15 minutos).')
        .addFields(
            { name: '💰 Valor', value: `R$ ${valorReais}`, inline: true },
            { name: '🆔 ID do Pagamento', value: `#${paymentId}`, inline: true },
            { name: '📝 O que fazer?', value: 'Você pode criar um novo depósito usando `/wallet`', inline: false }
        )
        .setColor('#FF9900')
        .setFooter({ text: 'O QR Code gerado não é mais válido' })
        .setTimestamp();
}

/**
 * Cria um embed de pagamento cancelado
 */
export function criarEmbedPagamentoCancelado(valor: number, paymentId: number): EmbedBuilder {
    const valorReais = (valor / 100).toFixed(2).replace('.', ',');

    return new EmbedBuilder()
        .setTitle('❌ Pagamento Cancelado')
        .setDescription('O pagamento foi cancelado.')
        .addFields(
            { name: '💰 Valor', value: `R$ ${valorReais}`, inline: true },
            { name: '🆔 ID do Pagamento', value: `#${paymentId}`, inline: true },
            { name: '📝 O que fazer?', value: 'Você pode criar um novo depósito usando `/wallet`', inline: false }
        )
        .setColor('#FF0000')
        .setFooter({ text: 'Entre em contato com o suporte se tiver dúvidas' })
        .setTimestamp();
}
