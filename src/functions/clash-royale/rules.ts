import { MatchResult } from './service.js';

export const VALID_GAME_MODES = new Set([
    'Ladder',
    'Classic Challenge',
    'Grand Challenge',
    'Friendly Battle',
    'Tournament',
    'PvP',
]);

export interface MatchRule {
    name: string;
    description: string;
    validator: (result: MatchResult) => boolean;
    priority: number; // Maior prioridade = executa primeiro
}

export interface RuleResult {
    valid: boolean;
    reason?: string;
    appliedRule?: string;
}

export class MatchRuleEngine {
    private rules: MatchRule[] = [];

    constructor() {
        this.loadDefaultRules();
    }

    /**
     * Adiciona uma nova regra
     */
    addRule(rule: MatchRule): void {
        this.rules.push(rule);
        this.sortRules();
    }

    /**
     * Remove uma regra pelo nome
     */
    removeRule(name: string): boolean {
        const initialLength = this.rules.length;
        this.rules = this.rules.filter(rule => rule.name !== name);
        return this.rules.length < initialLength;
    }

    /**
     * Lista todas as regras
     */
    getRules(): MatchRule[] {
        return [...this.rules];
    }

    /**
     * Valida um resultado de partida contra todas as regras
     */
    validateMatch(result: MatchResult): RuleResult {
        if (!result.valid) {
            return {
                valid: false,
                reason: result.reason || 'Resultado inválido da API',
                appliedRule: 'API_VALIDATION'
            };
        }

        for (const rule of this.rules) {
            try {
                if (!rule.validator(result)) {
                    return {
                        valid: false,
                        reason: `Regra violada: ${rule.description}`,
                        appliedRule: rule.name
                    };
                }
            } catch (error) {
                console.error(`Erro ao executar regra ${rule.name}:`, error);
                return {
                    valid: false,
                    reason: `Erro interno na validação`,
                    appliedRule: rule.name
                };
            }
        }

        return {
            valid: true,
            appliedRule: 'ALL_RULES_PASSED'
        };
    }

    /**
     * Ordena regras por prioridade (maior prioridade primeiro)
     */
    private sortRules(): void {
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Carrega regras padrão do sistema
     */
    private loadDefaultRules(): void {
        // Regra 1: Deve haver um vencedor definido
        this.addRule({
            name: 'MUST_HAVE_WINNER',
            description: 'A partida deve ter um vencedor (não pode ser empate)',
            priority: 100,
            validator: (result) => result.winner !== null
        });

        // Regra 2: Vencedor deve ter mais coroas que o perdedor
        this.addRule({
            name: 'WINNER_MORE_CROWNS',
            description: 'O vencedor deve ter mais coroas que o perdedor',
            priority: 90,
            validator: (result) => {
                if (!result.winner) return false;
                
                const winner = result.winner === result.player1.tag ? result.player1 : result.player2;
                const loser = result.winner === result.player1.tag ? result.player2 : result.player1;
                
                return winner.crowns > loser.crowns;
            }
        });

        // Regra 2b: Consistência de trophyChange — o vencedor não pode ter trophyChange < 0
        // Aplica apenas quando a API retorna trophyChange (modo Ladder); ignora se ausente.
        this.addRule({
            name: 'TROPHY_CHANGE_CONSISTENCY',
            description: 'Mudança de troféus deve ser consistente com o resultado (vencedor não perde troféus)',
            priority: 85,
            validator: (result) => {
                if (!result.winner) return true;
                const winner = result.winner === result.player1.tag ? result.player1 : result.player2;
                const loser  = result.winner === result.player1.tag ? result.player2 : result.player1;
                if (winner.trophyChange !== null && winner.trophyChange < 0) return false;
                if (loser.trophyChange !== null && loser.trophyChange > 0) return false;
                return true;
            }
        });

        // Regra 3: Pelo menos um jogador deve ter pelo menos 1 coroa
        this.addRule({
            name: 'MIN_ONE_CROWN',
            description: 'Pelo menos um jogador deve ter conquistado pelo menos 1 coroa',
            priority: 80,
            validator: (result) => {
                return result.player1.crowns > 0 || result.player2.crowns > 0;
            }
        });

        // Regra 4: Modo de jogo deve ser válido para apostas (correspondência exata)
        this.addRule({
            name: 'VALID_GAME_MODE',
            description: 'Modo de jogo deve ser válido para apostas',
            priority: 70,
            validator: (result) => VALID_GAME_MODES.has(result.gameMode)
        });

        // Regra 5: Máximo de coroas deve ser respeitado (máximo 3 por jogador)
        this.addRule({
            name: 'MAX_CROWNS_LIMIT',
            description: 'Nenhum jogador pode ter mais de 3 coroas',
            priority: 60,
            validator: (result) => {
                return result.player1.crowns <= 3 && result.player2.crowns <= 3;
            }
        });

        // Regra 6: Coroas devem ser números válidos
        this.addRule({
            name: 'VALID_CROWN_COUNT',
            description: 'Número de coroas deve ser um valor válido (0-3)',
            priority: 50,
            validator: (result) => {
                const isValidCount = (crowns: number) => 
                    Number.isInteger(crowns) && crowns >= 0 && crowns <= 3;
                
                return isValidCount(result.player1.crowns) && 
                       isValidCount(result.player2.crowns);
            }
        });
    }
}

// Instância singleton do motor de regras
export const matchRuleEngine = new MatchRuleEngine();

// Funções de conveniência para configuração
export const addCustomRule = (rule: MatchRule) => matchRuleEngine.addRule(rule);
export const removeRule = (name: string) => matchRuleEngine.removeRule(name);
export const validateMatchResult = (result: MatchResult) => matchRuleEngine.validateMatch(result);
export const listRules = () => matchRuleEngine.getRules();

// Exemplo de uso para regras customizadas:
/*
// Adicionar regra que só aceita partidas onde o vencedor tem exatamente 3 coroas
addCustomRule({
    name: 'PERFECT_VICTORY_ONLY',
    description: 'Só aceita vitórias perfeitas (3 coroas)',
    priority: 85,
    validator: (result) => {
        if (!result.winner) return false;
        const winner = result.winner === result.player1.tag ? result.player1 : result.player2;
        return winner.crowns === 3;
    }
});

// Remover regra de empates se quiser permitir empates
removeRule('MUST_HAVE_WINNER');
*/