import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '#base';
import { MatchLog } from '#database';

new Command({
    name: 'historico',
    description: 'Consulta o log de mensagens de uma partida encerrada',
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: [
        {
            name: 'canal',
            description: 'ID do canal da partida',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'jogador',
            description: 'Mencione um jogador para ver os logs dele',
            type: ApplicationCommandOptionType.User,
            required: false,
        },
        {
            name: 'pagina',
            description: 'Página dos resultados (padrão: 1)',
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 1,
        },
    ],
    async run(interaction) {
        await interaction.deferReply({ ephemeral });

        const channelId = interaction.options.getString('canal');
        const targetUser = interaction.options.getUser('jogador');
        const page = (interaction.options.getInteger('pagina') ?? 1) - 1;
        const perPage = 5;

        if (!channelId && !targetUser) {
            await interaction.editReply({ content: '❌ Informe um **ID de canal** ou um **jogador**.' });
            return;
        }

        try {
            if (channelId) {
                // Busca log específico de um canal
                const log = await MatchLog.findOne({ channelId });

                if (!log) {
                    await interaction.editReply({ content: `❌ Nenhum log encontrado para o canal \`${channelId}\`.` });
                    return;
                }

                const content = buildLogText(log);
                const buffer = Buffer.from(content, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: `log-${channelId}.txt` });

                const outcomeLabel: Record<string, string> = {
                    finished:  '🏆 Finalizada',
                    draw:      '🤝 Empate',
                    cancelled: '❌ Cancelada',
                };

                await interaction.editReply({
                    content: [
                        `**📋 Log da partida** \`${channelId}\``,
                        `**Resultado:** ${outcomeLabel[log.outcome] ?? log.outcome}`,
                        `**Jogadores:** <@${log.player1UserId}> vs <@${log.player2UserId}>`,
                        log.winnerUserId ? `**Vencedor:** <@${log.winnerUserId}>` : '',
                        `**Apostado:** R$ ${(log.price / 100).toFixed(2).replace('.', ',')}`,
                        `**Mensagens:** ${log.messages.length}`,
                        `**Data:** ${log.createdAt.toLocaleString('pt-BR')}`,
                    ].filter(Boolean).join('\n'),
                    files: [attachment],
                });

            } else if (targetUser) {
                // Lista os logs de um jogador com paginação
                const filter = {
                    $or: [
                        { player1UserId: targetUser.id },
                        { player2UserId: targetUser.id },
                    ],
                };

                const total = await MatchLog.countDocuments(filter);
                const logs = await MatchLog.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(page * perPage)
                    .limit(perPage);

                if (logs.length === 0) {
                    await interaction.editReply({ content: `❌ Nenhum log encontrado para ${targetUser}.` });
                    return;
                }

                const outcomeEmoji: Record<string, string> = {
                    finished:  '🏆',
                    draw:      '🤝',
                    cancelled: '❌',
                };

                const lines = logs.map((l, i) => {
                    const emoji = outcomeEmoji[l.outcome] ?? '❓';
                    const date  = l.createdAt.toLocaleDateString('pt-BR');
                    const price = `R$ ${(l.price / 100).toFixed(2).replace('.', ',')}`;
                    const won   = l.winnerUserId === targetUser.id ? ' ✅ venceu' : l.outcome === 'finished' ? ' ❌ perdeu' : '';
                    return `${page * perPage + i + 1}. ${emoji} \`${l.channelId}\` — ${price}${won} — ${date}`;
                });

                const totalPages = Math.ceil(total / perPage);

                await interaction.editReply({
                    content: [
                        `**📋 Histórico de ${targetUser}** (${total} partidas — página ${page + 1}/${totalPages})`,
                        '',
                        lines.join('\n'),
                        '',
                        `Use \`/historico canal:<id>\` para ver o log completo de uma partida.`,
                    ].join('\n'),
                });
            }
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            await interaction.editReply({ content: '❌ Erro interno ao buscar histórico.' });
        }
    }
});

function buildLogText(log: InstanceType<typeof MatchLog>): string {
    const lines: string[] = [
        `=== LOG DA PARTIDA ===`,
        `Canal ID : ${log.channelId}`,
        `Resultado: ${log.outcome}`,
        `Jogador 1: ${log.player1UserId}`,
        `Jogador 2: ${log.player2UserId}`,
        log.winnerUserId ? `Vencedor : ${log.winnerUserId}` : '',
        `Apostado : ${log.price} centavos (R$ ${(log.price / 100).toFixed(2)})`,
        `Data     : ${log.createdAt.toISOString()}`,
        ``,
        `=== MENSAGENS (${log.messages.length}) ===`,
        ``,
        ...log.messages.map(m => {
            const ts   = new Date(m.timestamp).toLocaleString('pt-BR');
            const head = `[${ts}] ${m.authorName} (${m.authorId})`;
            const body = m.content || '[sem texto]';
            const embeds = m.embeds.length
                ? m.embeds.map((e: any) => `  [embed] ${e.title ?? ''}: ${e.description ?? ''}`).join('\n')
                : '';
            return [head, body, embeds].filter(Boolean).join('\n');
        }),
    ].filter(s => s !== undefined);

    return lines.join('\n');
}
