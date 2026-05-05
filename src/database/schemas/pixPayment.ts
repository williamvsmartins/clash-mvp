import { Schema, model } from 'mongoose';

export type PixPaymentStatus = 'pending' | 'approved' | 'cancelled' | 'expired';

export interface IPixPayment {
    userId: string;
    mercadoPagoId: number;
    amount: number;
    status: PixPaymentStatus;
    qrCode: string;
    qrCodeBase64: string;
    createdAt: Date;
    updatedAt: Date;
}

const pixPaymentSchema = new Schema<IPixPayment>(
    {
        userId: { type: String, required: true, index: true },
        mercadoPagoId: { type: Number, required: true, unique: true },
        amount: { type: Number, required: true, min: 100 },
        status: {
            type: String,
            enum: ['pending', 'approved', 'cancelled', 'expired'] satisfies PixPaymentStatus[],
            default: 'pending',
            index: true,
        },
        qrCode: { type: String, required: true },
        qrCodeBase64: { type: String, required: true },
    },
    { timestamps: true }
);

pixPaymentSchema.index({ userId: 1, status: 1 });
pixPaymentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const PixPayment = model<IPixPayment>('PixPayment', pixPaymentSchema);
