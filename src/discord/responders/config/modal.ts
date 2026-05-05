import { Responder, ResponderType } from '#base';
import { getGuildConfig, setGuildConfigField, FIELD_META } from '#functions';
import {
    configChannelsEmbed,
    configChannelsRows,
    configFinancialEmbed,
    configFinancialRows,
    configOperationalEmbed,
    configOperationalRows,
    configRolesEmbed,
    configRolesRows,
} from '#functions';
import { GuildConfigField } from '#functions';

const FIELD_CATEGORY: Record<string, 'channels' | 'roles' | 'financial' | 'operational'> = {
    channelQueue:   'channels',
    channelAlerts:  'channels',
    channelSupport: 'channels',
    roleRegistered: 'roles',
    roleStaff:      'roles',
    roleAvailable:  'roles',
    depositFee:       'financial',
    queueWaitMinutes: 'operational',
};

new Responder({
    customId: 'config/modal/:field',
    type: ResponderType.Modal,
    cache: 'cached',
    async run(interaction, params) {
        const field = params?.field as GuildConfigField | undefined;
        if (!field || !(field in FIELD_META)) {
            await interaction.reply({ content: 'Campo inválido.', ephemeral });
            return;
        }

        const rawValue = interaction.fields.getTextInputValue('value').trim();
        const meta = FIELD_META[field];

        let parsedValue: string | number = rawValue;
        if (meta.isNumber) {
            const num = Number(rawValue);
            if (isNaN(num) || num < 0) {
                await interaction.reply({
                    content: `Valor inválido para **${meta.label}**. Insira um número positivo.`,
                    ephemeral,
                });
                return;
            }
            parsedValue = num;
        }

        await setGuildConfigField(interaction.guildId!, field, parsedValue);
        const config = await getGuildConfig(interaction.guildId!);

        const category = FIELD_CATEGORY[field];
        let embed, rows;

        switch (category) {
            case 'channels':
                embed = configChannelsEmbed(config);
                rows  = configChannelsRows();
                break;
            case 'roles':
                embed = configRolesEmbed(config);
                rows  = configRolesRows();
                break;
            case 'financial':
                embed = configFinancialEmbed(config);
                rows  = configFinancialRows();
                break;
            case 'operational':
                embed = configOperationalEmbed(config);
                rows  = configOperationalRows();
                break;
        }

        await interaction.reply({
            content: `✅ **${meta.label}** atualizado com sucesso!`,
            embeds: [embed!],
            components: rows!,
            ephemeral,
        });
    },
});
