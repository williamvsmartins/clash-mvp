import mongoose from 'mongoose';

export type ActiveMatchStatus =
    | 'awaiting_confirmation'
    | 'confirmed'
    | 'in_progress'
    | 'finished'
    | 'cancelled'
    | 'draw';

const activeMatchSchema = new mongoose.Schema(
    {
        channelId:    { type: String, required: true, unique: true },
        player1UserId: { type: String, required: true },
        player2UserId: { type: String, required: true },
        player1Tag:   { type: String, required: true },
        player2Tag:   { type: String, required: true },
        price:        { type: Number, required: true, min: 1 },
        startTime:    { type: Date, required: true },
        status: {
            type: String,
            enum: ['awaiting_confirmation', 'confirmed', 'in_progress', 'finished', 'cancelled', 'draw'] satisfies ActiveMatchStatus[],
            default: 'confirmed',
        },
        autoVerificationEnabled: { type: Boolean, default: false },
        verificationAttempts:    { type: Number, default: 0, min: 0, max: 10 },
        lastVerificationAttempt: { type: Date },
        timeoutMinutes:          { type: Number, default: 30, min: 1, max: 120 },
    },
    { timestamps: true }
);

activeMatchSchema.index({ channelId: 1 });
activeMatchSchema.index({ status: 1, autoVerificationEnabled: 1 });
activeMatchSchema.index({ startTime: 1 });
activeMatchSchema.index({ player1UserId: 1 });
activeMatchSchema.index({ player2UserId: 1 });

export const ActiveMatch = mongoose.model('ActiveMatch', activeMatchSchema);
