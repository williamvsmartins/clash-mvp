import axios from 'axios';
import config from '../../config';
import { Client, TextChannel } from 'discord.js';



const { mercado_pago_token } = config;

export const confirmPay = async (id: string) => {
    try {
        const response = await axios.get(
            `https://api.mercadopago.com/v1/payments/${id}`, 
            {
                headers: {
                    Authorization: `Bearer ${mercado_pago_token}`
                }
            }
        );

        return response.data.status;
    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
    }
};

export const paymentChack = async (client: Client, id : string, userId: string, checkInterval: number = 5000, 
    maxChecks: number = 60):Promise<Boolean> => {
        let checkCount = 0;
        const user = await client.users.fetch(userId);
        const dmChannel = await user.createDM();

        while (checkCount < maxChecks) {
          const status = await confirmPay(id);
      
          if (status === "approved") {
            if (user) {
                await dmChannel.send({
                  content: `Olá <@${userId}>, seu pagamento já foi aprovado`,
                });
            
                return true;
            }
          } else if (status === "error") {
            if (user) {
                await dmChannel.send({
                  content: `Olá <@${userId}>, seu pagamento teve problema ao ser aprovado`,
                });
            
                return false;
            }
            
          }
      
          checkCount++;
          await new Promise(resolve => setTimeout(resolve, checkInterval)); // Espera pelo intervalo definido antes de checar novamente
        }
      
        await dmChannel.send({
            content: `Olá <@${userId}>, você não fez o pagamento a tempo`,
          });
        return false;
}