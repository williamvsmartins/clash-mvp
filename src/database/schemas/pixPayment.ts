import { Schema, model } from 'mongoose';

export interface IPixPayment {
    userId: string;
    mercadoPagoId: number;
    valor: number;
    status: 'pending' | 'approved' | 'cancelled' | 'expired';
    qrCode: string;
    qrCodeBase64: string;
    createdAt: Date;
    updatedAt: Date;
}

const pixPaymentSchema = new Schema<IPixPayment>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        mercadoPagoId: {
            type: Number,
            required: true,
            unique: true,
        },
        valor: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'cancelled', 'expired'],
            default: 'pending',
        },
        qrCode: {
            type: String,
            required: true,
        },
        qrCodeBase64: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const PixPayment = model<IPixPayment>('PixPayment', pixPaymentSchema);
