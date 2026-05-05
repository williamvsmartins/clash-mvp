import mongoose from 'mongoose';

const confirmationSchema = new mongoose.Schema(
    {
        channelId: { type: String, required: true, unique: true },
        user1:     { type: String, required: true },
        user2:     { type: String, required: true },
        messageId: { type: String, required: true },
        price:     { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
);

confirmationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Confirmation = mongoose.model('Confirmation', confirmationSchema);
