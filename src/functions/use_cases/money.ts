import { Transaction, User } from '#database';
import { calcularPremio } from '#settings';
import { saveNotion } from './notion.js';

export const getBalance = async (userId: string): Promise<number> => {
    try {
        const user = await User.findOne({ userId });
        return user?.balance ?? 0;
    } catch {
        return 0;
    }
};

export const creditDeposit = async (userId: string, amountCents: number) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error(`User ${userId} not found when crediting deposit`);

    user.balance += amountCents;
    await user.save();

    await Transaction.create({
        userId,
        type: 'deposit',
        amount: amountCents,
        description: 'Deposit via PIX',
    });
};

export const debitWithdrawal = async (userId: string, amountCents: number, pixKey: string) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error(`User ${userId} not found when debiting withdrawal`);

    user.balance -= amountCents;
    await user.save();

    await Transaction.create({
        userId,
        type: 'withdrawal',
        amount: -amountCents,
        description: `Withdrawal requested. PIX key: ${pixKey || 'not provided'}`,
    });

    await saveNotion(userId, pixKey || 'pix not provided', amountCents);
};

export const debitMatchFee = async (userId1: string, userId2: string, amountCents: number) => {
    const [user1, user2] = await Promise.all([
        User.findOne({ userId: userId1 }),
        User.findOne({ userId: userId2 }),
    ]);

    if (!user1) throw new Error(`User ${userId1} not found when debiting match fee`);
    if (!user2) throw new Error(`User ${userId2} not found when debiting match fee`);

    user1.balance -= amountCents;
    user2.balance -= amountCents;
    await user1.save();
    await user2.save();

    await Promise.all([
        Transaction.create({ userId: userId1, type: 'match_debit', amount: -amountCents, description: 'Match fee debit' }),
        Transaction.create({ userId: userId2, type: 'match_debit', amount: -amountCents, description: 'Match fee debit' }),
    ]);
};

export const refundMatchFee = async (userId1: string, userId2: string, amountCents: number) => {
    const [user1, user2] = await Promise.all([
        User.findOne({ userId: userId1 }),
        User.findOne({ userId: userId2 }),
    ]);

    const ops: Promise<unknown>[] = [];

    if (user1) {
        user1.balance += amountCents;
        ops.push(user1.save());
        ops.push(Transaction.create({ userId: userId1, type: 'refund', amount: amountCents, description: 'Refund — match creation failed' }));
    }
    if (user2) {
        user2.balance += amountCents;
        ops.push(user2.save());
        ops.push(Transaction.create({ userId: userId2, type: 'refund', amount: amountCents, description: 'Refund — match creation failed' }));
    }

    await Promise.all(ops);
};

export const creditPrize = async (userId: string, potCents: number) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error(`User ${userId} not found when crediting prize`);

    const { premioVencedor, rakePlataforma } = calcularPremio(potCents);

    user.balance += premioVencedor;
    await user.save();

    await Transaction.create({
        userId,
        type: 'prize',
        amount: premioVencedor,
        description: `Match prize (platform rake: ${rakePlataforma} cents)`,
    });
};
