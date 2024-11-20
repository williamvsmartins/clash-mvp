import { Client, EmbedBuilder } from "discord.js";

export const nextStepEmbed = (client: Client) => {
    return new EmbedBuilder()
    .setColor("Blue")
    .setTitle("📩 Próximos Passos")
    .setDescription(
        `**Por favor, um dos jogadores envie o convite de amizade para iniciar a partida.**\n\n` +
        `A partida só será iniciada após o envio do convite de amizade. Boa sorte!`
    )
    .setFooter({ text: "BetClash" });
}