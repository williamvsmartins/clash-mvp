import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    fixedMessageId: String,
});

export const Guild = mongoose.model('Guild', guildSchema);