import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    clashTag: String,
    moedas: { type: Number, default: 0 }
});

export const User = mongoose.model('User', userSchema);