import { User } from "./database";

export const getClashTag = async (id: string) => {
    try{
        const user = await User.findOne({ userId: id })

        if(user){
            return user.clashTag;
        } else{
            return null;
        }

    } catch(error){
        console.log(error)
    }
}