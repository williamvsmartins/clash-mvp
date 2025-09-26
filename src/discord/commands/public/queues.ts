import { Command } from "#base";
import { reply } from "#functions";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ChannelType } from "discord.js";

new Command({
    name: "filas",
    description: "Lista todas as filas de apostas ativas",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const { guild } = interaction;

        if (!guild) {
            reply.danger({
                interaction,
                text: "Este comando só pode ser usado em servidores!"
            });
            return;
        }

        try {
            // Buscar mensagens com embeds que contenham "Fila de Competição"
            const channels = guild.channels.cache.filter(channel =>
                channel.type === ChannelType.GuildText
            );

            const activeQueues = [];

            for (const channel of channels.values()) {
                if (channel.type !== ChannelType.GuildText) continue;

                try {
                    const messages = await channel.messages.fetch({ limit: 50 });

                    for (const message of messages.values()) {
                        if (message.embeds.length > 0) {
                            const embed = message.embeds[0];
                            if (embed.title?.includes("Fila de Competição")) {
                                const playersField = embed.fields.find(field => field.name === "Jogadores");
                                const valueField = embed.fields.find(field => field.name === "Valor");

                                if (playersField && valueField) {
                                    const playerCount = playersField.value === "Nenhum jogador na fila" ? 0 :
                                        playersField.value.split("\n").filter(p => p.trim()).length;

                                    activeQueues.push({
                                        channel: channel.name,
                                        value: valueField.value,
                                        players: playerCount,
                                        url: message.url
                                    });
                                }
                            }
                        }
                    }
                } catch (error) {
                    // Ignorar erros de permissão
                    continue;
                }
            }

            if (activeQueues.length === 0) {
                reply.info({
                    interaction,
                    text: "Não há filas de apostas ativas no momento."
                });
                return;
            }

            const embed = createEmbed({
                color: "Primary",
                title: "🎮 Filas de Apostas Ativas",
                description: `Encontradas ${activeQueues.length} fila(s) ativa(s):`,
                fields: activeQueues.map((queue, index) => ({
                    name: `#${index + 1} - ${queue.channel}`,
                    value: `**Valor:** ${queue.value}\n**Jogadores:** ${queue.players}/2\n[Ver Fila](${queue.url})`,
                    inline: true
                })),
                footer: { text: "Clash Bet" }
            });

            reply.success({
                interaction,
                embeds: [embed]
            });
        } catch (error) {
            reply.danger({
                interaction,
                text: "Erro ao buscar filas ativas. Tente novamente mais tarde."
            });
        }
    }
});
