import { Client, Interaction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { deleteChannel } from "./deleteChannel";
import { embedConf } from "./embed-Confirm-Cancel";
import { handleButtonsCon } from "./buttonsConfirmCancel";

let confirmados = 0

export const handleButtonsConfet = async (client : Client, userId1: string, userId2: string,
     channel: TextChannel, message:Message) => { //falta adicionar os ids das transacoes para reembolso em cancelar
    client.on('interactionCreate', async (interaction: Interaction) => {
        if(!interaction.isButton()) return;

        if(interaction.customId === 'Aceitar'){
            confirmados+=1;
            if(confirmados < 2){
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('Aceitar')
                            .setLabel(`Confirmar [${confirmados}/2]`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('Cancelar')
                            .setLabel('Cancelar')
                            .setStyle(ButtonStyle.Danger)
                    );

                await interaction.update({ components: [row] });
            } else{
                await channel.send(`Ambos jogadores confirmaram a aposta`)
                await message.delete()
                await channel.send(`Por favor, algum dos dois jogadores envie o convite de amizade para a sua partida escolhida`)
                
                client.on('messageCreate', async (msg: Message) => {
                    if (msg.channel.id === channel.id) {
                        if (msg.author.id === userId1 || msg.author.id === userId2) {
                            if (msg.content.includes('https://link.clashroyale.com/invite/friend/')) {
                                await channel.send(embedConf(msg.content));
                                handleButtonsCon(client, userId1, userId2, channel, new Date())
                            }
                        }
                    }
                });
            }

        } else if (interaction.customId === 'Cancel_inicio') {
            await channel.send(`Aposta cancelada`);
            deleteChannel(channel);
            
        }
    });
}