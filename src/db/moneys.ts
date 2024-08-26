import { User } from "./database";
import { saveNotion } from "../notion/notion";
import { paymentPix } from "../payments/payment";


export const deposito = async (id: string, valor: number) => {
    try{
        const user = await User.findOne({ userId: id });
        if(user){
            user.moedas += valor;
            await user.save();
        }
    } catch (error){
        console.log(error)
    }
}

export const saque = async (id: string, valor: number) => {
    try{
        const user = await User.findOne({ userId: id });
        if(user){
            user.moedas -= valor;
            await user.save();
            const pix = user.pix;

            await saveNotion(id ,pix || 'pix nao informado', valor);
        }
    } catch(error){
        console.log(error)
    }
}

export const descontoPartida = async (userId1: string, userId2: string, valor: number) => {
    try{
        const user1 = await User.findOne({ userId: userId1 });
        const user2 = await User.findOne({ userId: userId2 });
        if(user1 && user2){
            user1.moedas -= valor;
            user2.moedas -= valor;
            await user1.save();
            await user2.save();
        }
    } catch(error){
        console.log(error)
    }
}