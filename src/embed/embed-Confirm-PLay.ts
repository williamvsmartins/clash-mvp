import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,Interaction, AttachmentBuilder } from 'discord.js'
import config from '../../config';

export const embedConfPlay = (price: number) => {

    const { rate } = config

    const rateNumber = Number(rate)

    const embed = new EmbedBuilder()
        .setColor('#2f3136') // Cor do card
        .setTitle('Aguardando Jogadores') // Título do card
        // .setDescription(`Valor da aposta: ${price} \n Vencedor recebe: ${(price-0.1)*2}`) // Descrição com o formato e valor
        .setFields([
            { name: 'Valor da aposta:', value: `${price}` },
            { name: 'Vencedor recebe:', value: `${(price-rateNumber)*2}` }

        ])
        .setThumbnail('https://cdn.discordapp.com/attachments/1276274460449575021/1276275081722593359/clashBet.jpg?ex=66cd8c8b&is=66cc3b0b&hm=6ca1520b66b10483a7355663e4fa8b16a4549cfb3731289576d170ad858f12d8&')
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