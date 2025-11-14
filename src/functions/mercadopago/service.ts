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

export async function criarPagamentoPix(
    valor: number,
    name: string,
    userId: string,
    description: string = 'Depósito'
): Promise<PixPaymentResponse> {
    try {
        const valorReais = valor / 100;

        const dataExpiracao = new Date();
        dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 15);
        const dataExpiracaoISO = dataExpiracao.toISOString();

        const body = {
            transaction_amount: valorReais,
            description: description,
            payment_method_id: 'pix',
            date_of_expiration: dataExpiracaoISO,
            payer: {
                email: `alyssonpereira41@gmail.com`,
                first_name: name,
                last_name: 'User',
                identification: {
                    type: 'CPF',
                    number: '42501886046',
                },
            },
            metadata: {
                discord_user_id: userId,
            },
        };

        const response = await payment.create({ body });
        console.log('Resposta do Mercado Pago ao criar pagamento PIX:', response);

        if (!response.point_of_interaction?.transaction_data) {
            throw new Error('Falha ao gerar dados do PIX');
        }

        return {
            id: response.id!,
            status: response.status!,
            qrCode: response.point_of_interaction.transaction_data.qr_code!,
            qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64!,
            ticketUrl: response.point_of_interaction.transaction_data.ticket_url!,
        };
    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
        throw error;
    }
}

export async function consultarPagamento(paymentId: number) {
    try {
        const response = await payment.get({ id: paymentId });
        return {
            id: response.id,
            status: response.status,
            statusDetail: response.status_detail,
            transactionAmount: response.transaction_amount,
            metadata: response.metadata,
        };
    } catch (error) {
        console.error('Erro ao consultar pagamento:', error);
        throw error;
    }
}
