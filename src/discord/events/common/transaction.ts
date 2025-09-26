import { Event } from "#base";
import { createEmbed } from "@magicyan/discord";
import { Events, ChannelType } from "discord.js";
import { db } from "#database";

export default new Event({
    name: Events.MessageCreate,
    async run(message) {
        // Verificar se a mensagem contém uma fila de apostas
        if (message.embeds.length === 0) return;

        const embed = message.embeds[0];
        if (!embed.title?.includes("Fila de Competição")) return;

        // Buscar canal de logs
        const guild = message.guild;
        if (!guild) return;

        try {
            const guildData = await db.guilds.get(guild.id);
            const logsChannel = guildData.channels?.logs;

            if (!logsChannel?.id) return;

            const channel = guild.channels.cache.get(logsChannel.id);
            if (!channel || channel.type !== ChannelType.GuildText) return;

            // Log da criação da fila
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
