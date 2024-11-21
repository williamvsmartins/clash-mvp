import { Client } from "@notionhq/client";
import config from '../../config';

const { notion_api_key, database_deposit_id } = config;

const notion = new Client({ auth: notion_api_key })

export const saveDepositNotion = async (userId: string, valor: number) => {
    try {
        const databaseId = database_deposit_id;

        const valorFormatado = (valor / 100).toFixed(2);

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
            'Valor': {
                number: Number(valorFormatado),
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