import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guildId:        { type: String, required: true, unique: true },
    fixedMessageId: String,

    // Canais
    channelQueue:   String,
    channelAlerts:  String,
    channelSupport: String,

    // Roles
    roleRegistered: String,
    roleStaff:      String,
    roleAvailable:  String,

    // Parâmetros operacionais
    taxaDeposito:   { type: Number, default: 10 },
    minutosFila:    { type: Number, default: 1 },
});

export const Guild = mongoose.model('Guild', guildSchema);
