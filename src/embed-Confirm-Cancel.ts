import { Client, GatewayIntentBits,EmbedBuilder,
     ActionRowBuilder, ButtonBuilder, ButtonStyle,Interaction } from 'discord.js'

export const embedConf = () => {
    const embed = new EmbedBuilder()
        .setColor('#2f3136') // Cor do card
        .setTitle('Finalizar Aposta') // Título do card
        .setDescription('Finalizar -> realiza pagamento da aposta \n Cancelar -> estorna pagamento da aposta') // Descrição com o formato e valor
        // .setThumbnail('URL_DA_IMAGEM') // Thumbnail da imagem (substitua pelo link da imagem)
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