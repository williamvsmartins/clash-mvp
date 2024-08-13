import { Client, Interaction } from "discord.js";
import { paymentPix } from "./payment";

export const handleButtonsCon = async (client : Client) => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if(!interaction.isButton()) return;

        if(interaction.customId === 'Finalizar'){
            await paymentPix(0.01, 'alyssonpereira41@gmail.com')
            await interaction.reply({ content: 'Aposta finalizada e pagamento realizado!', ephemeral: true });
        } else if (interaction.customId === 'Cancelar') {
            // Lógica para o botão "Cancelar Aposta"
            await interaction.reply({ content: 'Aposta cancelada e pagamento estornado!', ephemeral: true });
            // Aqui você pode adicionar a lógica para estornar o pagamento, como chamar uma função de reembolso
        }
    });
}