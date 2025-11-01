import { Command } from '#base';
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { 
    configureVerification, 
    getVerificationStatus, 
    setMockScenario, 
    getMockScenarios,
    verifyMatch,
    validatePlayers,
    listRules
} from '#functions';

new Command({
    name: 'clash-test',
    description: 'Comandos para testar a verificação de partidas do Clash Royale',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'acao',
            description: 'Ação a ser executada',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Status', value: 'status' },
                { name: 'Modo Mock', value: 'mock' },
                { name: 'Modo Real', value: 'real' },
                { name: 'Listar Cenários', value: 'scenarios' },
                { name: 'Definir Cenário', value: 'set_scenario' },
                { name: 'Testar Verificação', value: 'verify' },
                { name: 'Validar Jogadores', value: 'validate' },
                { name: 'Listar Regras', value: 'rules' }
            ]
        },
        {
            name: 'parametro1',
            description: 'Parâmetro adicional (tag1, cenário, etc.)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'parametro2',
            description: 'Parâmetro adicional (tag2, minutos, etc.)',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction) {
        const acao = interaction.options.getString('acao', true);
        const param1 = interaction.options.getString('parametro1');
        const param2 = interaction.options.getString('parametro2');

        await interaction.deferReply({ ephemeral: true });

        try {
            switch (acao) {
                case 'status': {
                    const status = await getVerificationStatus();
                    
                    const statusEmbed = new EmbedBuilder()
                        .setColor(status.api ? 0x00FF00 : 0xFF0000)
                        .setTitle('🔍 Status da Verificação de Partidas')
                        .addFields(
                            { name: '🌐 API Real', value: status.api ? '✅ Online' : '❌ Offline', inline: true },
                            { name: '🎭 Mock', value: status.mock ? '✅ Disponível' : '❌ Indisponível', inline: true },
                            { name: '⚙️ Modo Atual', value: status.currentMode === 'mock' ? '🎭 Mock' : '🌐 Real', inline: true },
                            { name: '🕐 Timeout', value: `${status.config.timeoutMinutes} minutos`, inline: true },
                            { name: '✅ Validação', value: status.config.enableValidation ? 'Ativada' : 'Desativada', inline: true }
                        )
                        .setTimestamp();

                    await interaction.followUp({ embeds: [statusEmbed] });
                    break;
                }

                case 'mock': {
                    configureVerification({ useMock: true });
                    await interaction.followUp({
                        content: '🎭 **Modo Mock ativado!**\nVerificações agora usarão cenários simulados.',
                    });
                    break;
                }

                case 'real': {
                    configureVerification({ useMock: false });
                    await interaction.followUp({
                        content: '🌐 **Modo Real ativado!**\nVerificações agora usarão a API real do Clash Royale.',
                    });
                    break;
                }

                case 'scenarios': {
                    const scenarios = getMockScenarios();
                    
                    const scenarioList = scenarios.map(s => 
                        `**${s.name}**\n${s.description}\n`
                    ).join('\n');

                    const scenariosEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('🎭 Cenários Mock Disponíveis')
                        .setDescription(scenarioList || 'Nenhum cenário disponível')
                        .setTimestamp();

                    await interaction.followUp({ embeds: [scenariosEmbed] });
                    break;
                }

                case 'set_scenario': {
                    if (!param1) {
                        await interaction.followUp({
                            content: '❌ **Erro:** Nome do cenário é obrigatório!\nUse: `/clash-test set_scenario NOME_DO_CENARIO`'
                        });
                        return;
                    }

                    const success = setMockScenario(param1);
                    
                    if (success) {
                        await interaction.followUp({
                            content: `✅ **Cenário "${param1}" definido com sucesso!**\nTodas as verificações mock agora usarão este cenário.`
                        });
                    } else {
                        await interaction.followUp({
                            content: `❌ **Cenário "${param1}" não encontrado!**\nUse \`/clash-test scenarios\` para ver cenários disponíveis.`
                        });
                    }
                    break;
                }

                case 'verify': {
                    if (!param1 || !param2) {
                        await interaction.followUp({
                            content: '❌ **Erro:** Duas tags são obrigatórias!\nUse: `/clash-test verify #TAG1 #TAG2`'
                        });
                        return;
                    }

                    const result = await verifyMatch({
                        player1Tag: param1,
                        player2Tag: param2,
                        matchStartTime: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
                        timeoutMinutes: 30
                    });

                    const resultEmbed = new EmbedBuilder()
                        .setColor(result.success ? 0x00FF00 : 0xFF0000)
                        .setTitle('🔍 Resultado da Verificação')
                        .addFields(
                            { name: '✅ Sucesso', value: result.success ? 'Sim' : 'Não', inline: true },
                            { name: '🏆 Vencedor', value: result.winner || 'Nenhum', inline: true }
                        );

                    if (result.result) {
                        resultEmbed.addFields(
                            { name: '👤 Player 1', value: `${result.result.player1.name} (${result.result.player1.crowns} 👑)`, inline: true },
                            { name: '👤 Player 2', value: `${result.result.player2.name} (${result.result.player2.crowns} 👑)`, inline: true },
                            { name: '🎮 Modo', value: result.result.gameMode, inline: true },
                            { name: '🏟️ Arena', value: result.result.arena, inline: true }
                        );
                    }

                    if (result.validation) {
                        resultEmbed.addFields(
                            { name: '📋 Validação', value: result.validation.valid ? '✅ Aprovada' : '❌ Rejeitada', inline: true },
                            { name: '📜 Regra', value: result.validation.appliedRule || 'N/A', inline: true }
                        );
                    }

                    if (result.error) {
                        resultEmbed.addFields(
                            { name: '❌ Erro', value: result.error, inline: false }
                        );
                    }

                    await interaction.followUp({ embeds: [resultEmbed] });
                    break;
                }

                case 'validate': {
                    if (!param1 || !param2) {
                        await interaction.followUp({
                            content: '❌ **Erro:** Duas tags são obrigatórias!\nUse: `/clash-test validate #TAG1 #TAG2`'
                        });
                        return;
                    }

                    const validation = await validatePlayers(param1, param2);

                    const validationEmbed = new EmbedBuilder()
                        .setColor((validation.player1Valid && validation.player2Valid) ? 0x00FF00 : 0xFF0000)
                        .setTitle('👥 Validação de Jogadores')
                        .addFields(
                            { 
                                name: `👤 Player 1 (${param1})`, 
                                value: validation.player1Valid ? 
                                    `✅ **${validation.player1Name}**` : 
                                    '❌ Tag inválida', 
                                inline: true 
                            },
                            { 
                                name: `👤 Player 2 (${param2})`, 
                                value: validation.player2Valid ? 
                                    `✅ **${validation.player2Name}**` : 
                                    '❌ Tag inválida', 
                                inline: true 
                            }
                        )
                        .setTimestamp();

                    await interaction.followUp({ embeds: [validationEmbed] });
                    break;
                }

                case 'rules': {
                    const rules = listRules();
                    
                    const rulesText = rules.map(rule => 
                        `**${rule.name}** (Prioridade: ${rule.priority})\n${rule.description}\n`
                    ).join('\n');

                    const rulesEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('📜 Regras de Validação Ativas')
                        .setDescription(rulesText || 'Nenhuma regra configurada')
                        .setFooter({ text: 'Regras são executadas em ordem de prioridade (maior → menor)' })
                        .setTimestamp();

                    await interaction.followUp({ embeds: [rulesEmbed] });
                    break;
                }

                default: {
                    await interaction.followUp({
                        content: '❌ **Ação não reconhecida!**'
                    });
                    break;
                }
            }

        } catch (error) {
            console.error('Erro no comando clash-test:', error);
            await interaction.followUp({
                content: '❌ **Erro interno durante a execução do comando.**'
            });
        }
    }
});