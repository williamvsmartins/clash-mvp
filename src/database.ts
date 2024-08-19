import mongoose from 'mongoose';
import config from '../config';

const { mongodbUri } = config;
mongoose.connect(mongodbUri!)

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  fixedMessageId: String,
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  clashTag: String,
  pix: String,
  moedas: {type: Number, default: 0.0}
});

export const Guild = mongoose.model('Guild', guildSchema);
export const User = mongoose.model('User', userSchema);
