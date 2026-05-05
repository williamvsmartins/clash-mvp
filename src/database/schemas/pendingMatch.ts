import mongoose from 'mongoose';

const pendingMatchSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true },
    user1: { type: String, required: true },
    user2: { type: String, required: true },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const PendingMatch = mongoose.model('PendingMatch', pendingMatchSchema);
