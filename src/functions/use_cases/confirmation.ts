import { Confirmation } from '#database';

export const getConfirmations = async (channelId: string) => {
    try {
        const channel = await Confirmation.findOne({ channelId });
        return channel || null;
    } catch (error) {
        console.log('Erro ao buscar confirmação:', error);
        return null;
    }
};

export const getMessageId = async (channelId: string) => {
    try {
        const channel = await Confirmation.findOne({ channelId });
        return channel?.messageId || null;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getUser1 = async (channelId: string) => {
    try {
        const channel = await Confirmation.findOne({ channelId });
        return channel?.user1 || null;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getUser2 = async (channelId: string) => {
    try {
        const channel = await Confirmation.findOne({ channelId });
        return channel?.user2 || null;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getDate = async (channelId: string) => {
    try {
        const channel = await Confirmation.findOne({ channelId });
        return channel?.date || null;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getPrice = async (channelId: string) => {
    try {
        const channel = await Confirmation.findOne({ channelId });
        return channel?.price || null;
    } catch (error) {
        console.log(error);
        return null;
    }
};