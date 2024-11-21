import { EmbedBuilder } from "discord.js";

export const confirmationEmbed = (price: number, userId1: string, userId2: string) => {
    return new EmbedBuilder()
    .setColor("Green")
    .setTitle("Aposta Confirmada 🎉")
    .setDescription(
        `Ambos jogadores confirmaram a aposta!\n\nO valor da aposta foi debitado das carteiras.\nBoa sorte aos jogadores!`
    )
    .addFields(
        { name: "Valor da Aposta", value: `R$ ${(price / 100).toFixed(2).replace('.', ',')}`, inline: true },
        { name: "Jogador 1", value: `<@${userId1}>`, inline: true },
        { name: "Jogador 2", value: `<@${userId2}>`, inline: true }
    )
    .setTimestamp();
}