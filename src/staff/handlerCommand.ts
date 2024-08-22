import { Client, Interaction } from "discord.js";
import { setupFixedMessage } from "./fixedMessage";
import { setupFixedMessageWalle } from "./fixed-message-wallet";
import { setupFixedMessageQueue } from "./fixed-message-queue";
import { setupFixedMessagePix } from "./fixed-message-pix";
import { fixedMessageSuport } from "./fixed-message-support";


export const handlerComandStaff = async (client: Client, interaction: Interaction) => {

    if(interaction.isCommand()){
        const id = interaction.commandName;

        if(id === 'registro') setupFixedMessage(client, interaction);
        else if(id === 'carteira') setupFixedMessageWalle(client, interaction);
        else if(id === 'fila')  setupFixedMessageQueue(client, interaction);
        else if(id === 'pix') setupFixedMessagePix(client, interaction);
        else if(id === 'support') fixedMessageSuport(client, interaction);
    }

}