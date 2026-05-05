import mongoose from 'mongoose';

export type TransactionType = 'deposit' | 'withdrawal' | 'match_debit' | 'refund' | 'prize';

const transactionSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        type: {
            type: String,
            required: true,
            enum: ['deposit', 'withdrawal', 'match_debit', 'refund', 'prize'] satisfies TransactionType[],
        },
        amount: { type: Number, required: true },
        description: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
