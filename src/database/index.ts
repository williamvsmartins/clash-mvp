import mongoose from 'mongoose';
import { env } from '#settings';

export async function connectDatabase() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('✅ MongoDB conectado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

export * from './schemas/guild.js';
export * from './schemas/user.js';
export * from './schemas/confirmations.js';
export * from './schemas/match.js';
export * from './schemas/Transaction.js';
export * from './schemas/activeMatch.js';
export * from './schemas/pixPayment.js';
export * from './schemas/pendingMatch.js';