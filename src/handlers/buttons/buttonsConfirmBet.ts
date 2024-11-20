import { Client, Interaction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { deleteChannel } from "../../match/deleteChannel";
import { descontoPartida } from "../../db/moneys";
import { Confirmation } from "../../db/database";
import { confirmationEmbed } from "../../embed/embed-confirmation-play";
import { nextStepEmbed } from "../../embed/next-step-embed";

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

            const priceString = interaction.message.embeds[0].data.fields![0].value;
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
                const channelId = channel.id;
                const messageId = message.id;
                
                await Confirmation.updateOne(
                    { channelId },
                    { user1: userId1, user2: userId2, messageId, date: confirmationDate, price },
                    { upsert: true }
                );

                await descontoPartida(userId1, userId2, price);
                await message.delete();
                confirmacoes.delete(channel.id);

                await channel.send({ embeds: [confirmationEmbed(price, userId1, userId2)] });

                await channel.send({ embeds: [nextStepEmbed(client)] });
            }
        } else {
            await interaction.reply({ content: "Você já confirmou a aposta.", ephemeral: true });
        }
    } else if (interaction.customId === 'Cancel_inicio') {
        if (!interaction.replied && !interaction.deferred) {
            await interaction.deferUpdate();
        }
        await channel.send(`Aposta cancelada`);
        // Cancelar o temporizador se ambos confirmarem
        clearTimeout((channel as any).timeout as NodeJS.Timeout);
        deleteChannel(channel);
    }
};