import { env } from '#settings';

export interface ClashPlayer {
    tag: string;
    name: string;
    trophies: number;
    bestTrophies: number;
    wins: number;
    losses: number;
    battleCount: number;
    threeCrownWins: number;
    challengeCardsWon: number;
    challengeMaxWins: number;
    tournamentCardsWon: number;
    tournamentBattleCount: number;
    role?: string;
    donations: number;
    donationsReceived: number;
    totalDonations: number;
    warDayWins: number;
    clanCardsCollected: number;
    clan?: {
        tag: string;
        name: string;
        badgeId: number;
    };
    arena?: {
        id: number;
        name: string;
    };
    leagueStatistics?: {
        currentSeason: {
            trophies: number;
            bestTrophies: number;
        };
        previousSeason: {
            id: string;
            trophies: number;
            bestTrophies: number;
        };
        bestSeason: {
            id: string;
            trophies: number;
        };
    };
    badges?: Array<{
        name: string;
        level: number;
        maxLevel: number;
        progress: number;
        target: number;
        iconUrls: {
            large: string;
        };
    }>;
    achievements?: Array<{
        name: string;
        stars: number;
        value: number;
        target: number;
        info: string;
        completionInfo?: string;
    }>;
    cards?: Array<{
        name: string;
        id: number;
        level: number;
        maxLevel: number;
        count: number;
        iconUrls: {
            medium: string;
        };
    }>;
    currentFavouriteCard?: {
        name: string;
        id: number;
        maxLevel: number;
        iconUrls: {
            medium: string;
        };
    };
    starPoints?: number;
    expPoints?: number;
    expLevel?: number;
}

export interface BattleLog {
    type: string;
    battleTime: string;
    isLadderTournament?: boolean;
    arena: {
        id: number;
        name: string;
    };
    gameMode: {
        id: number;
        name: string;
    };
    deckSelection?: string;
    team: Array<{
        tag: string;
        name: string;
        startingTrophies?: number;
        trophyChange?: number;
        crowns: number;
        kingTowerHitPoints?: number;
        princessTowersHitPoints?: number[];
        clan?: {
            tag: string;
            name: string;
            badgeId: number;
        };
        cards: Array<{
            name: string;
            id: number;
            level: number;
            maxLevel: number;
            iconUrls: {
                medium: string;
            };
        }>;
    }>;
    opponent: Array<{
        tag: string;
        name: string;
        startingTrophies?: number;
        trophyChange?: number;
        crowns: number;
        kingTowerHitPoints?: number;
        princessTowersHitPoints?: number[];
        clan?: {
            tag: string;
            name: string;
            badgeId: number;
        };
        cards: Array<{
            name: string;
            id: number;
            level: number;
            maxLevel: number;
            iconUrls: {
                medium: string;
            };
        }>;
    }>;
}

export interface MatchVerificationData {
    player1Tag: string;
    player2Tag: string;
    matchStartTime: Date;
    timeoutMinutes?: number;
}

export interface MatchResult {
    winner: string | null; // tag do vencedor ou null se empate
    player1: {
        tag: string;
        name: string;
        crowns: number;
        trophyChange: number | null;
    };
    player2: {
        tag: string;
        name: string;
        crowns: number;
        trophyChange: number | null;
    };
    battleTime: string;
    gameMode: string;
    arena: string;
    valid: boolean;
    reason?: string;
}

export class ClashRoyaleService {
    private readonly baseUrl = 'https://proxy.royaleapi.dev/v1';
    private readonly apiToken = env.API_TOKEN;

    /**
     * Busca informações de um jogador pelo tag
     */
    async getPlayer(tag: string): Promise<ClashPlayer | null> {
        try {
            const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
            const response = await fetch(`${this.baseUrl}/players/%23${cleanTag}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(response);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            return await response.json() as ClashPlayer;
        } catch (error) {
            console.error('Erro ao buscar jogador:', error);
            return null;
        }
    }

    /**
     * Busca o histórico de batalhas de um jogador
     */
    async getBattleLog(tag: string): Promise<BattleLog[]> {
        try {
            const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
            const response = await fetch(`${this.baseUrl}/players/%23${cleanTag}/battlelog`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            return await response.json() as BattleLog[];
        } catch (error) {
            console.error('Erro ao buscar histórico de batalhas:', error);
            return [];
        }
    }

    /**
     * Verifica se dois jogadores jogaram uma partida entre si
     */
    async verifyMatch(data: MatchVerificationData): Promise<MatchResult | null> {
        try {
            const { player1Tag, player2Tag, matchStartTime, timeoutMinutes = 30 } = data;

            // Define o período de busca
            const maxTime = new Date(matchStartTime.getTime() + (timeoutMinutes * 60 * 1000));

            const [player1Battles, player2Battles] = await Promise.all([
                this.getBattleLog(player1Tag),
                this.getBattleLog(player2Tag)
            ]);

            // A API do Clash Royale retorna battleTime no formato "20240101T120000.000Z"
            // que o JS não parseia corretamente. Converte para ISO 8601 antes de comparar.
            const parseBattleTime = (raw: string): Date => {
                // "20240101T120000.000Z" → "2024-01-01T12:00:00.000Z"
                const iso = raw.replace(
                    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
                    '$1-$2-$3T$4:$5:$6'
                );
                return new Date(iso);
            };

            // Filtra batalhas dentro do período válido
            const validBattles1 = player1Battles.filter(battle => {
                const battleTime = parseBattleTime(battle.battleTime);
                return battleTime >= matchStartTime && battleTime <= maxTime;
            });

            const validBattles2 = player2Battles.filter(battle => {
                const battleTime = parseBattleTime(battle.battleTime);
                return battleTime >= matchStartTime && battleTime <= maxTime;
            });

            console.log(`[verifyMatch] matchStartTime=${matchStartTime.toISOString()} maxTime=${maxTime.toISOString()}`);
            console.log(`[verifyMatch] player1 (${player1Tag}) battles total: ${player1Battles.length}, válidas: ${validBattles1.length}`);
            console.log(`[verifyMatch] player2 (${player2Tag}) battles total: ${player2Battles.length}, válidas: ${validBattles2.length}`);
            for (const b of validBattles1) console.log(`[verifyMatch]   p1 válida: ${b.battleTime} mode=${b.gameMode.name}`);
            for (const b of validBattles2) console.log(`[verifyMatch]   p2 válida: ${b.battleTime} mode=${b.gameMode.name}`);

            // Procura por uma batalha em comum
            const commonBattle = this.findCommonBattle(
                validBattles1,
                validBattles2,
                player1Tag,
                player2Tag
            );

            if (commonBattle) {
                return this.extractMatchResult(commonBattle, player1Tag, player2Tag);
            }

            return null;
        } catch (error) {
            console.error('Erro ao verificar partida:', error);
            return null;
        }
    }

    /**
     * Encontra uma batalha em comum entre dois jogadores
     */
    private findCommonBattle(
        battles1: BattleLog[], 
        battles2: BattleLog[], 
        player1Tag: string, 
        player2Tag: string
    ): BattleLog | null {
        for (const battle1 of battles1) {
            for (const battle2 of battles2) {
                // Verifica se é a mesma batalha (mesmo tempo e modo)
                if (battle1.battleTime === battle2.battleTime && 
                    battle1.gameMode.name === battle2.gameMode.name) {
                    
                    // Verifica se os jogadores estão em lados opostos
                    const player1InTeam = battle1.team.some(p => p.tag === `#${player1Tag.replace('#', '')}`);
                    const player2InOpponent = battle1.opponent.some(p => p.tag === `#${player2Tag.replace('#', '')}`);
                    
                    const player2InTeam = battle1.team.some(p => p.tag === `#${player2Tag.replace('#', '')}`);
                    const player1InOpponent = battle1.opponent.some(p => p.tag === `#${player1Tag.replace('#', '')}`);

                    console.log(`[findCommonBattle] candidata ${battle1.battleTime}: p1InTeam=${player1InTeam} p2InOpp=${player2InOpponent} p2InTeam=${player2InTeam} p1InOpp=${player1InOpponent}`);
                    if ((player1InTeam && player2InOpponent) || (player2InTeam && player1InOpponent)) {
                        return battle1;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Extrai o resultado da partida de uma batalha
     */
    private extractMatchResult(battle: BattleLog, player1Tag: string, player2Tag: string): MatchResult {
        const cleanPlayer1Tag = player1Tag.replace('#', '');
        const cleanPlayer2Tag = player2Tag.replace('#', '');

        // Encontra os jogadores na batalha
        let player1Data, player2Data;
        let player1Crowns = 0, player2Crowns = 0;

        // Verifica se player1 está no team ou opponent
        const player1InTeam = battle.team.find(p => p.tag === `#${cleanPlayer1Tag}`);
        const player1InOpponent = battle.opponent.find(p => p.tag === `#${cleanPlayer1Tag}`);

        if (player1InTeam) {
            player1Data = player1InTeam;
            player1Crowns = player1InTeam.crowns;
            // Player2 deve estar no opponent
            player2Data = battle.opponent.find(p => p.tag === `#${cleanPlayer2Tag}`);
            player2Crowns = player2Data?.crowns || 0;
        } else if (player1InOpponent) {
            player1Data = player1InOpponent;
            player1Crowns = player1InOpponent.crowns;
            // Player2 deve estar no team
            player2Data = battle.team.find(p => p.tag === `#${cleanPlayer2Tag}`);
            player2Crowns = player2Data?.crowns || 0;
        }

        if (!player1Data || !player2Data) {
            return {
                winner: null,
                player1: {
                    tag: player1Tag,
                    name: '',
                    crowns: 0,
                    trophyChange: null
                },
                player2: {
                    tag: player2Tag,
                    name: '',
                    crowns: 0,
                    trophyChange: null
                },
                battleTime: battle.battleTime,
                gameMode: battle.gameMode.name,
                arena: battle.arena.name,
                valid: false,
                reason: 'Jogadores não encontrados na batalha'
            };
        }

        // Determina o vencedor baseado nas coroas
        let winner: string | null = null;
        if (player1Crowns > player2Crowns) {
            winner = player1Tag;
        } else if (player2Crowns > player1Crowns) {
            winner = player2Tag;
        }
        // Se player1Crowns === player2Crowns, winner permanece null (empate)

        return {
            winner,
            player1: {
                tag: player1Tag,
                name: player1Data.name,
                crowns: player1Crowns,
                trophyChange: player1Data.trophyChange || null
            },
            player2: {
                tag: player2Tag,
                name: player2Data.name,
                crowns: player2Crowns,
                trophyChange: player2Data.trophyChange || null
            },
            battleTime: battle.battleTime,
            gameMode: battle.gameMode.name,
            arena: battle.arena.name,
            valid: true
        };
    }
}

export const clashRoyaleService = new ClashRoyaleService();