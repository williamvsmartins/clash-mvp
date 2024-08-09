import axios from 'axios';
import config from '../config';



const { mercado_pago_token } = config;

export const confirmPay = async (id: string, interaction: any) => {
    try {
        const response = await axios.get(
            `https://api.mercadopago.com/v1/payments/${id}`, 
            {
                headers: {
                    Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`
                }
            }
        );

        console.log(response.data.status);

        return response.data.status;
    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        // interaction.reply({ content: `Erro ao confirmar pagamento: ${error.message}` });
    }
};

export const paymentChack = (id : string, interaction: any, checkInterval: number = 5000, maxChecks: number = 12) => {
    let checkCount = 0;
    const checkIntervalId = setInterval(async () => {
        if (checkCount >= maxChecks) {
            clearInterval(checkIntervalId);
            console.log("Tempo de espera expirado");
            await interaction.followUp({ content: 'O pagamento não foi confirmado a tempo.', ephemeral: true });
        } else {
            const status = await confirmPay(id, interaction);
            
            if (status === "approved") {
                clearInterval(checkIntervalId);
                await interaction.followUp({ content: 'Pagamento aprovado com sucesso!', ephemeral: true });
            } else if (status === "error") {
                clearInterval(checkIntervalId);
                await interaction.followUp({ content: 'Houve um erro ao verificar o pagamento.', ephemeral: true });
            }
            
            checkCount++;
        }
    }, checkInterval);
}