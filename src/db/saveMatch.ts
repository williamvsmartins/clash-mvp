import { Match } from "./database";
import { getClashTag } from "./getClashTag";

export const saveMacth = async (channelId:string, tag1: string, tag2: string, winner: string, date: string) =>{
    try{

        const match = `${tag1} X ${tag2}`

        await Match.updateOne(
            {channelId},
            {match:match, winner:winner, date:date},
            {upsert:true},
        )

        console.log('partida salva com sucesso');

    }catch(error){

        console.log(error)

    }

}