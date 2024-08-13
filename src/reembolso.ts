import axios from 'axios';
import config from '../config';
import { TextChannel } from 'discord.js';

const { mercado_pago_token } = config;

export const reembolsoPix = async (id: string, channel: TextChannel) => {
    channel.send(`id da transicao reemboolso ${id}`)
    try{
        const require = await axios.post(
            `https://api.mercadopago.com/v1/payments/${id}/refunds`,{} ,{
                headers: {
                    'Authorization': `Bearer ${mercado_pago_token}`,  
                    'Content-Type': 'application/json',
                }
            }
        )

        channel.send(`Reembolso realizado com sucesso ${require.data}`)

    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Erro ao tentar reembolsar:', error.response?.data);
            await channel.send(`Erro ao tentar reembolsar: ${error.response?.data?.message || 'Erro desconhecido'}`);
        } else {
            console.error('Erro desconhecido ao tentar reembolsar:', error);
            await channel.send(`Erro desconhecido ao tentar reembolsar.`);
        }
    }
}