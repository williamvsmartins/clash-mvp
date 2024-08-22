import { Confirmation } from "./database";

export const getConfirmations = async (channelId: String) => {
    try{
        const channel = await Confirmation.findOne({ channelId: channelId })

        if(channel){
            return channel;
        } else{
            return null;
        }
    } catch(error){
        console.log(error)
    }
}

export const messageId = async (channelId: String) => {
    try{
        const channel = await Confirmation.findOne({ channelId: channelId })

        if(channel){
            return channel.messageId
        } else{
            return null;
        }
    } catch(error){
        console.log(error)
    }
}

export const getUser1 = async (channelId: String) => {
    try{
        const channel = await Confirmation.findOne({ channelId: channelId })

        if(channel){
            return channel.user1
        } else{
            return null;
        }
    } catch(error){
        console.log(error)
    }
}

export const getUser2 = async (channelId: String) => {
    try{
        const channel = await Confirmation.findOne({ channelId: channelId })

        if(channel){
            return channel.user2
        } else{
            return null;
        }
    } catch(error){
        console.log(error)
    }
}

export const getDate = async (channelId: String) => {
    try{
        const channel = await Confirmation.findOne({ channelId: channelId })

        if(channel){
            return channel.date
        } else{
            return null;
        }
    } catch(error){
        console.log(error)
    }
}

export const getPrice = async (channelId: String) => {
    try{
        const channel = await Confirmation.findOne({ channelId: channelId })

        if(channel){
            return channel.price
        } else{
            return null;
        }
    } catch(error){
        console.log(error)
    }
}