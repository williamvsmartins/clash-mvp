import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,Interaction } from 'discord.js'

export const embedConfPlay = (price: number) => {
    const embed = new EmbedBuilder()
        .setColor('#2f3136') // Cor do card
        .setTitle('Aguardando Jogadores') // Título do card
        .setDescription(`Valor da aposta: ${price} \n Vencedor recebe: ${(price-0.1)*2}`) // Descrição com o formato e valor
        .setThumbnail('https://i.ytimg.com/vi/uWsQ5IWVilM/maxresdefault.jpg')
        .setFooter({ text: 'BetClash' }); // Rodapé do card
    
    // Criação dos Botões
    const botaoEntrar = new ButtonBuilder()
        .setCustomId('Aceitar')
        .setLabel('Confirmar Aposta [0/2]')
        .setStyle(ButtonStyle.Primary);

    const botaoSair = new ButtonBuilder()
        .setCustomId('Cancel_inicio')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Danger);

    // Criação de uma Action Row contendo os botões
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(botaoEntrar, botaoSair);

    // Retorna o embed junto com os botões
    return { embeds: [embed], components: [actionRow] };
}