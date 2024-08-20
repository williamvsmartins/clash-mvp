import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,Interaction } from 'discord.js'

export const embedConf = (link:string, value:number) => {
    const embed = new EmbedBuilder()
        .setColor('#2f3136') // Cor do card
        .setTitle('Partida iniciada') // Título do card
        .setDescription('Ao final da partida aperte o botao de finalizada') // Descrição com o formato e valor
        .setFields([
            { name: 'Link que convite', value: link },
            { name: 'Valor da aposta', value: `${value}` },
            { name: 'Finalizar', value: 'Finaliza a partida e realiza o pagamento em moedas' },
            { name: 'Cancelar', value: 'Cancela a aposta se ainda não tiver ocorrido a partida' }

        ])
        .setThumbnail('https://i.ytimg.com/vi/uWsQ5IWVilM/maxresdefault.jpg')
        .setFooter({ text: 'Clash Apostas' }); // Rodapé do card
    
    // Criação dos Botões
    const botaoEntrar = new ButtonBuilder()
        .setCustomId('Finalizar')
        .setLabel('Finalizar Aposta')
        .setStyle(ButtonStyle.Primary);

    const botaoSair = new ButtonBuilder()
        .setCustomId('Cancelar')
        .setLabel('Cancelar Aposta')
        .setStyle(ButtonStyle.Danger);

    // Criação de uma Action Row contendo os botões
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(botaoEntrar, botaoSair);

    // Retorna o embed junto com os botões
    return { embeds: [embed], components: [actionRow] };
}