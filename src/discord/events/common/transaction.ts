import { Event } from "#base";
import { createEmbed } from "@magicyan/discord";
import { Events, ChannelType, Message } from "discord.js";
import { db } from "#database";

export default new Event({
    name: "Log de Criação de Fila",
    event: Events.MessageCreate,
    async run(message: Message) {
        if (message.author.bot) return;

        if (message.embeds.length === 0) return;

        const embed = message.embeds[0];
        if (!embed.title?.includes("Fila de Competição")) return;

        const guild = message.guild;
        if (!guild) return;

        try {
            const guildData = await db.guilds.get(guild.id);
            const logsChannelInfo = guildData.channels?.logs;

            if (!logsChannelInfo?.id) return;

            const channel = guild.channels.cache.get(logsChannelInfo.id);
            if (!channel || channel.type !== ChannelType.GuildText) return;

            const logEmbed = createEmbed({
                color: "Primary",
                title: "🎮 Nova Fila de Apostas Criada",
                description: `**Canal:** ${message.channel}\n**Criado por:** ${message.author}\n**Valor:** ${embed.fields.find(f => f.name === "Valor")?.value || "N/A"}`,
                timestamp: new Date().toISOString(),
                footer: { text: "Clash Bet - Sistema de Logs" }
            });

            await channel.send({ embeds: [logEmbed] });
        } catch (error) {
            console.error("Erro ao enviar log de transação:", error);
        }
    }
});