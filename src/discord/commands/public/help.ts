import { Command } from "#base";
import { reply } from "#functions";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";

new Command({
    name: "ajuda",
    description: "Mostra todos os comandos disponíveis do bot",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "categoria",
        description: "Categoria de comandos para mostrar",
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
            { name: "🎮 Apostas", value: "bets" },
            { name: "💰 Carteira", value: "wallet" },
            { name: "👑 Administração", value: "admin" },
            { name: "ℹ️ Informações", value: "info" }
        ]
    }],
    async run(interaction) {
        const { options } = interaction;
        const category = options.getString("categoria");

        const embed = createEmbed({
            author: createEmbedAuthor(interaction.client.user),
            color: "Primary",
            title: "🤖 Clash Bet - Comandos Disponíveis",
            thumbnail: { url: interaction.client.user.displayAvatarURL() }
        });

        if (!category) {
            // Mostrar todas as categorias
            embed.setDescription("Escolha uma categoria para ver os comandos específicos ou use `/ajuda <categoria>`");
            embed.addFields([
                {
                    name: "🎮 Apostas",
                    value: "Comandos relacionados ao sistema de apostas",
                    inline: true
                },
                {
                    name: "💰 Carteira",
                    value: "Comandos para gerenciar sua carteira",
                    inline: true
                },
                {
                    name: "👑 Administração",
                    value: "Comandos para administradores",
                    inline: true
                },
                {
                    name: "ℹ️ Informações",
                    value: "Comandos informativos e de ajuda",
                    inline: true
                }
            ]);
        } else {
            switch (category) {
                case "bets":
                    embed.setDescription("**🎮 Comandos de Apostas**");
                    embed.addFields([
                        {
                            name: "`/fila`",
                            value: "Cria uma nova fila de apostas (Admin)",
                            inline: false
                        },
                        {
                            name: "`/filas`",
                            value: "Lista todas as filas de apostas ativas",
                            inline: false
                        },
                        {
                            name: "`/limpar_fila`",
                            value: "Remove todos os jogadores de uma fila (Admin)",
                            inline: false
                        }
                    ]);
                    break;

                case "wallet":
                    embed.setDescription("**💰 Comandos de Carteira**");
                    embed.addFields([
                        {
                            name: "`/carteira [usuário]`",
                            value: "Verifica o saldo da sua carteira ou de outro usuário",
                            inline: false
                        },
                        {
                            name: "`/adicionar_moedas`",
                            value: "Adiciona moedas à carteira de um usuário (Admin)",
                            inline: false
                        },
                        {
                            name: "`/remover_moedas`",
                            value: "Remove moedas da carteira de um usuário (Admin)",
                            inline: false
                        }
                    ]);
                    break;

                case "admin":
                    embed.setDescription("**👑 Comandos de Administração**");
                    embed.addFields([
                        {
                            name: "`/fila`",
                            value: "Cria uma nova fila de apostas",
                            inline: false
                        },
                        {
                            name: "`/adicionar_moedas`",
                            value: "Adiciona moedas à carteira de um usuário",
                            inline: false
                        },
                        {
                            name: "`/remover_moedas`",
                            value: "Remove moedas da carteira de um usuário",
                            inline: false
                        },
                        {
                            name: "`/limpar_fila`",
                            value: "Remove todos os jogadores de uma fila",
                            inline: false
                        }
                    ]);
                    break;

                case "info":
                    embed.setDescription("**ℹ️ Comandos Informativos**");
                    embed.addFields([
                        {
                            name: "`/ajuda [categoria]`",
                            value: "Mostra todos os comandos disponíveis",
                            inline: false
                        },
                        {
                            name: "`/ping`",
                            value: "Verifica a latência do bot",
                            inline: false
                        },
                        {
                            name: "`/counter`",
                            value: "Comando de exemplo com contador",
                            inline: false
                        }
                    ]);
                    break;
            }
        }

        embed.setFooter({ text: "Clash Bet • Use /ajuda <categoria> para ver comandos específicos" });

        reply.success({
            interaction,
            embeds: [embed]
        });
    }
});
