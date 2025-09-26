import { Command } from "#base";
import { reply } from "#functions";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { db } from "#database";

new Command({
    name: "carteira",
    description: "Verifica o saldo da sua carteira",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "usuario",
        description: "Usuário para verificar a carteira (opcional)",
        type: ApplicationCommandOptionType.User,
        required: false
    }],
    async run(interaction) {
        const { member, options } = interaction;
        const targetUser = options.getUser("usuario") || member.user;
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

            const embed = createEmbed({
                author: createEmbedAuthor(targetUser),
                color: "Primary",
                title: "💰 Carteira",
                description: `**Saldo atual:** ${memberData.wallet?.coins || 0} moedas`,
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
                text: "Erro ao acessar a carteira. Tente novamente mais tarde."
            });
        }
    }
});
