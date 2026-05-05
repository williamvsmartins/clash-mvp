import { ApplicationCommandType, PermissionFlagsBits } from 'discord.js';
import { Command } from '#base';
import { configMainEmbed, configMainRow } from '#functions';

new Command({
    name: 'config',
    description: 'Abre o painel de configuração do bot',
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    dmPermission: false,
    async run(interaction) {
        await interaction.reply({
            embeds: [configMainEmbed()],
            components: [configMainRow()],
            ephemeral,
        });
    },
});
