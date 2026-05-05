import { Transaction, User } from '#database';
import { saveNotion } from './notion.js';

export const getMoney = async (userId: string): Promise<number> => {
    try {
        const user = await User.findOne({ userId });
        return user?.moedas ?? 0;
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
        return 0;
    }
};

export const deposito = async (id: string, valor: number) => {
    const user = await User.findOne({ userId: id });
    if (!user) throw new Error(`Usuário ${id} não encontrado ao realizar depósito`);

    user.moedas += valor;
    await user.save();

    await Transaction.create({
        userId: id,
        type: 'depósito',
        amount: valor,
        description: 'Depósito via PIX',
    });
};

export const saque = async (id: string, valor: number, pix: string) => {
    const user = await User.findOne({ userId: id });
    if (!user) throw new Error(`Usuário ${id} não encontrado ao realizar saque`);

    user.moedas -= valor;
    await user.save();

    await Transaction.create({
        userId: id,
        type: 'saque',
        amount: -valor,
        description: `Saque solicitado. PIX: ${pix || 'não informado'}`,
    });

    await saveNotion(id, pix || 'pix nao informado', valor);
};

export const descontoPartida = async (userId1: string, userId2: string, valor: number) => {
    const [user1, user2] = await Promise.all([
        User.findOne({ userId: userId1 }),
        User.findOne({ userId: userId2 }),
    ]);

    if (!user1) throw new Error(`Usuário ${userId1} não encontrado ao aplicar desconto`);
    if (!user2) throw new Error(`Usuário ${userId2} não encontrado ao aplicar desconto`);

    user1.moedas -= valor;
    user2.moedas -= valor;
    await user1.save();
    await user2.save();

    await Transaction.create({
        userId: userId1,
        type: 'desconto',
        amount: -valor,
        description: 'Desconto para partida',
    });

    await Transaction.create({
        userId: userId2,
        type: 'desconto',
        amount: -valor,
        description: 'Desconto para partida',
    });
};

export const estornoPartida = async (userId1: string, userId2: string, valor: number) => {
    const [user1, user2] = await Promise.all([
        User.findOne({ userId: userId1 }),
        User.findOne({ userId: userId2 }),
    ]);

    if (user1) { user1.moedas += valor; await user1.save(); }
    if (user2) { user2.moedas += valor; await user2.save(); }

    const ops = [];
    if (user1) ops.push(Transaction.create({ userId: userId1, type: 'estorno', amount: valor, description: 'Estorno — falha ao criar partida' }));
    if (user2) ops.push(Transaction.create({ userId: userId2, type: 'estorno', amount: valor, description: 'Estorno — falha ao criar partida' }));
    await Promise.all(ops);
};

export const premio = async (userId: string, valor: number) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error(`Usuário ${userId} não encontrado ao conceder prêmio`);

    user.moedas += valor;
    await user.save();

    await Transaction.create({
        userId,
        type: 'premio',
        amount: valor,
        description: 'Prêmio de partida vencida',
    });
};