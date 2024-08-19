import { User } from "./database";
import { saveNotion } from "./notion";


export const deposito = async (id: string, valor: number) => {
    try{
        const user = await User.findOne({ userId: id });
        if(user){
            user.moedas += valor;
            await user.save();
            console.log(user.moedas)
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
            await saveNotion(id, user.pix || 'pix nao informado', valor);
            console.log('valor sacado com sucesso')
        }
    } catch(error){
        console.log(error)
    }
}