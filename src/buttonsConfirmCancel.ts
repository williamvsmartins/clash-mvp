import { Client, Interaction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { validMatch } from "./validateMatch";
import { deleteChannel } from "./deleteChannel";
import { confirmPay } from "./confirm-pix";
import { reembolsoPix } from "./reembolso";

export const handleButtonsCon = async (client : Client, userId1: string, userId2: string,
     channel: TextChannel, dateChannel: Date) => { //falta adicionar os ids das transacoes para reembolso em cancelar
    client.on('interactionCreate', async (interaction: Interaction) => {
        if(!interaction.isButton()) return;

        const rowDesable = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Finalizar')
                    .setLabel('Finalizar')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('Cancelar')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
            );

            const rowEnable = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Finalizar')
                    .setLabel('Finalizar')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false),  // Reativando botão
                new ButtonBuilder()
                    .setCustomId('Cancelar')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(false)  // Reativando botão
            );

        if(interaction.customId === 'Finalizar'){
            await interaction.update({ components: [rowDesable] });
            const confirmMatch = await validMatch(userId1, userId2, channel, dateChannel);
            if(confirmMatch){
                deleteChannel(channel);
            } else{
                channel.send(`erro ao confirmar a partida`);
                await interaction.update({ components: [rowEnable] })
            }

        } else if (interaction.customId === 'Cancelar') {
            await interaction.update({ components: [rowDesable] });

            // const confirmId1 = confirmPay(idTransition1);
            // const confirmId2 = confirmPay(idTransition2);
            // if(confirmId1 === "approved"){
            //     reembolsoPix(idTransition1, channel);
            // } 
            // if(confirmId2 === "approved"){
                // reembolsoPix(idTransition2, channel);
            // } 


            await channel.send(`Aposta canelada e pagamentos estornados com sucesso`);
            deleteChannel(channel);
            
        }
    });
}