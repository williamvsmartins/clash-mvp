import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema(
    {
        guildId:        { type: String, required: true, unique: true },
        fixedMessageId: String,

        channelQueue:   String,
        channelAlerts:  String,
        channelSupport: String,

        roleRegistered: String,
        roleStaff:      String,
        roleAvailable:  String,

        depositFee:     { type: Number, default: 10, min: 0, max: 10000 },
        queueWaitMinutes: { type: Number, default: 1, min: 1, max: 60 },
    },
    { timestamps: true }
);

export const Guild = mongoose.model('Guild', guildSchema);
