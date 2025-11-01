import { MatchResult, ClashPlayer } from './service.js';

export interface MockScenario {
    name: string;
    description: string;
    player1Tag: string;
    player2Tag: string;
    result: MatchResult;
}

export class MockClashRoyaleService {
    private scenarios: Map<string, MockScenario> = new Map();
    private currentScenario: string | null = null;

    constructor() {
        this.loadDefaultScenarios();
    }

    /**
     * Define qual cenário usar para os próximos testes
     */
    setScenario(scenarioName: string): boolean {
        if (this.scenarios.has(scenarioName)) {
            this.currentScenario = scenarioName;
            return true;
        }
        return false;
    }

    /**
     * Adiciona um novo cenário de teste
     */
    addScenario(scenario: MockScenario): void {
        this.scenarios.set(scenario.name, scenario);
    }

    /**
     * Lista todos os cenários disponíveis
     */
    getScenarios(): MockScenario[] {
        return Array.from(this.scenarios.values());
    }

    /**
     * Obtém o cenário atual
     */
    getCurrentScenario(): MockScenario | null {
        return this.currentScenario ? this.scenarios.get(this.currentScenario) || null : null;
    }

    /**
     * Mock da verificação de partida
     */
    async verifyMatch(player1Tag: string, player2Tag: string): Promise<MatchResult | null> {
        if (!this.currentScenario) {
            return null;
        }

        const scenario = this.scenarios.get(this.currentScenario);
        if (!scenario) {
            return null;
        }

        // Verifica se as tags correspondem ao cenário
        const tagsMatch = (
            (scenario.player1Tag === player1Tag && scenario.player2Tag === player2Tag) ||
            (scenario.player1Tag === player2Tag && scenario.player2Tag === player1Tag)
        );

        if (!tagsMatch) {
            return null;
        }

        // Simula delay da API
        await new Promise(resolve => setTimeout(resolve, 100));

        return scenario.result;
    }

    /**
     * Mock de busca de jogador
     */
    async getPlayer(tag: string): Promise<ClashPlayer | null> {
        const mockPlayers: Record<string, ClashPlayer> = {
            'PLAYER1': {
                tag: '#PLAYER1',
                name: 'TestPlayer1',
                trophies: 5000,
                bestTrophies: 5500,
                wins: 1000,
                losses: 500,
                battleCount: 1500,
                threeCrownWins: 300,
                challengeCardsWon: 1000,
                challengeMaxWins: 12,
                tournamentCardsWon: 500,
                tournamentBattleCount: 50,
                donations: 2000,
                donationsReceived: 1500,
                totalDonations: 3500,
                warDayWins: 100,
                clanCardsCollected: 5000
            },
            'PLAYER2': {
                tag: '#PLAYER2',
                name: 'TestPlayer2',
                trophies: 4800,
                bestTrophies: 5200,
                wins: 800,
                losses: 600,
                battleCount: 1400,
                threeCrownWins: 250,
                challengeCardsWon: 800,
                challengeMaxWins: 10,
                tournamentCardsWon: 300,
                tournamentBattleCount: 30,
                donations: 1800,
                donationsReceived: 1200,
                totalDonations: 3000,
                warDayWins: 80,
                clanCardsCollected: 4000
            }
        };

        const cleanTag = tag.replace('#', '').toUpperCase();
        return mockPlayers[cleanTag] || null;
    }

    /**
     * Carrega cenários padrão para teste
     */
    private loadDefaultScenarios(): void {
        // Cenário 1: Player1 vence 3x0
        this.addScenario({
            name: 'PLAYER1_WINS_3_0',
            description: 'Player1 vence com 3 coroas contra 0',
            player1Tag: '#PLAYER1',
            player2Tag: '#PLAYER2',
            result: {
                winner: '#PLAYER1',
                player1: {
                    tag: '#PLAYER1',
                    name: 'TestPlayer1',
                    crowns: 3,
                    trophyChange: 30
                },
                player2: {
                    tag: '#PLAYER2',
                    name: 'TestPlayer2',
                    crowns: 0,
                    trophyChange: -30
                },
                battleTime: new Date().toISOString(),
                gameMode: 'Ladder',
                arena: 'Legendary Arena',
                valid: true
            }
        });

        // Cenário 2: Player2 vence 2x1
        this.addScenario({
            name: 'PLAYER2_WINS_2_1',
            description: 'Player2 vence com 2 coroas contra 1',
            player1Tag: '#PLAYER1',
            player2Tag: '#PLAYER2',
            result: {
                winner: '#PLAYER2',
                player1: {
                    tag: '#PLAYER1',
                    name: 'TestPlayer1',
                    crowns: 1,
                    trophyChange: -25
                },
                player2: {
                    tag: '#PLAYER2',
                    name: 'TestPlayer2',
                    crowns: 2,
                    trophyChange: 25
                },
                battleTime: new Date().toISOString(),
                gameMode: 'Ladder',
                arena: 'Legendary Arena',
                valid: true
            }
        });

        // Cenário 3: Empate 1x1 (deve falhar na validação)
        this.addScenario({
            name: 'DRAW_1_1',
            description: 'Empate 1x1 (deve ser rejeitado pelas regras)',
            player1Tag: '#PLAYER1',
            player2Tag: '#PLAYER2',
            result: {
                winner: null,
                player1: {
                    tag: '#PLAYER1',
                    name: 'TestPlayer1',
                    crowns: 1,
                    trophyChange: 0
                },
                player2: {
                    tag: '#PLAYER2',
                    name: 'TestPlayer2',
                    crowns: 1,
                    trophyChange: 0
                },
                battleTime: new Date().toISOString(),
                gameMode: 'Ladder',
                arena: 'Legendary Arena',
                valid: true
            }
        });

        // Cenário 4: Partida inválida
        this.addScenario({
            name: 'INVALID_BATTLE',
            description: 'Partida com dados inválidos',
            player1Tag: '#PLAYER1',
            player2Tag: '#PLAYER2',
            result: {
                winner: null,
                player1: {
                    tag: '#PLAYER1',
                    name: 'TestPlayer1',
                    crowns: 0,
                    trophyChange: null
                },
                player2: {
                    tag: '#PLAYER2',
                    name: 'TestPlayer2',
                    crowns: 0,
                    trophyChange: null
                },
                battleTime: new Date().toISOString(),
                gameMode: 'Unknown',
                arena: 'Unknown Arena',
                valid: false,
                reason: 'Batalha não encontrada'
            }
        });

        // Cenário 5: Modo de jogo inválido
        this.addScenario({
            name: 'INVALID_GAME_MODE',
            description: 'Vitória em modo de jogo não permitido para apostas',
            player1Tag: '#PLAYER1',
            player2Tag: '#PLAYER2',
            result: {
                winner: '#PLAYER1',
                player1: {
                    tag: '#PLAYER1',
                    name: 'TestPlayer1',
                    crowns: 2,
                    trophyChange: 0
                },
                player2: {
                    tag: '#PLAYER2',
                    name: 'TestPlayer2',
                    crowns: 1,
                    trophyChange: 0
                },
                battleTime: new Date().toISOString(),
                gameMode: 'Party Mode',
                arena: 'Party Arena',
                valid: true
            }
        });

        // Cenário 6: Nenhuma partida encontrada
        this.addScenario({
            name: 'NO_MATCH_FOUND',
            description: 'Nenhuma partida encontrada entre os jogadores',
            player1Tag: '#PLAYER1',
            player2Tag: '#PLAYER2',
            result: {
                winner: null,
                player1: {
                    tag: '#PLAYER1',
                    name: '',
                    crowns: 0,
                    trophyChange: null
                },
                player2: {
                    tag: '#PLAYER2',
                    name: '',
                    crowns: 0,
                    trophyChange: null
                },
                battleTime: '',
                gameMode: '',
                arena: '',
                valid: false,
                reason: 'Nenhuma partida encontrada no período especificado'
            }
        });
    }

    /**
     * Reseta para não usar nenhum cenário
     */
    clearScenario(): void {
        this.currentScenario = null;
    }

    /**
     * Remove um cenário
     */
    removeScenario(name: string): boolean {
        return this.scenarios.delete(name);
    }
}

// Instância singleton do mock service
export const mockClashRoyaleService = new MockClashRoyaleService();

// Funções de conveniência
export const setMockScenario = (scenarioName: string) => mockClashRoyaleService.setScenario(scenarioName);
export const clearMockScenario = () => mockClashRoyaleService.clearScenario();
export const addMockScenario = (scenario: MockScenario) => mockClashRoyaleService.addScenario(scenario);
export const getMockScenarios = () => mockClashRoyaleService.getScenarios();
export const getCurrentMockScenario = () => mockClashRoyaleService.getCurrentScenario();