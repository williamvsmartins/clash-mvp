import axios from 'axios';
import { Responder, ResponderType } from '#base';
import { User } from '#database';
import { env } from '#settings';
import { getGuildConfig } from '#functions';

new Responder({
    customId: 'clash_tag_modal',
    type: ResponderType.Modal,
    cache: 'cached',
    async run(interaction) {
        let clashTag = interaction.fields.getTextInputValue('clashTag');
        const userId = interaction.user.id;
        const guild = interaction.guild;

        if (clashTag.startsWith('#')) {
            clashTag = clashTag.slice(1);
        }

        clashTag = clashTag.toUpperCase();

        try {
            await axios.get(`https://proxy.royaleapi.dev/v1/players/%23${clashTag}`, {
                headers: { 'Authorization': `Bearer ${env.API_TOKEN}` },
            });

            await User.updateOne(
                { userId },
                { clashTag, moedas: 0.0 },
                { upsert: true },
            );

            await interaction.reply({
                content: `Tag do Clash Royale ${clashTag} validada e salva com sucesso!`,
                ephemeral: true
            });

            if (guild) {
                const config = await getGuildConfig(guild.id);
                if (config.roleRegistered) {
                    const role = guild.roles.cache.find(r => r.id === config.roleRegistered);
                    if (role) {
                        const member = guild.members.cache.get(userId);
                        if (member) await member.roles.add(role);
                    }
                }
            }
        } catch (error) {
            await interaction.reply({
                content: `Falha ao validar a tag do Clash Royale: ${error}`,
                ephemeral: true
            });
        }
    }
});
