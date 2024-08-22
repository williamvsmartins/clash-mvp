import { Client, Interaction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { validMatch } from "../../match/validateMatch";
import { deleteChannel } from "../../match/deleteChannel";
import { Confirmation } from "../../db/database";

export const handleButtonsCon = async (client : Client, interaction: Interaction, userId1: string, userId2: string,
     channel: TextChannel, dateChannel: Date) => { 
    
    if(!interaction.isButton()) return;

    const channelId = channel.id;

    //  VERIFICAR O ERRO QUE ESTÁ DANDO AQUI AO TENTAR PEGAR O PRECO DO EMBED
    const priceString = interaction.message.embeds[0].data.fields![1].value; // pegando indefinido?
    const cleanedPriceString = priceString.replace(/[^\d,.-]/g, '').replace(',', '.'); 
    const price = parseFloat(cleanedPriceString);

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
        const confirmMatch = await validMatch(userId1, userId2, channel, dateChannel ,price);
        if(confirmMatch){
            deleteChannel(channel);
            try {
                const result = await Confirmation.deleteOne({ channelId });
                console.log('Documento deletado:', result);
            } catch (error) {
                console.error('Erro ao deletar documento:', error);
            }
        } else{
            channel.send(`erro ao confirmar a partida`);
            // await interaction.update({ components: [rowEnable] }) PROBLEMA AO REATIVAR A PARTIDA
        }

    } else if (interaction.customId === 'Cancelar') {
        await interaction.update({ components: [rowDesable] });

        const confirmMatch = await validMatch(userId1, userId2, channel, dateChannel, price);
        if(!confirmMatch){
            await channel.send(`Aposta canelada e pagamentos estornados com sucesso`);
            deleteChannel(channel);
        } else{
            channel.send(`Você clicou em finalizar a partida, mas identificamos que essa partida ocorreu, portanto pagamento efetuado ao vencedor!!!`);
            deleteChannel(channel);
        }

        try {
            const result = await Confirmation.deleteOne({ channelId });
            console.log('Documento deletado:', result);
        } catch (error) {
            console.error('Erro ao deletar documento:', error);
        }
    }
}