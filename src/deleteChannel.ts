import { TextChannel } from "discord.js";

export const deleteChannel = async (channel: TextChannel) => {
    try{
        channel.send(`O canal será excluído em 5 segundos...`)
        await new Promise(resolve => setTimeout(resolve, 5000));
        await channel.delete();
    } catch(error){
        console.log(error)
    }
}