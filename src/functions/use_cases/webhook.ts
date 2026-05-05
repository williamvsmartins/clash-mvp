import { consultarPagamento } from '../mercadopago/service.js';
import { deposito } from './money.js';
import { PixPayment } from '#database';
import {
    enviarDM,
    criarEmbedPagamentoAprovado,
    criarEmbedPagamentoExpirado,
    criarEmbedPagamentoCancelado
} from '../discord/dm.js';


export async function processarWebhookPagamento(paymentId: number) {
    try {
        const paymentData = await consultarPagamento(paymentId);
        const pixPayment = await PixPayment.findOne({ mercadoPagoId: paymentId });

        if (!pixPayment) {
            console.log(`Pagamento ${paymentId} não encontrado no banco de dados`);
            return;
        }

        if (paymentData.status === 'approved') {
            // Marca como approved atomicamente — só prossegue se ainda estava pending.
            // Isso garante idempotência: retries do Mercado Pago não creditam duas vezes.
            const claimed = await PixPayment.findOneAndUpdate(
                { mercadoPagoId: paymentId, status: { $in: ['pending', 'in_progress'] } },
                { status: 'approved' }
            );

            if (!claimed) {
                console.log(`Pagamento ${paymentId} já foi processado anteriormente`);
                return;
            }

            console.log(`✅ Pagamento ${paymentId} aprovado! Processando depósito...`);

            await deposito(pixPayment.userId, pixPayment.valor);

            console.log(`✅ Depósito de ${pixPayment.valor} centavos realizado para o usuário ${pixPayment.userId}`);

            const embed = criarEmbedPagamentoAprovado(pixPayment.valor, paymentId);
            await enviarDM(pixPayment.userId, { embeds: [embed] });

        }
        else if (paymentData.status === 'cancelled') {
            await PixPayment.findOneAndUpdate(
                { mercadoPagoId: paymentId },
                { status: 'cancelled' }
            );
            console.log(`❌ Pagamento ${paymentId} cancelado`);

            const embed = criarEmbedPagamentoCancelado(pixPayment.valor, paymentId);
            await enviarDM(pixPayment.userId, { embeds: [embed] });
        }
        else if (paymentData.status === 'expired') {
            await PixPayment.findOneAndUpdate(
                { mercadoPagoId: paymentId },
                { status: 'expired' }
            );
            console.log(`⏰ Pagamento ${paymentId} expirado`);

            const embed = criarEmbedPagamentoExpirado(pixPayment.valor, paymentId);
            await enviarDM(pixPayment.userId, { embeds: [embed] });
        }
    } catch (error) {
        console.error('Erro ao processar webhook de pagamento:', error);
        throw error;
    }
}


export async function verificarPagamentosPendentes() {
    try {
        const pagamentosPendentes = await PixPayment.find({ status: 'pending' });

        for (const pagamento of pagamentosPendentes) {
            const minutosDesdeCreacao = (Date.now() - pagamento.createdAt.getTime()) / 1000 / 60;

            if (minutosDesdeCreacao > 15) {
                await PixPayment.findByIdAndUpdate(pagamento._id, { status: 'expired' });
                console.log(`Pagamento ${pagamento.mercadoPagoId} marcado como expirado`);
            } else {
                try {
                    await processarWebhookPagamento(pagamento.mercadoPagoId);
                } catch (error) {
                    console.error(`Erro ao verificar pagamento ${pagamento.mercadoPagoId}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao verificar pagamentos pendentes:', error);
    }
}
