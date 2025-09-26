import { Command } from "#base";
import { reply } from "#functions";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } from "discord.js";
import { db } from "#database";
import { settings } from "#settings";

new Command({
    name: "configurar",
    description: "Configura canais do bot no servidor",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: "canal_logs",
            description: "Canal para logs do sistema",
            type: ApplicationCommandOptionType.Channel,
            required: false
        },
        {
            name: "canal_geral",
            description: "Canal geral do servidor",
            type: ApplicationCommandOptionType.Channel,
            required: false
        }
    ],
    async run(interaction) {
        const { options, guild } = interaction;
        const logsChannel = options.getChannel("canal_logs", false, [ChannelType.GuildText]);
        const generalChannel = options.getChannel("canal_geral", false, [ChannelType.GuildText]);

        if (!guild) {
            reply.danger({
                interaction,
                text: "Este comando só pode ser usado em servidores!"
            });
            return;
        }

        try {
            const guildData = await db.guilds.get(guild.id);

            if (logsChannel) {
                guildData.channels = guildData.channels || {};
                guildData.channels.logs = {
                    id: logsChannel.id,
                    url: logsChannel.url
                };
            }

            if (generalChannel) {
                if (generalChannel.type !== ChannelType.GuildText) {
                    reply.danger({ interaction, text: "O canal geral deve ser um canal de texto." });
                    return;
                }
                guildData.channels = guildData.channels || {};
                guildData.channels.general = {
                    id: generalChannel.id,
                    url: generalChannel.url
                };
            }

            await guildData.save();

            const embed = createEmbed({
                color: settings.colors.success,
                title: "⚙️ Configuração Atualizada",
                description: "As configurações do servidor foram atualizadas com sucesso!",
                fields: [
                    {
                        name: "📝 Canal de Logs",
                        value: logsChannel ? `${logsChannel}` : "Não configurado",
                        inline: true
                    },
                    {
                        name: "💬 Canal Geral",
                        value: generalChannel ? `${generalChannel}` : "Não configurado",
                        inline: true
                    }
                ],
                footer: { text: "Clash Bet" }
            });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            reply.danger({
                interaction,
                text: "Erro ao salvar configurações. Tente novamente mais tarde."
            });
        }
    }
});
