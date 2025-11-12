import axios from 'axios';
import { env } from '#settings';

export async function getClashPlayer(tag: string) {
    const response = await axios.get(`https://proxy.royaleapi.dev/v1/players/%23${tag}`, {
        headers: { 'Authorization': `Bearer ${env.API_TOKEN}` }, 
    });
    return response.data;
}