import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    clashTag: { type: String, unique: true, sparse: true },
    moedas: { type: Number, default: 0 }
});

export const User = mongoose.model('User', userSchema);