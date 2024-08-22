import axios from "axios";
import config from '../../config';
import { v4 } from 'uuid'

const { mercado_pago_token } = config;

export const paymentPix = async (valor: number, pix: string): Promise<void> => {
    const idempotencyKey = v4();
    try{
        const transferData = {
            transaction_amount: valor,
            payment_method_id: 'pix',
            payer: {
                email: 'alyssonpereira41@gmail.com',
            },
            additional_info: {
                items: [
                    {
                        title: 'Transferência via Pix',
                        quantity: 1,
                        unit_price: valor
                    }
                ]
            }
        };

        const response = await axios.post(
            'https://api.mercadopago.com/v1/payments',
            transferData,
            {
                headers: {
                    'Authorization': `Bearer ${mercado_pago_token}`,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': idempotencyKey
                }
            }
        );

    } catch(error){
        if (axios.isAxiosError(error)) {
            console.error('Erro ao realizar transferência:', error.response?.data || error.message);
        } else {
            console.error('Erro desconhecido:', error);
        }
    }
}