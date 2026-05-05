import mongoose from 'mongoose';

const CLASH_TAG_REGEX = /^[A-Z0-9]{3,}$/;

const userSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true, index: true },
        clashTag: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
            validate: {
                validator: (v: string) => CLASH_TAG_REGEX.test(v),
                message: 'clashTag must match pattern #[A-Z0-9]{3,} (without the # prefix)',
            },
        },
        balance: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
