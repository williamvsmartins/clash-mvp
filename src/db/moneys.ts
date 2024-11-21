import { Transaction, User } from "./database";
import { saveNotion } from "../notion/notion";


export const deposito = async (id: string, valor: number) => {
    try{
        const user = await User.findOne({ userId: id });
        if(user){
            user.moedas += valor;
            
            await user.save();

            await Transaction.create({
                userId: id,
                type: 'depósito',
                amount: valor,
                description: 'Depósito realizado',
            });
        }
    } catch (error){
        console.log(error)
    }
}

export const saque = async (id: string, valor: number, pix: string) => {
    try{
        const user = await User.findOne({ userId: id });
        if(user){
            user.moedas -= valor;
            await user.save();

            await Transaction.create({
                userId: id,
                type: 'saque',
                amount: -valor,
                description: `Saque solicitado. PIX: ${pix || 'não informado'}`,
            });

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

            await Transaction.create({
                userId: userId1,
                type: 'desconto',
                amount: -valor,
                description: 'Desconto para partida',
            });

            await Transaction.create({
                userId: userId2,
                type: 'desconto',
                amount: -valor,
                description: 'Desconto para partida',
            });
        }
    } catch(error){
        console.log(error)
    }
}