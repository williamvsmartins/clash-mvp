/**
 * Configurações centrais da plataforma ClashBet.
 * Todos os valores financeiros são em centavos (inteiros).
 * Altere aqui para ajustar o modelo de negócio sem tocar no resto do código.
 *
 * Plano de negócios base: 26/09/2024
 * Projeção otimista: R$ 1.206.720,00/ano com 5.000 duelos/dia
 */

// ─── Comissão da casa ────────────────────────────────────────────────────────

/** Percentual retido pela plataforma sobre o pote total de cada partida (0–1). */
export const RAKE_RATE = 0.10; // 10%

// ─── Sistema de escada ────────────────────────────────────────────────────────

/**
 * Níveis de aposta disponíveis.
 * `aposta` = valor por jogador (centavos).
 * `premio` = valor creditado ao vencedor (centavos) = pote total × (1 - RAKE_RATE).
 *
 * Regra da escada: prêmio do nível N ≥ aposta do nível N+1,
 * incentivando o vencedor a reinvestir no próximo nível.
 */
export const LADDER: Array<{ nivel: number; aposta: number; premio: number }> = [
    { nivel: 1,  aposta:   50, premio:    90 }, // R$  0,50 → R$  0,90
    { nivel: 2,  aposta:   90, premio:   162 }, // R$  0,90 → R$  1,62
    { nivel: 3,  aposta:  160, premio:   288 }, // R$  1,60 → R$  2,88
    { nivel: 4,  aposta:  280, premio:   504 }, // R$  2,80 → R$  5,04
    { nivel: 5,  aposta:  500, premio:   900 }, // R$  5,00 → R$  9,00
    { nivel: 6,  aposta:  900, premio:  1620 }, // R$  9,00 → R$ 16,20
    { nivel: 7,  aposta: 1600, premio:  2880 }, // R$ 16,00 → R$ 28,80
    { nivel: 8,  aposta: 2800, premio:  5040 }, // R$ 28,00 → R$ 50,40
    { nivel: 9,  aposta: 5000, premio:  9000 }, // R$ 50,00 → R$ 90,00
    { nivel: 10, aposta: 9000, premio: 16200 }, // R$ 90,00 → R$162,00
    { nivel: 11, aposta:16000, premio: 28800 }, // R$160,00 → R$288,00
    { nivel: 12, aposta:28000, premio: 50400 }, // R$280,00 → R$504,00
];

// ─── Bônus e engajamento ──────────────────────────────────────────────────────

/** Bônus de login diário (centavos). Suficiente para uma aposta no nível 1. */
export const BONUS_LOGIN_DIARIO = 50; // R$ 0,50

/** Bônus pela primeira vitória do dia (centavos). */
export const BONUS_PRIMEIRA_VITORIA = 25; // R$ 0,25

// ─── Projeção de lucro (referência) ──────────────────────────────────────────

/**
 * Lucro médio por duelo (centavos).
 * Calculado com base na média ponderada dos níveis da escada.
 * Duelo padrão (nível 1): pote = R$1,00 → rake = R$0,10 → lucro R$0,10 por duelo... mas a
 * projeção do plano usa R$0,6704/duelo como média entre todos os níveis e volumes.
 *
 * Projeção estimada:
 *   100  duelos/dia →  R$    67,04/dia → R$  24.134,40/ano
 *   500  duelos/dia →  R$   335,20/dia → R$ 120.672,00/ano
 *  1000  duelos/dia →  R$   670,40/dia → R$ 241.344,00/ano
 *  2500  duelos/dia →  R$ 1.676,00/dia → R$ 603.360,00/ano
 *  5000  duelos/dia →  R$ 3.352,00/dia → R$1.206.720,00/ano
 */
export const LUCRO_MEDIO_POR_DUELO_CENTAVOS = 6704; // R$ 67,04 / 100 duelos

// ─── Sociedade ────────────────────────────────────────────────────────────────

export const SOCIEDADE = {
    socio1:    { participacao: 0.425, nome: 'Sócio Fundador 1' },
    socio2:    { participacao: 0.425, nome: 'Sócio Fundador 2' },
    novoSocio: { participacao: 0.150, nome: 'Novo Sócio'       },
} as const;

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Calcula o prêmio líquido (já com rake descontado) dado o pote bruto.
 * Use sempre esta função em vez de calcular manualmente.
 */
export const calcularPremio = (pote: number): { premioVencedor: number; rakePlataforma: number } => {
    const rakePlataforma = Math.floor(pote * RAKE_RATE);
    const premioVencedor = pote - rakePlataforma;
    return { premioVencedor, rakePlataforma };
};
