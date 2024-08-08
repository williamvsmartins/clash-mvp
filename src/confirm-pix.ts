import axios from 'axios';
import config from '../config';

const { mercado_pago_token } = config;

export const confirmPay = async (id : String, interaction: any) => {
    try{
        const response = await axios.get(
            `https://api.mercadopago.com/v1/payments/${id}`, {
                headers: {
                    Authorization: `Bearer ${mercado_pago_token}`
                  }
            }
        )

        console.log(response.data)

        if(response.data.status === "aproved"){
            interaction.reply({ content: `Pagamento aprovado com sucesso!!` })
        } else{
            console.log("não aprovado")
        }
    } catch (error){
        console.log(error)
    }
}

export const paymentChack = (id : String, interaction: any, checkInterval: number = 5000, maxChecks: number = 12) => {
    let checkCount = 0;
    const checkIntervalId = setInterval(async () => {
        if (checkCount >= maxChecks) {
            clearInterval(checkIntervalId);
            console.log("Tempo de espera expirado");
            await interaction.followUp({ content: 'O pagamento não foi confirmado a tempo.', ephemeral: true });
        } else {
            await confirmPay(id, interaction);
            checkCount++;
        }
    }, checkInterval);
}