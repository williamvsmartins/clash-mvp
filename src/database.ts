import mongoose from 'mongoose';
import config from '../config';

const { mongodbUri } = config;
mongoose.connect(mongodbUri!);

const guildSchema = new mongoose.Schema({
  guildId: String,
  fixedMessageId: String,
});

const userSchema = new mongoose.Schema({
  userId: String,
  clashTag: String,
});

export const Guild = mongoose.model('Guild', guildSchema);
export const User = mongoose.model('User', userSchema);
