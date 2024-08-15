import axios from "axios";
import { TextChannel } from "discord.js";
import { getClashTag } from './getClashTag';

import config from '../config'

const { clashRoyaleApiToken } = config;


export const validMatch = async (user1: string, user2: string, channel: TextChannel, dateChannel: Date) => {
    try{

        const clashTagUser1 = await getClashTag(user1);
        const clashTagUser2 = await getClashTag(user2);

        const responseUser1 = await axios.get(`https://api.clashroyale.com/v1/players/%23${clashTagUser1}/battlelog`, {
            headers: { 'Authorization': `Bearer ${clashRoyaleApiToken}` },
        });

        if(responseUser1.data.length > 0){
        
            const oponent1 = responseUser1.data[0].opponent[0].tag

            const tag2 = `#${clashTagUser2}`

            if(oponent1 === tag2){
                const battleTimeUtc = responseUser1.data[0].battleTime;

                const formattedBattleTime = battleTimeUtc.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).*Z$/, '$1-$2-$3T$4:$5:$6Z');
                const battleDate = new Date(formattedBattleTime);
                const localDate = battleDate.toLocaleString();
                const dateChannelLocal = dateChannel.toLocaleString();

                console.log(responseUser1.data[0])

                if(localDate >= dateChannelLocal){
                    const crownsUser = responseUser1.data[0].team[0].crowns;
                    console.log(crownsUser)
                    const crownsOponnent = responseUser1.data[0].opponent[0].crowns;
                    console.log(crownsOponnent)

                    if(crownsUser > crownsOponnent){
                        channel.send(`Parabéns pela vitória <@${user1}>`)
                        channel.send(`Realizando pagamento...`)
                        // await paymentPix(0.01, 'alyssonpereira41@gmail.com')
                    } else if(crownsUser < crownsOponnent){
                        channel.send(`Parabéns pela vitória <@${user2}>`)
                        channel.send(`Realizando pagamento...`)
                        // await paymentPix(0.01, 'alyssonpereira41@gmail.com')
                    } else{
                        channel.send(`Que empate frenético foi esse????? Estaremos reembolsando os seus valores!`)
                        // await reembolsoPix(idTransition1, channel);
                        // await reembolsoPix(idTransition1, channel);
                    }

                } else{
                    channel.send(`Insconsistência na data da partida!!`)
                }
            } else{
                channel.send('tags imcompatíveis')
            }
        } else{
            channel.send(`erro ao verificar`)
        }

    } catch(error){
        channel.send(`error: ${error}`)
    }

}