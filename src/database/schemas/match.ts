import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
    {
        channelId:   { type: String, required: true, unique: true },
        player1Name: { type: String, required: true },
        player2Name: { type: String, required: true },
        winnerUserId: { type: String, required: true, index: true },
    },
    { timestamps: true }
);

matchSchema.index({ createdAt: -1 });

export const Match = mongoose.model('Match', matchSchema);
