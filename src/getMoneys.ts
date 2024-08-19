import { User } from "./database";

export const getMoney = async (id: string) => {
    try{
        const user = await User.findOne({ userId: id })

        if(user){
            return user.moedas;
        } else{
            return -1;
        }

    } catch(error){
        console.log(error)
        return -1;
    }
}