import { clashRoyaleService, MatchVerificationData, MatchResult } from './service.js';
import { mockClashRoyaleService } from './mock.js';
import { validateMatchResult, RuleResult } from './rules.js';

export interface MatchVerificationResult {
    success: boolean;
    winner?: string;
    result?: MatchResult;
    validation?: RuleResult;
    error?: string;
}

export interface MatchVerificationConfig {
    useMock?: boolean;
    timeoutMinutes?: number;
    enableValidation?: boolean;
}

class MatchVerificationService {
    private config: MatchVerificationConfig = {
        useMock: false,
        timeoutMinutes: 30,
        enableValidation: true
    };

    /**
     * Configura o serviço de verificação
     */
    configure(config: Partial<MatchVerificationConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Obtém a configuração atual
     */
    getConfig(): MatchVerificationConfig {
        return { ...this.config };
    }

    /**
     * Verifica uma partida entre dois jogadores
     */
    async verifyMatch(data: MatchVerificationData): Promise<MatchVerificationResult> {
        try {
            let result: MatchResult | null;

            if (this.config.useMock) {
                // Usa o serviço mock
                result = await mockClashRoyaleService.verifyMatch(data.player1Tag, data.player2Tag);
            } else {
                // Usa a API real — preserva o timeoutMinutes do match se fornecido
                result = await clashRoyaleService.verifyMatch({
                    ...data,
                    timeoutMinutes: data.timeoutMinutes ?? this.config.timeoutMinutes
                });
            }

            if (!result) {
                return {
                    success: false,
                    error: 'Nenhuma partida encontrada entre os jogadores no período especificado'
                };
            }

            // Se a validação está habilitada, aplica as regras
            if (this.config.enableValidation) {
                const validation = validateMatchResult(result);
                
                if (!validation.valid) {
                    return {
                        success: false,
                        result,
                        validation,
                        error: validation.reason
                    };
                }

                return {
                    success: true,
                    winner: result.winner || undefined,
                    result,
                    validation
                };
            }

            // Sem validação, retorna o resultado direto
            return {
                success: true,
                winner: result.winner || undefined,
                result
            };

        } catch (error) {
            console.error('Erro na verificação de partida:', error);
            return {
                success: false,
                error: 'Erro interno durante a verificação'
            };
        }
    }

    /**
     * Valida se duas tags existem na API
     */
    async validatePlayers(player1Tag: string, player2Tag: string): Promise<{
        player1Valid: boolean;
        player2Valid: boolean;
        player1Name?: string;
        player2Name?: string;
    }> {
        try {
            const service = this.config.useMock ? mockClashRoyaleService : clashRoyaleService;

            const [player1, player2] = await Promise.all([
                service.getPlayer(player1Tag),
                service.getPlayer(player2Tag)
            ]);

            return {
                player1Valid: player1 !== null,
                player2Valid: player2 !== null,
                player1Name: player1?.name,
                player2Name: player2?.name
            };
        } catch (error) {
            console.error('Erro ao validar jogadores:', error);
            return {
                player1Valid: false,
                player2Valid: false
            };
        }
    }

    /**
     * Verifica o status do serviço
     */
    async getServiceStatus(): Promise<{
        api: boolean;
        mock: boolean;
        currentMode: 'api' | 'mock';
        config: MatchVerificationConfig;
    }> {
        try {
            // Testa a API real
            const apiTest = await clashRoyaleService.getPlayer('U92J9R29R'); // Tag que sempre existe
            const apiWorking = apiTest !== null;

            return {
                api: apiWorking,
                mock: true, // Mock sempre funciona
                currentMode: this.config.useMock ? 'mock' : 'api',
                config: this.config
            };
        } catch (error) {
            return {
                api: false,
                mock: true,
                currentMode: this.config.useMock ? 'mock' : 'api',
                config: this.config
            };
        }
    }
}

// Instância singleton do serviço
export const matchVerificationService = new MatchVerificationService();

// Funções de conveniência
export const verifyMatch = (data: MatchVerificationData) => 
    matchVerificationService.verifyMatch(data);

export const validatePlayers = (player1Tag: string, player2Tag: string) => 
    matchVerificationService.validatePlayers(player1Tag, player2Tag);

export const configureVerification = (config: Partial<MatchVerificationConfig>) =>
    matchVerificationService.configure(config);

export const getVerificationStatus = () => 
    matchVerificationService.getServiceStatus();

// Re-exporta funcionalidades dos outros módulos
export * from './service.js';
export * from './rules.js';
export * from './mock.js';

// Mock é ativado explicitamente via /clash-test — nunca automaticamente.