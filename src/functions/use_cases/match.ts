import { TextChannel } from "discord.js";
import { ActiveMatch } from '#database';
import { verifyMatch, MatchVerificationData } from '../clash-royale/index.js';

export const deleteChannel = async (channel: TextChannel) => {
    try {
        await channel.send(`O canal será excluído em alguns segundos...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
        await channel.delete();
    } catch (error) {
        console.log('Erro ao deletar canal:', error);
        await channel.send("Erro ao deletar o canal, entre em contato com o suporte!");
    }
};

/**
 * Cria uma partida ativa no banco de dados
 */
export const createActiveMatch = async (data: {
    channelId: string;
    player1UserId: string;
    player2UserId: string;
    player1Tag: string;
    player2Tag: string;
    price: number;
    autoVerificationEnabled?: boolean;
    timeoutMinutes?: number;
}) => {
    try {
        const activeMatch = new ActiveMatch({
            channelId: data.channelId,
            player1UserId: data.player1UserId,
            player2UserId: data.player2UserId,
            player1Tag: data.player1Tag,
            player2Tag: data.player2Tag,
            price: data.price,
            startTime: new Date(),
            status: 'confirmed',
            autoVerificationEnabled: data.autoVerificationEnabled || false,
            timeoutMinutes: data.timeoutMinutes || 30
        });

        await activeMatch.save();
        return activeMatch;
    } catch (error) {
        console.error('Erro ao criar partida ativa:', error);
        throw error;
    }
};

/**
 * Verifica automaticamente o resultado de uma partida
 */
export const checkMatchResult = async (channelId: string) => {
    try {
        const activeMatch = await ActiveMatch.findOne({ channelId });

        if (!activeMatch) {
            return { success: false, error: 'Partida não encontrada' };
        }

        if (activeMatch.status !== 'confirmed' && activeMatch.status !== 'in_progress') {
            return { success: false, error: 'Partida não está em andamento' };
        }

        // Atualiza tentativas de verificação
        activeMatch.verificationAttempts += 1;
        activeMatch.lastVerificationAttempt = new Date();
        await activeMatch.save();

        const verificationData: MatchVerificationData = {
            player1Tag: activeMatch.player1Tag,
            player2Tag: activeMatch.player2Tag,
            matchStartTime: activeMatch.startTime,
            timeoutMinutes: activeMatch.timeoutMinutes
        };

        const result = await verifyMatch(verificationData);

        if (result.success) {
            // Verifica se houve empate
            if (result.winner === null) {
                // EMPATE - Reembolsa ambos os jogadores
                activeMatch.status = 'draw';
                await activeMatch.save();

                return {
                    success: true,
                    winner: null,
                    winnerUserId: null,
                    isDraw: true,
                    result: result.result,
                    player1UserId: activeMatch.player1UserId,
                    player2UserId: activeMatch.player2UserId,
                    price: activeMatch.price,
                    validation: {
                        appliedRule: 'EMPATE',
                        details: `Partida empatada: ${result.result?.player1.crowns} x ${result.result?.player2.crowns}`
                    }
                };
            }

            // PARTIDA COM VENCEDOR
            activeMatch.status = 'finished';
            await activeMatch.save();

            return {
                success: true,
                winner: result.winner,
                winnerUserId: result.winner === activeMatch.player1Tag ?
                    activeMatch.player1UserId : activeMatch.player2UserId,
                isDraw: false,
                result: result.result,
                price: activeMatch.price,
                validation: result.validation
            };
        }

        return {
            success: false,
            error: result.error || 'Partida ainda não finalizada ou não encontrada',
            attempts: activeMatch.verificationAttempts
        };

    } catch (error) {
        console.error('Erro ao verificar resultado da partida:', error);
        return { success: false, error: 'Erro interno na verificação' };
    }
};

/**
 * Finaliza uma partida manualmente
 */
export const finishMatch = async (channelId: string, winnerUserId: string) => {
    try {
        const activeMatch = await ActiveMatch.findOne({ channelId });

        if (!activeMatch) {
            return { success: false, error: 'Partida não encontrada' };
        }

        // Verifica se o usuário é um dos jogadores
        if (winnerUserId !== activeMatch.player1UserId && winnerUserId !== activeMatch.player2UserId) {
            return { success: false, error: 'Usuário não é participante desta partida' };
        }

        activeMatch.status = 'finished';
        await activeMatch.save();

        return {
            success: true,
            winner: winnerUserId,
            loser: winnerUserId === activeMatch.player1UserId ?
                activeMatch.player2UserId : activeMatch.player1UserId,
            price: activeMatch.price
        };

    } catch (error) {
        console.error('Erro ao finalizar partida:', error);
        return { success: false, error: 'Erro interno ao finalizar partida' };
    }
};

/**
 * Cancela uma partida
 */
export const cancelMatch = async (channelId: string) => {
    try {
        const activeMatch = await ActiveMatch.findOne({ channelId });

        if (!activeMatch) {
            return { success: false, error: 'Partida não encontrada' };
        }

        activeMatch.status = 'cancelled';
        await activeMatch.save();

        return {
            success: true,
            player1UserId: activeMatch.player1UserId,
            player2UserId: activeMatch.player2UserId,
            price: activeMatch.price
        };

    } catch (error) {
        console.error('Erro ao cancelar partida:', error);
        return { success: false, error: 'Erro interno ao cancelar partida' };
    }
};

/**
 * Lista partidas ativas para verificação automática
 */
export const getActiveMatchesForVerification = async () => {
    try {
        const cutoffTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutos atrás

        return await ActiveMatch.find({
            status: { $in: ['confirmed', 'in_progress'] },
            autoVerificationEnabled: true,
            $or: [
                { lastVerificationAttempt: { $exists: false } },
                { lastVerificationAttempt: { $lt: cutoffTime } }
            ],
            verificationAttempts: { $lt: 10 } // Máximo 10 tentativas
        });
    } catch (error) {
        console.error('Erro ao buscar partidas para verificação:', error);
        return [];
    }
};

/**
 * Atualiza o status de uma partida
 */
export const updateMatchStatus = async (channelId: string, status: string) => {
    try {
        const activeMatch = await ActiveMatch.findOneAndUpdate(
            { channelId },
            { status },
            { new: true }
        );

        return activeMatch;
    } catch (error) {
        console.error('Erro ao atualizar status da partida:', error);
        return null;
    }
};