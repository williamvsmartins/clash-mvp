import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { GuildConfigData } from '#functions';

// ─── helpers ─────────────────────────────────────────────────────────────────

const mention = (id: string, type: 'channel' | 'role') =>
    id ? (type === 'channel' ? `<#${id}>` : `<@&${id}>`) : '`Não configurado`';

const num = (v: number, suffix = '') => v ? `\`${v}${suffix}\`` : '`Não configurado`';

// ─── menu principal ───────────────────────────────────────────────────────────

export function configMainEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('⚙️ Painel de Configuração — ClashBet')
        .setDescription(
            'Selecione uma categoria abaixo para visualizar e editar as configurações do bot.\n\n' +
            '> 📡 **Canais** — canais onde o bot opera\n' +
            '> 🎭 **Roles** — cargos atribuídos e mencionados\n' +
            '> 💰 **Financeiro** — taxas e valores\n' +
            '> ⏱️ **Operacional** — tempos e comportamentos',
        )
        .setColor(0x5865f2)
        .setFooter({ text: 'Apenas staff pode alterar configurações' })
        .setTimestamp();
}

export function configMainRow(): ActionRowBuilder<StringSelectMenuBuilder> {
    const select = new StringSelectMenuBuilder()
        .setCustomId('config/menu')
        .setPlaceholder('Escolha uma categoria...')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('📡 Canais')
                .setDescription('Canais onde o bot opera')
                .setValue('channels'),
            new StringSelectMenuOptionBuilder()
                .setLabel('🎭 Roles')
                .setDescription('Cargos atribuídos e mencionados')
                .setValue('roles'),
            new StringSelectMenuOptionBuilder()
                .setLabel('💰 Financeiro')
                .setDescription('Taxas e valores')
                .setValue('financial'),
            new StringSelectMenuOptionBuilder()
                .setLabel('⏱️ Operacional')
                .setDescription('Tempos e comportamentos')
                .setValue('operational'),
        );

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

// ─── categoria: canais ────────────────────────────────────────────────────────

export function configChannelsEmbed(config: GuildConfigData): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('📡 Configuração — Canais')
        .setDescription('Configure os canais onde o bot irá operar.')
        .addFields(
            {
                name: '📣 Canal de Fila',
                value: mention(config.channelQueue, 'channel'),
                inline: true,
            },
            {
                name: '🔔 Canal de Alertas',
                value: mention(config.channelAlerts, 'channel'),
                inline: true,
            },
            {
                name: '🎧 Canal de Suporte',
                value: mention(config.channelSupport, 'channel'),
                inline: true,
            },
        )
        .setColor(0x3498db)
        .setFooter({ text: 'Clique em Editar para alterar um canal' });
}

export function configChannelsRows(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/edit/channelQueue')
            .setLabel('Editar Canal de Fila')
            .setEmoji('📣')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('config/edit/channelAlerts')
            .setLabel('Editar Canal de Alertas')
            .setEmoji('🔔')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('config/edit/channelSupport')
            .setLabel('Editar Canal de Suporte')
            .setEmoji('🎧')
            .setStyle(ButtonStyle.Primary),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/back')
            .setLabel('Voltar')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary),
    );

    return [row1, row2];
}

// ─── categoria: roles ─────────────────────────────────────────────────────────

export function configRolesEmbed(config: GuildConfigData): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('🎭 Configuração — Roles')
        .setDescription('Configure os cargos gerenciados e mencionados pelo bot.')
        .addFields(
            {
                name: '✅ Role Registrado',
                value: mention(config.roleRegistered, 'role'),
                inline: true,
            },
            {
                name: '🛡️ Role Staff',
                value: mention(config.roleStaff, 'role'),
                inline: true,
            },
            {
                name: '👥 Role Disponível',
                value: mention(config.roleAvailable, 'role'),
                inline: true,
            },
        )
        .setColor(0x9b59b6)
        .setFooter({ text: 'Clique em Editar para alterar um cargo' });
}

export function configRolesRows(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/edit/roleRegistered')
            .setLabel('Editar Role Registrado')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('config/edit/roleStaff')
            .setLabel('Editar Role Staff')
            .setEmoji('🛡️')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('config/edit/roleAvailable')
            .setLabel('Editar Role Disponível')
            .setEmoji('👥')
            .setStyle(ButtonStyle.Primary),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/back')
            .setLabel('Voltar')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary),
    );

    return [row1, row2];
}

// ─── categoria: financeiro ────────────────────────────────────────────────────

export function configFinancialEmbed(config: GuildConfigData): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('💰 Configuração — Financeiro')
        .setDescription('Configure taxas e parâmetros financeiros da plataforma.')
        .addFields(
            {
                name: '💸 Taxa de Depósito',
                value: num(config.depositFee, ' centavos'),
                inline: true,
            },
        )
        .setColor(0x2ecc71)
        .setFooter({ text: 'Valores em centavos (100 = R$ 1,00)' });
}

export function configFinancialRows(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/edit/depositFee')
            .setLabel('Editar Taxa de Depósito')
            .setEmoji('💸')
            .setStyle(ButtonStyle.Primary),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/back')
            .setLabel('Voltar')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary),
    );

    return [row1, row2];
}

// ─── categoria: operacional ───────────────────────────────────────────────────

export function configOperationalEmbed(config: GuildConfigData): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('⏱️ Configuração — Operacional')
        .setDescription('Configure tempos e comportamentos do bot.')
        .addFields(
            {
                name: '⏳ Minutos de espera na fila',
                value: num(config.queueWaitMinutes, ' min'),
                inline: true,
            },
        )
        .setColor(0xe67e22)
        .setFooter({ text: 'Tempo antes de o bot alertar membros disponíveis' });
}

export function configOperationalRows(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/edit/queueWaitMinutes')
            .setLabel('Editar Minutos de Fila')
            .setEmoji('⏳')
            .setStyle(ButtonStyle.Primary),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('config/back')
            .setLabel('Voltar')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary),
    );

    return [row1, row2];
}

// ─── metadados dos campos ─────────────────────────────────────────────────────

export const FIELD_META: Record<string, { label: string; placeholder: string; isNumber?: boolean }> = {
    channelQueue:   { label: 'ID do Canal de Fila',      placeholder: 'Ex: 123456789012345678' },
    channelAlerts:  { label: 'ID do Canal de Alertas',   placeholder: 'Ex: 123456789012345678' },
    channelSupport: { label: 'ID do Canal de Suporte',   placeholder: 'Ex: 123456789012345678' },
    roleRegistered: { label: 'ID da Role Registrado',    placeholder: 'Ex: 123456789012345678' },
    roleStaff:      { label: 'ID da Role Staff',         placeholder: 'Ex: 123456789012345678' },
    roleAvailable:  { label: 'ID da Role Disponível',    placeholder: 'Ex: 123456789012345678' },
    depositFee:       { label: 'Taxa de depósito (centavos)', placeholder: 'Ex: 10', isNumber: true },
    queueWaitMinutes: { label: 'Minutos de espera na fila',   placeholder: 'Ex: 1',  isNumber: true },
};
