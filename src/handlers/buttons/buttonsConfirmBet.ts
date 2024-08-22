import { Client, Interaction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { deleteChannel } from "../../deleteChannel";
import { pendingConfirmations } from "../handleButtonInteraction";
import { descontoPartida } from "../../moneys";

export const confirmacoes: Map<string, string[]> = new Map();

export const handleButtonsConfet = async (
    client: Client,
    interaction: Interaction,
    userId1: string,
    userId2: string,
    channel: TextChannel,
    message: Message
) => {
    if (!interaction.isButton()) return;

    const mapConf = confirmacoes.get(channel.id) || [];
    
    if (interaction.customId === 'Aceitar') {
        if (!mapConf.includes(interaction.user.id)) {
            mapConf.push(interaction.user.id);
            confirmacoes.set(channel.id, mapConf);

            const confirmados = mapConf.length;

            const priceString = interaction.message.embeds[0].data.fields![0].value; // pegando indefinido?
            const cleanedPriceString = priceString.replace(/[^\d,.-]/g, '').replace(',', '.');
            const price = parseFloat(cleanedPriceString);

            if (confirmados < 2) {
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
            } else {

                // Cancelar o temporizador se ambos confirmarem
                clearTimeout((channel as any).timeout as NodeJS.Timeout);

                const confirmationDate = new Date();
                pendingConfirmations.set(channel.id, {
                    user1: userId1,
                    user2: userId2,
                    channel: channel,
                    message: message,
                    date: confirmationDate,
                    price: price,
                });

                await descontoPartida(userId1, userId2, price);
                await channel.send(`Ambos jogadores confirmaram a aposta \n O valor da aposta já foi debitado
                    das carteiras, boa sorte aos jogadores`);

                await message.delete();
                await channel.send(`Por favor, algum dos dois jogadores envie o convite de amizade 
                    para a sua partida escolhida\n A partida só será iniciada após o envio do convite de amizade!!!`);
                confirmacoes.delete(channel.id);
            }
        } else {
            await interaction.reply({ content: "Você já confirmou a aposta.", ephemeral: true });
        }
    } else if (interaction.customId === 'Cancel_inicio') {
        await channel.send(`Aposta cancelada`);
        deleteChannel(channel);
    }
};