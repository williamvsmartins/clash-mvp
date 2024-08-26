import { Client } from "@notionhq/client";
import config from '../../config';

const { notion_api_key, database_id } = config;

const notion = new Client({ auth: notion_api_key })

export const saveNotion = async (userId: string, pix:string, valor: number) => {
    try {
        const databaseId = database_id;

        if (!databaseId) {
        throw new Error('O ID do banco de dados do Notion não foi definido.');
        }

        const dataAtual = new Date();
        const dataISO = dataAtual.toISOString();

        const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
            'ID': {
                title: [
                    {
                    text: {
                        content: userId,
                    },
                    },
                ],
            },
            'Pix': {
                rich_text: [
                    {
                    text: {
                        content: pix,
                    },
                    },
                ],
            },
            'Valor': {
                number: valor,
            },
            'Data': {
                date: {
                    start: dataISO,
                },
            },
        },
        });
      } catch (error) {
        console.error('Error saving to Notion:', error);
      }

}
