import mongoose from 'mongoose';

const confirmationsSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true },
    user1: { type: String, required: true },
    user2: { type: String, required: true },
    messageId: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: Number },
});

export const Confirmation = mongoose.model('Confirmations', confirmationsSchema);