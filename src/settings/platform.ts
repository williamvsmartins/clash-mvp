/**
 * Central platform configuration for ClashBet.
 * All financial values are in centavos (integer).
 * Change here to adjust the business model without touching the rest of the code.
 */

// ─── House rake ──────────────────────────────────────────────────────────────

/** Percentage retained by the platform from the total pot per match (0–1). */
export const RAKE_RATE = 0.10; // 10%

// ─── Bet ladder ───────────────────────────────────────────────────────────────

/**
 * Available bet levels.
 * `wager` = amount per player (centavos).
 * `prize` = amount credited to winner (centavos) = total pot × (1 - RAKE_RATE).
 *
 * Ladder rule: prize of level N >= wager of level N+1,
 * incentivising the winner to reinvest at the next level.
 */
export const LADDER: Array<{ level: number; wager: number; prize: number }> = [
    { level:  1, wager:    50, prize:    90 }, // R$  0,50 → R$  0,90
    { level:  2, wager:    90, prize:   162 }, // R$  0,90 → R$  1,62
    { level:  3, wager:   160, prize:   288 }, // R$  1,60 → R$  2,88
    { level:  4, wager:   280, prize:   504 }, // R$  2,80 → R$  5,04
    { level:  5, wager:   500, prize:   900 }, // R$  5,00 → R$  9,00
    { level:  6, wager:   900, prize:  1620 }, // R$  9,00 → R$ 16,20
    { level:  7, wager:  1600, prize:  2880 }, // R$ 16,00 → R$ 28,80
    { level:  8, wager:  2800, prize:  5040 }, // R$ 28,00 → R$ 50,40
    { level:  9, wager:  5000, prize:  9000 }, // R$ 50,00 → R$ 90,00
    { level: 10, wager:  9000, prize: 16200 }, // R$ 90,00 → R$162,00
    { level: 11, wager: 16000, prize: 28800 }, // R$160,00 → R$288,00
    { level: 12, wager: 28000, prize: 50400 }, // R$280,00 → R$504,00
];

// ─── Bonuses & engagement ────────────────────────────────────────────────────

/** Daily login bonus (centavos). Enough for a free bet at level 1. */
export const DAILY_LOGIN_BONUS = 50; // R$ 0,50

/** First win of the day bonus (centavos). */
export const FIRST_WIN_BONUS = 25; // R$ 0,25

/**
 * Minutes without an opponent after the 1st player joins the queue
 * before alerting server members to find someone to play.
 */
export const QUEUE_NOTIFY_AFTER_MINUTES = 1;

// ─── Profit projection (reference only) ──────────────────────────────────────

/**
 * Average profit per duel (centavos).
 * Based on weighted average across ladder levels.
 *
 * Projected:
 *    100 duels/day →  R$    67.04/day → R$  24,134.40/year
 *    500 duels/day →  R$   335.20/day → R$ 120,672.00/year
 *  1,000 duels/day →  R$   670.40/day → R$ 241,344.00/year
 *  5,000 duels/day →  R$ 3,352.00/day → R$1,206,720.00/year
 */
export const AVG_PROFIT_PER_DUEL_CENTS = 6704; // R$ 67.04 / 100 duels

// ─── Partnership split ────────────────────────────────────────────────────────

export const PARTNERSHIP = {
    partner1:   { share: 0.425, name: 'Founding Partner 1' },
    partner2:   { share: 0.425, name: 'Founding Partner 2' },
    newPartner: { share: 0.150, name: 'New Partner'        },
} as const;

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Calculates the net prize (after rake) given the gross pot.
 * Always use this instead of computing manually.
 */
export const calcularPremio = (potCents: number): { premioVencedor: number; rakePlataforma: number } => {
    const rakePlataforma = Math.floor(potCents * RAKE_RATE);
    const premioVencedor = potCents - rakePlataforma;
    return { premioVencedor, rakePlataforma };
};
