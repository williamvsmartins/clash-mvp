import { getPayment } from '../mercadopago/service.js';
import { creditDeposit } from './money.js';
import { PixPayment } from '#database';
import {
    sendDM,
    buildDepositApprovedEmbed,
    buildDepositExpiredEmbed,
    buildDepositCancelledEmbed,
} from '../discord/dm.js';


export async function processPaymentWebhook(paymentId: number) {
    const paymentData = await getPayment(paymentId);
    const pixPayment = await PixPayment.findOne({ mercadoPagoId: paymentId });

    if (!pixPayment) return;

    if (paymentData.status === 'approved') {
        const claimed = await PixPayment.findOneAndUpdate(
            { mercadoPagoId: paymentId, status: { $in: ['pending', 'in_progress'] } },
            { status: 'approved' }
        );

        if (!claimed) return;

        try {
            await creditDeposit(pixPayment.userId, pixPayment.amount);
        } catch (error) {
            await PixPayment.findOneAndUpdate({ mercadoPagoId: paymentId }, { status: 'pending' });
            throw error;
        }

        await sendDM(pixPayment.userId, { embeds: [buildDepositApprovedEmbed(pixPayment.amount, paymentId)] });

    } else if (paymentData.status === 'cancelled') {
        await PixPayment.findOneAndUpdate({ mercadoPagoId: paymentId }, { status: 'cancelled' });
        await sendDM(pixPayment.userId, { embeds: [buildDepositCancelledEmbed(pixPayment.amount, paymentId)] });

    } else if (paymentData.status === 'expired') {
        await PixPayment.findOneAndUpdate({ mercadoPagoId: paymentId }, { status: 'expired' });
        await sendDM(pixPayment.userId, { embeds: [buildDepositExpiredEmbed(pixPayment.amount, paymentId)] });
    }
}


export async function checkPendingPayments() {
    try {
        const pending = await PixPayment.find({ status: 'pending' });

        for (const payment of pending) {
            const ageMinutes = (Date.now() - payment.createdAt.getTime()) / 60_000;

            if (ageMinutes > 15) {
                await PixPayment.findByIdAndUpdate(payment._id, { status: 'expired' });
            } else {
                try {
                    await processPaymentWebhook(payment.mercadoPagoId);
                } catch { /* individual failure shouldn't stop the loop */ }
            }
        }
    } catch { /* silently ignore loop-level errors */ }
}
