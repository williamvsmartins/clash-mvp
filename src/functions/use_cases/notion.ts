import { Client } from "@notionhq/client";
import { createStaticPix, hasError } from 'pix-utils';
import { env } from '#settings';

const notion = new Client({ auth: env.NOTION_API_KEY });

export const saveNotion = async (userId: string, pix: string, valor: number) => {
    try {
        const databaseId = env.DATABASE_ID;
        const valorFormatado = Number((valor / 100).toFixed(2));

        const codigoPix = gerarCodigoPix(pix, userId, 'São Luís', valor, userId);

        if (!databaseId) {
            throw new Error('O ID do banco de dados do Notion não foi definido.');
        }

        const dataAtual = new Date();
        const dataISO = new Date(dataAtual.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).toISOString();

        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                'ID': {
                    title: [{ text: { content: userId } }],
                },
                'Pix': {
                    rich_text: [{ text: { content: pix } }],
                },
                'Valor': {
                    number: valorFormatado,
                },
                'Pix Copia e Cola': {
                    rich_text: [{ text: { content: codigoPix || 'Invalida' } }],
                },
                'Data': {
                    date: { start: dataISO },
                },
            },
        });
    } catch (error) {
        console.error('Error saving to Notion:', error);
    }
};

export const saveDepositNotion = async (userId: string, valor: number) => {
    try {
        const databaseId = env.DATABASE_DEPOSIT_ID;
        const valorFormatado = (valor / 100).toFixed(2);

        if (!databaseId) {
            throw new Error('O ID do banco de dados do Notion não foi definido.');
        }

        const dataAtual = new Date();
        const dataISO = dataAtual.toISOString();

        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                'ID': {
                    title: [{ text: { content: userId } }],
                },
                'Valor': {
                    number: Number(valorFormatado),
                },
                'Data': {
                    date: { start: dataISO },
                },
            },
        });
    } catch (error) {
        console.error('Error saving to Notion:', error);
    }
};

export const gerarCodigoPix = (
    chavePix: string,
    nomeRecebedor: string,
    cidade: string,
    valor: number,
    descricao: string
): string | null => {
    const pix = createStaticPix({
        merchantName: nomeRecebedor,
        merchantCity: cidade,
        pixKey: chavePix,
        infoAdicional: descricao,
        transactionAmount: valor / 100,
    });

    if (!hasError(pix)) {
        return pix.toBRCode();
    }

    return null;
};