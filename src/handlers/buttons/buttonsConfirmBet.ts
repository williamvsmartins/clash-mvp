import { Client, Interaction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { deleteChannel } from "../../deleteChannel";
import { pendingConfirmations } from "../handleButtonInteraction";


export const confirmacoes: Map<string, string[]> = new Map();

export const handleButtonsConfet = async (client : Client, interaction: Interaction, userId1: string, userId2: string,
     channel: TextChannel, message:Message) => {
   
        if(!interaction.isButton()) return;
        
        const mapConf = confirmacoes.get(channel.id);
        const confirmados = confirmacoes.get(channel.id)?.length;
        console.log(confirmados)

        if(interaction.customId === 'Aceitar' && confirmados!= null){
            if(!mapConf?.includes(interaction.user.id)){
                mapConf?.push(interaction.user.id)
            }
            if(confirmados < 2){
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('Aceitar')
                            .setLabel(`Confirmar [${confirmados}/2]`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('Cancel_inicio')
                            .setLabel('Cancelar')
                            .setStyle(ButtonStyle.Danger)
                    );

                await interaction.update({ components: [row] });
            } else{

                const confirmationDate = new Date();
                pendingConfirmations.set(channel.id, {
                    user1: userId1,
                    user2: userId2,
                    channel: channel,
                    message: message,
                    date: confirmationDate
                });

                await channel.send(`Ambos jogadores confirmaram a aposta`)
                await message.delete()
                await channel.send(`Por favor, algum dos dois jogadores envie o convite de amizade para a sua partida escolhida`)
            }

        } else if (interaction.customId === 'Cancel_inicio') {
            await channel.send(`Aposta cancelada`);
            deleteChannel(channel);
        }
}