import { Client, Interaction, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { validMatch } from "../../validateMatch";
import { deleteChannel } from "../../deleteChannel";

export const handleButtonsCon = async (client : Client, interaction: Interaction, userId1: string, userId2: string,
     channel: TextChannel, dateChannel: Date) => { //falta adicionar os ids das transacoes para reembolso em cancelar
    
    if(!interaction.isButton()) return;

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
        } else{
            channel.send(`erro ao confirmar a partida`);
            // await interaction.update({ components: [rowEnable] })
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
    }
}