import mongoose from 'mongoose';

const activeMatchSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true },
    player1UserId: { type: String, required: true },
    player2UserId: { type: String, required: true },
    player1Tag: { type: String, required: true },
    player2Tag: { type: String, required: true },
    price: { type: Number, required: true }, // em centavos
    startTime: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['awaiting_confirmation', 'confirmed', 'in_progress', 'finished', 'cancelled'],
        default: 'confirmed' 
    },
    autoVerificationEnabled: { type: Boolean, default: false },
    verificationAttempts: { type: Number, default: 0 },
    lastVerificationAttempt: { type: Date },
    timeoutMinutes: { type: Number, default: 30 }
});

// Índices para otimização
activeMatchSchema.index({ channelId: 1 });
activeMatchSchema.index({ status: 1, autoVerificationEnabled: 1 });
activeMatchSchema.index({ startTime: 1 });

export const ActiveMatch = mongoose.model('ActiveMatch', activeMatchSchema);