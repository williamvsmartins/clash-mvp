import { Command } from "#base";
import { reply } from "#functions";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { db } from "#database";
import { settings } from "#settings";

new Command({
    name: "remover_moedas",
    description: "Remove moedas da carteira de um usuário",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: "usuario",
            description: "Usuário para remover moedas",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "quantidade",
            description: "Quantidade de moedas para remover",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 1
        },
        {
            name: "motivo",
            description: "Motivo para remover as moedas",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction) {
        const { options } = interaction;
        const targetUser = options.getUser("usuario", true);
        const amount = options.getInteger("quantidade", true);
        const reason = options.getString("motivo") || "Sem motivo especificado";

        const targetMember = interaction.guild?.members.cache.get(targetUser.id);
        if (!targetMember) {
            reply.danger({
                interaction,
                text: "Usuário não encontrado no servidor!"
            });
            return;
        }

        try {
            const memberData = await db.members.get({
                id: targetUser.id,
                guild: { id: interaction.guild!.id }
            });

            if (!memberData.wallet || memberData.wallet.coins < amount) {
                reply.danger({
                    interaction,
                    text: `O usuário não possui moedas suficientes! Saldo atual: ${memberData.wallet?.coins || 0}`
                });
                return;
            }

            const oldBalance = memberData.wallet.coins;
            memberData.wallet.coins -= amount;
            await memberData.save();

            const embed = createEmbed({
                author: createEmbedAuthor(targetUser),
                color: settings.colors.success,
                title: "💰 Moedas Removidas",
                description: `**Usuário:** ${targetUser}\n**Quantidade:** -${amount} moedas\n**Saldo anterior:** ${oldBalance}\n**Novo saldo:** ${memberData.wallet?.coins || 0}\n**Motivo:** ${reason}`,
                thumbnail: { url: targetUser.displayAvatarURL() },
                footer: { text: "Clash Bet" }
            });

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            reply.danger({
                interaction,
                text: "Erro ao remover moedas. Tente novamente mais tarde."
            });
        }
    }
});
