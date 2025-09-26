import { Command } from "#base";
import { reply } from "#functions";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } from "discord.js";

new Command({
    name: "limpar_fila",
    description: "Remove todos os jogadores de uma fila específica",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: "canal",
            description: "Canal onde está a fila para limpar",
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
        {
            name: "mensagem_id",
            description: "ID da mensagem da fila (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction) {
        const { options } = interaction;
        const channel = options.getChannel("canal", true, [ChannelType.GuildText]);
        const messageId = options.getString("mensagem_id");

        try {
            if (messageId) {
                // Limpar fila específica
                const message = await channel.messages.fetch(messageId);
                if (message.embeds.length > 0) {
                    const embed = message.embeds[0];
                    if (embed.title?.includes("Fila de Competição")) {
                        const valueField = embed.fields.find(field => field.name === "Valor");
                        if (valueField) {
                            const [amountPay, amountReceive] = valueField.value.split(" / ").map(v => v.trim().replace("R$ ", ""));
                            const { betMenu } = await import("#functions");
                            const { embeds, components } = betMenu(amountPay, amountReceive, []);

                            await message.edit({ embeds, components });

                            reply.success({
                                interaction,
                                text: `Fila limpa com sucesso em ${channel}!`
                            });
                            return;
                        }
                    }
                }

                reply.danger({
                    interaction,
                    text: "Mensagem não é uma fila de apostas válida!"
                });
                return;
            }

            // Limpar todas as filas do canal
            const messages = await channel.messages.fetch({ limit: 50 });
            let clearedCount = 0;

            for (const message of messages.values()) {
                if (message.embeds.length > 0) {
                    const embed = message.embeds[0];
                    if (embed.title?.includes("Fila de Competição")) {
                        const valueField = embed.fields.find(field => field.name === "Valor");
                        if (valueField) {
                            const [amountPay, amountReceive] = valueField.value.split(" / ").map(v => v.trim().replace("R$ ", ""));
                            const { betMenu } = await import("#functions");
                            const { embeds, components } = betMenu(amountPay, amountReceive, []);

                            await message.edit({ embeds, components });
                            clearedCount++;
                        }
                    }
                }
            }

            if (clearedCount > 0) {
                reply.success({
                    interaction,
                    text: `${clearedCount} fila(s) limpa(s) com sucesso em ${channel}!`
                });
            } else {
                reply.primary({
                    interaction,
                    text: "Nenhuma fila de apostas encontrada neste canal."
                });
            }
        } catch (error) {
            reply.danger({
                interaction,
                text: "Erro ao limpar filas. Verifique se o bot tem permissões para editar mensagens no canal."
            });
        }
    }
});
