import axios from 'axios';
import config from '../config';
import { TextChannel } from 'discord.js';



const { mercado_pago_token } = config;

export const confirmPay = async (id: string) => {
    try {
        const response = await axios.get(
            `https://api.mercadopago.com/v1/payments/${id}`, 
            {
                headers: {
                    Authorization: `Bearer ${process.env.mercado_pago_token}`
                }
            }
        );

        console.log(response.data.status);

        return response.data.status;
    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
    }
};

export const paymentChack = (id : string, channel: TextChannel, checkInterval: number = 5000, maxChecks: number = 60) => {
    console.log("Payment chack")
    let checkCount = 0;
    const checkIntervalId = setInterval(async () => {
        if (checkCount >= maxChecks) {
            clearInterval(checkIntervalId);
            console.log("Tempo de espera expirado");
            await channel.send({ content: 'O pagamento não foi confirmado a tempo.' });
        } else {
            const status = await confirmPay(id);
            
            if (status === "approved") {
                clearInterval(checkIntervalId);
                await channel.send({ content: `Pagamento ${id} aprovado com sucesso!` });
            } else if (status === "error") {
                clearInterval(checkIntervalId);
                await channel.send({ content: 'Houve um erro ao verificar o pagamento.' });
            }
            
            checkCount++;
        }
    }, checkInterval);
}