import { Responder, ResponderType } from '#base';
import { getGuildConfig } from '#functions';
import {
    configChannelsEmbed,
    configChannelsRows,
    configFinancialEmbed,
    configFinancialRows,
    configMainEmbed,
    configMainRow,
    configOperationalEmbed,
    configOperationalRows,
    configRolesEmbed,
    configRolesRows,
} from '#functions';

new Responder({
    customId: 'config/menu',
    type: ResponderType.StringSelect,
    cache: 'cached',
    async run(interaction) {
        const category = interaction.values[0];
        const config = await getGuildConfig(interaction.guildId!);

        switch (category) {
            case 'channels':
                await interaction.update({
                    embeds: [configChannelsEmbed(config)],
                    components: configChannelsRows(),
                });
                break;
            case 'roles':
                await interaction.update({
                    embeds: [configRolesEmbed(config)],
                    components: configRolesRows(),
                });
                break;
            case 'financial':
                await interaction.update({
                    embeds: [configFinancialEmbed(config)],
                    components: configFinancialRows(),
                });
                break;
            case 'operational':
                await interaction.update({
                    embeds: [configOperationalEmbed(config)],
                    components: configOperationalRows(),
                });
                break;
        }
    },
});

new Responder({
    customId: 'config/back',
    type: ResponderType.Button,
    cache: 'cached',
    async run(interaction) {
        await interaction.update({
            embeds: [configMainEmbed()],
            components: [configMainRow()],
        });
    },
});
