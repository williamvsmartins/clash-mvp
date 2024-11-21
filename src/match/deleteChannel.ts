import { TextChannel } from "discord.js";

export const deleteChannel = async (channel: TextChannel) => {
    try{
        channel.send(`O canal será excluído em alguns segundos...`)
        await new Promise(resolve => setTimeout(resolve, 30000));
        await channel.delete();
    } catch(error){
        console.log(error)
        await channel.send("Erro ao deletar o canal, entre em contato com o suporte!")
    }
}