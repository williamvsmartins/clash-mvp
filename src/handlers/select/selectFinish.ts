import { Interaction, TextChannel } from "discord.js";
import { deleteChannel } from "../../match/deleteChannel";


export const selectFinish = async (interaction: Interaction) =>{

    if(!interaction.isStringSelectMenu()) return;

    interaction.deferUpdate()

    const channel = interaction.channel as TextChannel;
    
    channel.send(`Processo resolvido com sucesso!`)

    deleteChannel(channel);
}