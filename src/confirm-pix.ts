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

export const paymentChack = async (id : string, channel: TextChannel, checkInterval: number = 5000, 
    maxChecks: number = 60):Promise<Boolean> => {
        let checkCount = 0;

        while (checkCount < maxChecks) {
          const status = await confirmPay(id);
      
          if (status === "approved") {
            await channel.send({ content: `Pagamento ${id} aprovado com sucesso!` });
            return true;
          } else if (status === "error") {
            await channel.send({ content: 'Houve um erro ao verificar o pagamento.' });
            return false;
          }
      
          checkCount++;
          await new Promise(resolve => setTimeout(resolve, checkInterval)); // Espera pelo intervalo definido antes de checar novamente
        }
      
        await channel.send({ content: 'O pagamento não foi confirmado a tempo.' });
        return false;
}