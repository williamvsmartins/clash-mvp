import { Command } from "#base";
import { reply } from "#functions";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";
import { db } from "#database";

new Command({
    name: "estatisticas",
    description: "Mostra estatísticas do servidor e do bot",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const { guild, client } = interaction;

        if (!guild) {
            reply.danger({
                interaction,
                text: "Este comando só pode ser usado em servidores!"
            });
            return;
        }

        try {
            // Buscar estatísticas do banco de dados
            const totalMembers = await db.members.countDocuments({ guildId: guild.id });
            const membersWithCoins = await db.members.countDocuments({
                guildId: guild.id,
                "wallet.coins": { $gt: 0 }
            });

            // Calcular total de moedas em circulação
            const result = await db.members.aggregate([
                { $match: { guildId: guild.id } },
                { $group: { _id: null, totalCoins: { $sum: "$wallet.coins" } } }
            ]);
            const totalCoins = result[0]?.totalCoins || 0;

            // Buscar filas ativas
            const channels = guild.channels.cache.filter(channel =>
                channel.type === 0 // GuildText
            );

            let activeQueues = 0;
            for (const channel of channels.values()) {
                if (channel.type !== 0) continue;

                try {
                    const messages = await channel.messages.fetch({ limit: 20 });
                    for (const message of messages.values()) {
                        if (message.embeds.length > 0) {
                            const embed = message.embeds[0];
                            if (embed.title?.includes("Fila de Competição")) {
                                activeQueues++;
                            }
                        }
                    }
                } catch (error) {
                    // Ignorar erros de permissão
                    continue;
                }
            }

            const embed = createEmbed({
                author: createEmbedAuthor(client.user),
                color: "Primary",
                title: "📊 Estatísticas do Servidor",
                thumbnail: { url: guild.iconURL() || undefined },
                fields: [
                    {
                        name: "👥 Membros",
                        value: `**Total:** ${guild.memberCount}\n**Registrados:** ${totalMembers}\n**Com Moedas:** ${membersWithCoins}`,
                        inline: true
                    },
                    {
                        name: "💰 Economia",
                        value: `**Moedas em Circulação:** ${totalCoins.toLocaleString()}\n**Média por Membro:** ${totalMembers > 0 ? Math.round(totalCoins / totalMembers) : 0}`,
                        inline: true
                    },
                    {
                        name: "🎮 Atividade",
                        value: `**Filas Ativas:** ${activeQueues}\n**Canais:** ${guild.channels.cache.size}\n**Cargos:** ${guild.roles.cache.size}`,
                        inline: true
                    },
                    {
                        name: "🤖 Bot",
                        value: `**Uptime:** ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m\n**Ping:** ${client.ws.ping}ms\n**Servidores:** ${client.guilds.cache.size}`,
                        inline: true
                    }
                ],
                footer: { text: "Clash Bet • Estatísticas em tempo real" },
                timestamp: new Date().toISOString()
            });

            reply.success({
                interaction,
                embeds: [embed]
            });
        } catch (error) {
            reply.danger({
                interaction,
                text: "Erro ao buscar estatísticas. Tente novamente mais tarde."
            });
        }
    }
});
