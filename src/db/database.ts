import mongoose from 'mongoose';
import config from '../../config';

const { mongodbUri } = config;
mongoose.connect(mongodbUri!)

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  fixedMessageId: String,
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  clashTag: String,
  moedas: {type: Number, default: 0.0}
});

const confrmationsSchema = new mongoose.Schema({
  channelId: {type: String, require: true, unique: true},
  user1: {type: String, require: true},
  user2: {type: String, require: true},
  messageId: {type: String, require: true},
  date: {type: Date, require: true},
  price: {type: Number},
})

const match = new mongoose.Schema({
  channelId: {type:String, require:true, unique:true},
  match: {type: String, require:true},
  winner: {type: String, require:true},
  date: {type:String, require:true},
})

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Referência ao usuário
  type: { type: String, required: true }, // Tipo de transação: 'saque', 'deposito', 'partida'
  amount: { type: Number, required: true }, // Valor da transação
  description: { type: String, required: true }, // Descrição do gasto ou motivo
  date: { type: Date, default: Date.now }, // Data e hora da transação
});


export const Guild = mongoose.model('Guild', guildSchema);
export const User = mongoose.model('User', userSchema);
export const Confirmation = mongoose.model('Confirmations', confrmationsSchema);
export const Match = mongoose.model('Match', match)
export const Transaction = mongoose.model('Transaction', transactionSchema);