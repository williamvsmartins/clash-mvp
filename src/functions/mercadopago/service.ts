import { MercadoPagoConfig, Payment } from 'mercadopago';
import { env } from '#settings';

const client = new MercadoPagoConfig({
    accessToken: env.MERCADO_PAGO_TOKEN,
});

const payment = new Payment(client);

export interface PixPaymentResponse {
    id: number;
    status: string;
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl: string;
}

export async function createPixPayment(
    amountCents: number,
    name: string,
    userId: string,
    description: string = 'Depósito'
): Promise<PixPaymentResponse> {
    const amountReais = amountCents / 100;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const body = {
        transaction_amount: amountReais,
        description,
        payment_method_id: 'pix',
        date_of_expiration: expiresAt.toISOString(),
        payer: {
            email: env.MERCADO_PAGO_PAYER_EMAIL,
            first_name: name,
            last_name: 'User',
            identification: {
                type: 'CPF',
                number: env.MERCADO_PAGO_PAYER_CPF,
            },
        },
        metadata: {
            discord_user_id: userId,
        },
    };

    const response = await payment.create({ body });

    if (!response.point_of_interaction?.transaction_data) {
        throw new Error('Failed to generate PIX payment data');
    }

    return {
        id: response.id!,
        status: response.status!,
        qrCode: response.point_of_interaction.transaction_data.qr_code!,
        qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64!,
        ticketUrl: response.point_of_interaction.transaction_data.ticket_url!,
    };
}

export async function getPayment(paymentId: number) {
    const response = await payment.get({ id: paymentId });
    return {
        id: response.id,
        status: response.status,
        statusDetail: response.status_detail,
        transactionAmount: response.transaction_amount,
        metadata: response.metadata,
    };
}
