import mongoose from 'mongoose';

export type MatchLogOutcome = 'finished' | 'draw' | 'cancelled';

const messageEntrySchema = new mongoose.Schema(
    {
        authorId:   { type: String, required: true },
        authorName: { type: String, required: true },
        content:    { type: String, default: '' },
        embeds:     { type: [Object], default: [] },
        timestamp:  { type: Date, required: true },
    },
    { _id: false }
);

const matchLogSchema = new mongoose.Schema(
    {
        channelId:    { type: String, required: true, unique: true, index: true },
        player1UserId: { type: String, required: true, index: true },
        player2UserId: { type: String, required: true, index: true },
        price:        { type: Number, required: true },
        outcome:      { type: String, enum: ['finished', 'draw', 'cancelled'] satisfies MatchLogOutcome[], required: true },
        winnerUserId: { type: String, default: null },
        messages:     { type: [messageEntrySchema], default: [] },
    },
    { timestamps: true }
);

matchLogSchema.index({ createdAt: -1 });

export const MatchLog = mongoose.model('MatchLog', matchLogSchema);
