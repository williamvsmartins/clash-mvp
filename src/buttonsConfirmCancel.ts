import { Client, Interaction, TextChannel } from "discord.js";
import { validMatch } from "./validateMatch";

export const handleButtonsCon = async (client : Client, userId1: string, userId2: string, channel: TextChannel, dateChannel: Date) => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if(!interaction.isButton()) return;

        if(interaction.customId === 'Finalizar'){
            await validMatch(userId1, userId2, channel, dateChannel);

        } else if (interaction.customId === 'Cancelar') {

            await interaction.reply({ content: 'Aposta cancelada e pagamento estornado!', ephemeral: true });
            
        }
    });
}