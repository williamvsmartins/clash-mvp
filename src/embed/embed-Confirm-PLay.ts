import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,Interaction, AttachmentBuilder } from 'discord.js'
import path from 'path';

export const embedConfPlay = (price: number) => {

    const imagePath = path.join(__dirname, '../img/clashBet.jpg');
    const attachment = new AttachmentBuilder(imagePath);

    const embed = new EmbedBuilder()
        .setColor('#2f3136') // Cor do card
        .setTitle('Aguardando Jogadores') // Título do card
        // .setDescription(`Valor da aposta: ${price} \n Vencedor recebe: ${(price-0.1)*2}`) // Descrição com o formato e valor
        .setFields([
            { name: 'Valor da aposta:', value: `${price}` },
            { name: 'Vencedor recebe:', value: `${(price-0.1)*2}` }

        ])
        .setThumbnail('attachment://clashBet.jpg')
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
    return { embeds: [embed], components: [actionRow], files: [attachment] };
}