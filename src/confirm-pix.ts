import axios from 'axios';
import config from '../config';

const { mercado_pago_token } = config;

export const confirmPay = async (id : String) => {
    try{
        const response = await axios.get(
            `https://api.mercadopago.com/v1/payments/${id}`, {
                headers: {
                    Authorization: `Bearer ${mercado_pago_token}`
                  }
            }
        )

        if(response.data.status === "aproved"){
            console.log("aprovado")
        } else{
            console.log("não aprovado")
        }
    } catch (error){
        console.log(error)
    }
}