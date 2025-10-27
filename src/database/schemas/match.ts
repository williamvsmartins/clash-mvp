import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true },
    match: { type: String, required: true },
    winner: { type: String, required: true },
    date: { type: String, required: true },
});

export const Match = mongoose.model('Match', matchSchema);